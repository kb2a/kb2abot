import fetch from "node-fetch"

export const callbackKeys = [
	"addUserToGroup",
	"changeAdminStatus",
	"changeArchivedStatus",
	"changeBlockedStatus",
	"changeGroupImage",
	"changeNickname",
	"changeThreadColor",
	"changeThreadEmoji",
	"createPoll",
	"deleteMessage",
	"deleteThread",
	"forwardAttachment",
	"getFriendsList",
	"getThreadHistory",
	"getThreadInfo",
	"getThreadList",
	"getThreadPictures",
	"getUserID",
	"getUserInfo",
	"handleMessageRequest",
	"logout",
	"markAsDelivered",
	"markAsRead",
	"markAsReadAll",
	"muteThread",
	"removeUserFromGroup",
	"resolvePhotoUrl",
	"searchForThread",
	"sendTypingIndicator",
	"setMessageReaction",
	"setTitle",
	"unsendMessage"
]
export const normalKeys = [
	"getAppState",
	"getCurrentUserID",
	"getEmojiUrl",
	"setOptions"
]

export function getUsername(fblink) {
	try {
		return /id=(.*?)$/.exec(fblink)[1]
	} catch {
		try {
			return /.com\/(.*?)$/.exec(fblink)[1]
		} catch {
			return "Unknown"
		}
	}
}

export async function getToken() {
	let stringifyCookie = ""
	const appstate = api.getAppState()
	for (const e of appstate) {
		stringifyCookie += e.toString().split(";")[0] + ";"
	}
	const data = await (
		await fetch("https://business.facebook.com/business_locations", {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
				cookie: stringifyCookie
			}
		})
	).text()
	const first = /LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data)[1]
	const second = /"],\["(.*?)","/.exec(first)[1]
	return second
}

export function promisify(fca) {
	const functions = {}
	for (const method of callbackKeys) {
		functions[method] = (...args) =>
			new Promise((resolve, reject) => {
				fca[method](...args, (err, result) => {
					err ? reject(new Error(err)) : resolve(result)
				})
			})
	}
	for (const method of normalKeys) {
		functions[method] = (...args) => fca[method](...args)
	}
	functions.sendMessage = (message, threadID, messageID) => {
		return new Promise((resolve, reject) => {
			fca.sendMessage(
				message,
				threadID,
				(err, result) => {
					err ? reject(new Error(err)) : resolve(result)
				},
				messageID
			)
		})
	}
	return functions
}
