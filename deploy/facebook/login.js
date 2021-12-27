import login from "facebook-chat-api"

/**
 * @param  {cookie: string}7 credential Credential for login via Facebook
 * @param  {}
 * @return {[type]}
 */
export default (credential, apiOptions) => {
	let unofficialAppState
	if (isUsingCookie(credential)) {
		const cookieType = getCookieType(credential.cookie)
		switch (cookieType) {
		case "j2team":
			unofficialAppState = convertJ2teamToAppstate(credential.cookie)
			break
		case "atp":
			unofficialAppState = convertAtpToAppstate(credential.cookie)
			break
		case "appstate":
			unofficialAppState = JSON.parse(credential.cookie)
			break
		case -1:
			throw new Error(
				"Invalid cookie, please check again (support j2team, atp cookie)"
			)
		}
	} else {
		throw new Error("Login using usr/pwd is deprecated on facebook platform")
	}

	return checkCredential(
		{
			appState: unofficialAppState
		},
		apiOptions
	)
}

export function isUsingCookie(credential) {
	return credential.cookie ? true : false
}

export function getCookieType(text) {
	//exception: return -1 instead of throw
	let parseTest
	try {
		parseTest = JSON.parse(text)
		if (parseTest.url && parseTest.cookies) {
			return "j2team" // cookie của ext j2team cookie
		} else {
			return "appstate" // appstate của facebook-chat-api
		}
	} catch (e) {
		// ko phải định dạng json => atp cookie
		try {
			convertAtpToAppstate(text)
			return "atp" // cookie của ext atp cookie
		} catch (e) {
			return -1 // Tào lao
		}
	}
}

export function checkCredential(credential, config = {}) {
	return new Promise((resolve, reject) => {
		login(credential, (err, api) => {
			if (err) {
				return reject(new Error("Wrong/expired cookie!"))
			}
			const userID = api.getCurrentUserID()
			api.getUserInfo(userID, (err, ret) => {
				if (err) {
					return reject(
						new Error("Your account has been disabled or blocked features")
					)
				}
				resolve({
					uid: userID,
					name: ret[userID].name,
					appState: api.getAppState(),
					api
				})
			})
		})
	})
}

export function convertJ2teamToAppstate(j2team) {
	const unofficialAppState = []
	j2team = JSON.parse(j2team)
	for (const cookieElement of j2team.cookies) {
		unofficialAppState.push({
			key: cookieElement.name,
			value: cookieElement.value,
			expires: cookieElement.expirationDate || "",
			domain: cookieElement.domain.replace(".", ""),
			path: cookieElement.path
		})
	}
	return unofficialAppState
}

export function convertAtpToAppstate(atp) {
	const unofficialAppState = []
	const items = atp.split(";|")[0].split(";")
	if (items.length < 2) throw "Not a atp cookie"
	const validItems = ["sb", "datr", "c_user", "xs"]
	let validCount = 0
	for (const item of items) {
		const key = item.split("=")[0]
		const value = item.split("=")[1]
		if (validItems.includes(key)) validCount++
		unofficialAppState.push({
			key,
			value,
			domain: "facebook.com",
			path: "/"
		})
	}
	if (validCount >= validItems.length) {
		return unofficialAppState
	} else {
		throw "Not a atp cookie"
	}
}
