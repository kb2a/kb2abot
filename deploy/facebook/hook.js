import stringSimilarity from "string-similarity"
import { google, detect } from "../../util/translate"
import { getThreadInfo } from "../../util/fca"
import { warn, error } from "../../util/logger"
import Thread from "./models/Thread"

export default async function hook(message) {
	const { config } = this

	const reply = (message, threadID, messageID) => {
		return new Promise(async resolve => {
			const lang = await detect(message)
			if (lang != process.env.DEFAULT_LOCALE)
				message = await google(message, lang, process.env.DEFAULT_LOCALE)
			this.sendMessage(
				message,
				threadID || message.threadID,
				resolve,
				messageID || message.messageID
			)
		})
	}

	let thread
	try {
		thread = await Thread.findOne({ id: message.threadID })
	} catch {
		thread = new Thread({
			id: message.threadID
		})
	}

	const executeCommand = async (command) => {
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

	if (message.body.indexOf(thread.prefix) == 0) {
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
				executeCommand(commands[0])
			}
			if (commands.length > 1) {
				reply(
					`Có ${commands.length} lệnh: ${commands.map(command => command.address.join(".")).join(', ')}\nBạn muốn xài lệnh nào? (${thread.prefix}help <lệnh> để xem chi tiết)`
				)
			}
		}
		if (!found) {
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
