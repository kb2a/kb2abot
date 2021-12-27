import stringSimilarity from "string-similarity"
// import {google, detect} from "../../util/translate"
import Thread from "./models/Thread"

export default async function hook(err, message) {
	const {config, api} = this
	if (err) return console.error(err)
	if (!message) return

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

	const executeCommand = async (thread, command) => {
		const permission =
			command.permission[message.threadID] || command.permission["*"] || []

		if (permission != "*" && !config.superAdmins.includes(message.senderID)) {
			if (permission == "superAdmin") return "Bạn không thể sử dụng lệnh này!"
			if (permission == "admin") {
				try {
					if (
						(!config.refreshAdminIDs && thread.adminIDs.length == 0) ||
						config.refreshAdminIDs
					) {
						const info =
							thread.adminIDs || (await api.getThreadInfo(thread.id))
						thread.adminIDs = info.adminIDs
					}
					if (thread.adminIDs.includes(message.senderID))
						return "Chỉ admin mới có thể xài lệnh này!"
				} catch (e) {
					console.error(`Error while getting thread ${thread.id}'s info:`, e)
					return "Gặp lỗi khi đang lấy danh sách admin, vui lòng thử lại trong giây lát . . ."
				}
			}
			if (Array.isArray(permission)) {
				if (!permission.includes(message.senderID))
					return "Bạn không có quyền sử dụng lệnh này!"
			} else {
				console.error(
					`Wrong syntax for permission on command: "${command.keywords[0]}"`
				)
				return `Lệnh ${command.keywords[0]} này chưa được phân quyền`
			}
		}

		try {
			return await command.onCall(thread, message, reply, api)
		} catch (e) {
			// console.error(e)
			return e.stack
		}
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
			const commands = this.plugins
				.map(plugin => plugin.commands.recursiveFind(address))
				.flat()
			if (commands.length == 1) {
				try {
					const result = await executeCommand(thread, commands[0], reply)
					await thread.save()
					return result
				} catch (e) {
					console.log(e)
				}
			}
			if (commands.length > 1)
				return `Có ${commands.length} lệnh: ${commands
					.map(command => command.address.join("."))
					.join(", ")}\nBạn muốn xài lệnh nào? (${
					thread.prefix
				}help <lệnh> để xem chi tiết)`
			if (commands.length == 0) {
				const allKeywords = []
				for (const plugin of this.plugins)
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
