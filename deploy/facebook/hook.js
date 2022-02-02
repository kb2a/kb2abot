import stringSimilarity from "string-similarity"
import Thread from "./models/Thread.js"
import {error} from "../../util/logger.js"
import * as Label from "./label.js"
// import {google, detect} from "../../util/translate.js"

export default async function hook(err, message) {
	const {config, api, pluginManager} = this
	if (err) return error(Label.fca, "fca listenMqtt error:", err)
	if (!message) return

	/**
	 * Reply to a thread & messageID (this is facebook form, for now)
	 * @name reply
	 * @function
	 * @param  {string} text                           The message you want to send
	 * @param  {string|number} [threadID=message.threadID]    threadID
	 * @param  {string} [messageID=message.messageID]  messageID you want to reply
	 * @return {Promise} If error, return error
	 */
	const reply = async (
		text,
		threadID = message.threadID,
		messageID = message.messageID
	) => {
		// const lang = await detect(message)
		// if (lang != process.env.DEFAULT_LOCALE)
		// 	message = await google(message, lang, process.env.DEFAULT_LOCALE)
		return await api.sendMessage(text, threadID, messageID)
	}

	switch (message.type) {
	case "message_reply":
	case "message": {
		const thread = await getThread(message.threadID)
		message.args = message.body.split(" ").slice(1)
		if (message.body.indexOf(thread.prefix) == 0) {
			// is using command ==>
			const keyword = message.body.split(" ")[0].slice(thread.prefix.length) // lấy keyword của message
			const address = keyword.split(".")
			const commands = pluginManager
				.map(plugin => plugin.commands.recursiveFind(address))
				.flat()
			if (commands.length == 1) {
				const command = commands[0]
				const permission = command.permission[message.threadID] || command.permission["*"] || []
				if (permission != "*" && !config.superAdmins.includes(message.senderID)) {
					if (permission == "superAdmin") return "Bạn không thể sử dụng lệnh này!"
					if (permission == "admin") {
						if (
							(!config.refreshAdminIDs && thread.adminIDs.length == 0) ||
							config.refreshAdminIDs
						) {
							try {
								const info =
									thread.adminIDs || (await api.getThreadInfo(thread.id))
								thread.adminIDs = info.adminIDs
							}
							catch (err) {
								error(Label.fca, `Error while getting thread ${thread.id}'s info:`, err)
								return "Gặp lỗi khi đang lấy danh sách admin, vui lòng thử lại trong giây lát . . ."
							}
						}
						if (thread.adminIDs.includes(message.senderID))
							return "Chỉ admin mới có thể xài lệnh này!"
					}
					if (Array.isArray(permission)) {
						if (!permission.includes(message.senderID))
							return "Bạn không có quyền sử dụng lệnh này!"
					} else {
						error(
							Label.internalHook,
							`Syntax Error for field "permission" at command: "${command.keywords[0]}"`
						)
						return `Lệnh ${command.keywords[0]} này chưa được phân quyền`
					}
				}
				let result
				try {
					result = await command.onCall(thread, message, reply, api)
				}
				catch(err) {
					error(Label.internalHook, "Error while executing onCall command method:", err)
					return `Gặp lỗi khi đang thực thi ${message.body}:\n${err.message}`
				}
				try {
					await thread.save()
				}
				catch(err) {
					error(Label.datastore, "Error while saving thread storage:", err)
					return `Gặp lỗi khi đang lưu storage cho thread: ${err.message}`
				}
				return result
			}
			if (commands.length > 1)
				return `Có ${commands.length} lệnh: ${commands
					.map(command => command.address.join("."))
					.join(", ")}\nBạn muốn xài lệnh nào? (${
					thread.prefix
				}help <lệnh> để xem chi tiết)`
			if (commands.length == 0) {
				const allKeywords = []
				for (const plugin of pluginManager)
					plugin.commands.forEach(command =>
						allKeywords.push(...command.keywords)
					)
				if (allKeywords.length == 0) return "Chưa có lệnh nào đc load!"
				const {ratings} = stringSimilarity.findBestMatch(
					keyword,
					allKeywords
				)
				ratings.sort((a, b) => a.rating - b.rating)
				const bestMatches = ratings.slice(-3).map(item => item.target)
				return `Không tìm thấy lệnh: "${keyword}"\nGợi ý lệnh:\n${bestMatches.join(
					", "
				)}\nBạn có thể xem danh sách lệnh ở ${thread.prefix}help`
			}
		}
		for (const plugin of pluginManager) {
			try {
				await plugin.hook(thread, message, reply, api)
			}
			catch(err) {
				error(Label.pluginHook, `Error while executing ${plugin.package.name} hook:`, err)
			}
		}
		
		break
	}
	case "event":
		break
	case "typ":
		break
	case "read":
		break
	case "read_receipt":
		break
	case "message_reaction":
		break
	case "presence":
		break
	case "message_unsend":
		break
	}
}

async function getThread(threadID) {
	let thread
	try {
		thread = await Thread.findOne({id: threadID})
	} finally {
		if (!thread)
			thread = new Thread({
				id: threadID
			})
	}
	return thread
}
