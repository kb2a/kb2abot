import Thread from "./models/Thread"

export default async function hook(message) {
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

	if (message.body.indexOf(thread.prefix) == 0) {
		// is using command ==>
		const keyword = message.body.split(' ')[0].slice(thread.prefix.length) // lấy keyword của message
		const address = keyword.split(".")
		let found = false
		for (let i = 0; i < this.plugins.length; i++) {
			const plugin = this.plugins[i]
			const commands = plugin.recursiveFind(address)
			if (commands.length > 0)
				found = true
			if (commands.length == 1) {
				commands[0].onCall(sender, args, reply)
			}
			if (command.length > 1) {
				const names = []
				for (const f of commands)
					if (!f.className.includes('.'))
						names.push('kb2abot.' + f.className)
				else names.push(f.className)
				reply(
					`Có ${found.length} lệnh: ${names.join(
							', '
						)}\nBạn muốn xài lệnh nào?`
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
				`Không tìm thấy lệnh: "${keyword}"\nGợi ý lệnh:\n${bestMatches.join(
							', '
						)}\nBạn có thể xem danh sách lệnh ở ${thread.prefix}help`
			)
		}
	}

	await thread.save()
}

export async function a(message) {

	const isCommand = message.body.indexOf(thread.storage.prefix) == 0
	for (const command of kb2abot.pluginManager.getAllCommands()) {
		if (
			command.hookType == '*' ||
			(command.hookType == 'command-only' && isCommand) ||
			(command.hookType == 'non-command' && !isCommand)
		)
			await executeCommand({
				reply,
				message,
				thread,
				type: 'onMessage',
				command
			})
	}
}

export async function executeCommand({
	reply,
	message,
	thread,
	type = 'onCall',
	command
}) {
	const permission =
		command.permission[message.threadID] || command.permission['*'] || []
	if (type == 'onCall' && permission != '*') {
		if (
			permission == 'superAdmin' &&
			!kb2abot.config.SUPER_ADMINS.includes(message.senderID)
		)
			return reply('Bạn không thể sử dụng lệnh này!')
		if (!kb2abot.config.SUPER_ADMINS.includes(message.senderID))
			if (permission == 'admin') {
				try {
					const info =
						thread.adminIDs ||
						(await kb2abot.helpers.fca.getThreadInfo(thread.id))
					if (kb2abot.config.REFRESH_ADMINIDS) thread.adminIDs = info.adminIDs
					if (
						info.adminIDs.findIndex(e => e.id == message.senderID) == -1 &&
						info.isGroup
					)
						return reply('Chỉ admin mới có thể xài lệnh này!')
				} catch (e) {
					reply(
						'Gặp lỗi khi đang lấy danh sách admin, vui lòng thử lại trong giây lát . . .'
					)
					console.newLogger.warn(
						`Error while getting thread ${thread.id} info:`,
						e
					)
					return
				}
			} else if (Array.isArray(permission)) {
			if (!permission.includes(message.senderID))
				return reply('Bạn không có quyền sử dụng lệnh này!')
		} else {
			console.newLogger.warn(
				`Command phân quyền sai cú pháp: "${command.name}"`
			)
			return reply('Lệnh này chưa phân quyền!')
		}
	}
	const commandName = command.keywords[0]
	if (!kb2abot.account.storage[commandName])
		kb2abot.account.storage[commandName] = {}
	if (!thread.storage[commandName]) thread.storage[commandName] = {}
	const params = [{
			storage: {
				account: {
					global: kb2abot.account.storage,
					local: kb2abot.account.storage[commandName]
				},
				thread: {
					global: thread.storage,
					local: thread.storage[commandName]
				}
			}
		},
		message,
		reply
	]
	try {
		if (command[type].constructor.name === 'AsyncFunction')
			await command[type].call(...params)
		else command[type].call(...params)
	} catch (e) {
		console.newLogger.error(e.stack)
		reply(e.stack)
	}
}
