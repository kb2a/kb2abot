/**
 * Chứa các function hỗ trợ facebook chat api<br>
 * Hướng dẫn sử dụng:<br>
 * import {<tên hàm 1>, <tên hàm 2>} from "kb2abot/util/fca.js"<br>
 * Ví dụ:
 * <code>import {getUsername, promisify} from "kb2abot/util/fca.js"</code>
 * @module Util.Fca
 */
import fetch from "node-fetch"
import {isError} from "./logger.js"

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
	"setOptions",
	"listenMqtt"
]

/**
 * Get username by facebook user link
 * @method getUsername
 * @param  {string}    fblink  Facebook user link
 * @return {string}    username
 * @example
 * getUsername("https://www.facebook.com/khoakomlem") // => "khoakomlem"
 */
export function getUsername(fblink) {
	let temp = ""
	if (fblink.includes("?id="))
		temp = /id=(.*?)$/.exec(fblink)[1]
	else
		temp = /.com\/(.*?)$/.exec(fblink)[1]
	if (temp.includes("/"))
		return temp.slice(0, temp.indexOf("/"))
	return temp
}

/**
 * Create a promise-wrapped api functions
 * @method promisify
 * @param  {fca}  fca  The facebook chat api instance
 * @return {object}  FCA support promise
 */
export function promisify(fca) {
	const functions = {}
	for (const method of callbackKeys) {
		functions[method] = (...args) =>
			new Promise((resolve, reject) => {
				try {
					fca[method](...args, (err, result) => {
						err ? reject(isError(err) ? err : new Error(err.errorDescription ? err.errorDescription : err.error)) : resolve(result)
					})
				}
				catch(err) {
					reject(new TypeError(isError(err) ? err : new Error(err.error)))
				}
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

	functions.fetch = async (url, noHeadersOption = {}, extendedHeaders = {}) => {
		const cookie = stringifyAppstate(await fca.getAppState())
		return await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
				cookie,
				...extendedHeaders
			},
			...noHeadersOption
		})
	}

	functions.getToken = async () => {
		const data = await (await functions.fetch("https://business.facebook.com/business_locations")).text()
		const first = /LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data)[1]
		const second = /"],\["(.*?)","/.exec(first)[1]
		return second
	}
	return functions
}

export function stringifyAppstate(appstate) {
	return appstate.map(e => `${e.key}=${e.value}`).join(";")
}