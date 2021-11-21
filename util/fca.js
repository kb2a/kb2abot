import fetch from "node-fetch"
import { error } from "../logger"

export function sendMessage(message, threadID, messageID) {
	return new Promise(resolve => {
		queueMessage.push([message, threadID, messageID, resolve]);
		if (queueMessage.length == 1) handleMessage(); // length change from 0 to 1, execute this
	})
}

export function getUsername(fblink) {
	try {
		return /id=(.*?)$/.exec(fblink)[1];
	} catch {
		try {
			return /.com\/(.*?)$/.exec(fblink)[1];
		} catch {
			return "Unknown"
		}
	}
};

export async function getToken() {
	let stringifyCookie = '';
	const appstate = api.getAppState();
	for (const e of appstate) {
		stringifyCookie += e.toString().split(';')[0] + ';';
	}
	const data = await (await fetch(
		'https://business.facebook.com/business_locations', {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18',
				cookie: stringifyCookie
			}
		}
	)).text()
	const first = /LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data)[1]
	const second = /"],\["(.*?)","/.exec(first)[1]
	return second
};

const queueMessage = []
const handleMessage = async () => {
	if (queueMessage.length <= 0) return;
	const [message, threadID, messageID, resolve] = queueMessage[0];
	try {
		const messageInfo = await newSendMessage(
			message,
			threadID,
			messageID
		)
		queueMessage.splice(0, 1);
		if (queueMessage.length > 0)
			setTimeout(handleMessage, 1111);
		resolve(messageInfo)
	} catch (err) {
		resolve(err)
	}
};

export function promisify(fca) {
	const keys = ["addUserToGroup", "changeAdminStatus", "changeArchivedStatus", "changeBlockedStatus", "changeGroupImage", "changeNickname", "changeThreadColor", "changeThreadEmoji", "createPoll", "deleteMessage", "deleteThread", "forwardAttachment", "getAppState", "getCurrentUserID", "getEmojiUrl", "getFriendsList", "getThreadHistory", "getThreadInfo", "getThreadList", "getThreadPictures", "getUserID", "getUserInfo", "handleMessageRequest", "listen", "listenMqtt", "logout", "markAsDelivered", "markAsRead", "markAsReadAll", "muteThread", "removeUserFromGroup", "resolvePhotoUrl", "searchForThread", "sendTypingIndicator", "setMessageReaction", "setOptions", "setTitle", "threadColors", "unsendMessage"]
	const functions = {}
	for (const method of keys) {
		functions[method] = (...args) => {
			return new Promise((resolve, reject) => {
				try {
					fca[method](args, (err, result) => {
						err ? reject(err) : resolve(result)
					})
				}
				catch(err) {
					reject(err)
				}
			})
		}
	}
	functions.sendMessage = (message, threadID, messageID) => {
		return new Promise((resolve, reject) => {
			fca.sendMessage(message, threadID, (err, result) => {
				if (err)
					reject()
			}, messageID)
		})
	}
	return functions
}
