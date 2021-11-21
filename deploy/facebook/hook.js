import stringSimilarity from "string-similarity"
import { google, detect } from "../../util/translate"
import api from "../../util/fca"
import { warn, error } from "../../util/logger"
import Thread from "./models/Thread"

export default async function hook(err, message) {
	const { config, api } = this
	if (err) return error(err)
	if (!message) return
		console.log(message)

	const reply = (message, threadID, messageID) => {
		return new Promise(async resolve => {
			const lang = await detect(message)
			if (lang != process.env.DEFAULT_LOCALE)
				message = await google(message, lang, process.env.DEFAULT_LOCALE)
			api.sendMessage(
				message,
				threadID || message.threadID,
				resolve,
				messageID || message.messageID
			)
		})
	}

	const executeCommand = async (thread, command) => {
		const permission =
			command.permission[message.threadID] || command.permission['*'] || []

		if (permission != "*" && !config.SUPER_ADMINS.includes(message.senderID)) {
			if (permission == 'superAdmin')
				return reply('Bạn không thể sử dụng lệnh này!')
			if (permission == 'admin') {
				try {
					if ((!config.REFRESH_ADMINS && thread.adminIDs.length == 0) || config.REFRESH_ADMINS) {
						const info = thread.adminIDs || await getThreadInfo(thread.id)
						thread.adminIDs = info.adminIDs
					}
					if (thread.adminIDs.includes(message.senderID))
						return reply('Chỉ admin mới có thể xài lệnh này!')
				} catch (e) {
					reply(
						'Gặp lỗi khi đang lấy danh sách admin, vui lòng thử lại trong giây lát . . .'
					)
					return warn(
						`Error while getting thread ${thread.id}'s info:`,
						e
					)
				}
			}
			if (Array.isArray(permission)) {
				if (!permission.includes(message.senderID))
					return reply('Bạn không có quyền sử dụng lệnh này!')
			} else {
				reply(`Lệnh ${command.keywords[0]} này chưa được phân quyền`)
				warn(`Wrong syntax for permission on command: "${command.keywords[0]}"`)
			}
		}

		try {
			if (command.onCall.constructor.name === "AsyncFunction")
				await command.onCall(thread, message, reply)
			else
				command.onCall(thread, message, reply)
		} catch (e) {
			error(e.stack)
			reply(e.stack)
		}
	}
debugger;
	switch (message.type) {
	case "message_reply":
	case "message":
		{
			console.log("amogus")
			const thread = await getThread(message.threadID)
			console.log(thread)
			console.log(message.body)
			debugger;
			if (message.body.indexOf(thread.prefix) == 0) {
				debugger;
				// is using command ==>
				const keyword = message.body.split(" ")[0].slice(thread.prefix.length) // lấy keyword của message
				const address = keyword.split(".")
				message.args = message.body.split(" ").slice(1)
				let found = false
				for (let i = 0; i < this.plugins.length; i++) {
					const plugin = this.plugins[i]
					const commands = plugin.recursiveFind(address)
					if (commands.length > 0)
						found = true
					if (commands.length == 1) {
						executeCommand(thread, commands[0])
					}
					if (commands.length > 1) {
						reply(
							`Có ${commands.length} lệnh: ${commands.map(command => command.address.join(".")).join(', ')}\nBạn muốn xài lệnh nào? (${thread.prefix}help <lệnh> để xem chi tiết)`
						)
					}
				}
				if (!found) {
					if (this.plugins.length == 0) {
						return reply("Chưa có plugin nào đc load!")
					}
					const allKeywords = []
					this.plugins.forEach(command => allKeywords.push(...command.keywords))
					const { ratings } = stringSimilarity.findBestMatch(
						keyword,
						allKeywords
					)
					ratings.sort((a, b) => a.rating - b.rating)
					const bestMatches = ratings.slice(-3).map(item => item.target)
					reply(
						`Không tìm thấy lệnh: "${keyword}"\nGợi ý lệnh:\n${bestMatches.join(', ')}\nBạn có thể xem danh sách lệnh ở ${thread.prefix}help`
					)
				}
			}
			await thread.save()
		}
		break
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
		thread = await Thread.findOne({ id: threadID })
	} finally {
		if (!thread)
			thread = new Thread({
				id: threadID
			})
	}
	return thread
}
