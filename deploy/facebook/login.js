/**
 * Credential to login facebook
 * @typedef {credential}
 * @property {string} appstate Appstate get from <code>await api.getAppState()</code< see https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#apigetappstate
 * @property {string} cookie Facebook cookie, support: ATP cookie, j2team cookie
 * @property {string} email Facebook account's email (deprecated)
 * @property {string} email Facebook account's password (deprecated)
 */

import login from "facebook-chat-api"
import {promisify} from "../../util/fca"

/**
 * Login facebook by credentials
 * @method
 * @param  {credential} credential  Credential for login
 * @param  {apiOptions} apiOptions  See https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#apisetoptionsoptions
 * @return {Promise} return result of checkCredential function, see them
 */
export default function (credential, apiOptions) {
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

    return checkCredential({
            appState: unofficialAppState
        },
        apiOptions
    )
}

/**
 * Get type of cookie
 * @method getCookieType
 * @param  {string}      cookieText  String representing cookie
 * @return {string}      Type of cookie (atp, j2team, appstate)
 */
export function getCookieType(cookieText) {
    //exception: return -1 instead of throw
    let parseTest
    try {
        parseTest = JSON.parse(cookieText)
        if (parseTest.url && parseTest.cookies) {
            return "j2team" // cookie của ext j2team cookie
        } else {
            return "appstate" // appstate của facebook-chat-api
        }
    } catch (e) {
        // ko phải định dạng json => atp cookie
        try {
            convertAtpToAppstate(cookieText)
            return "atp" // cookie của ext atp cookie
        } catch (e) {
            return -1 // Tào lao
        }
    }
}

/**
 * Check credential is valid or not
 * @method checkCredential
 * @param  {credential}        credential   Validated credential for login
 * @param  {apiOptions}        [apiOptions={}]  See https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#apisetoptionsoptions
 * @return {Promise<object>}        An object contains fields uid: UID of fb acc, name: Name of fb acc, appState, api: facebook chat api
 */
export function checkCredential(credential, apiOptions = {}) {
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
                    api: promisify(api)
                })
            })
        })
    })
}

/**
 * convert cookie text from j2team to appstate object
 * @method convertJ2teamToAppstate
 * @param  {string}                j2teamCookieText  J2team cookie text
 * @return {string}                Appstate object
 */
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

/**
 * Convert cookie text from atp to appstate object
 * @method convertAtpToAppstate
 * @param  {string}             atp  ATP cookie text
 * @return {string}             Appstate object
 */
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

/**
 * Check credential is login via cookie or email/pwd
 * @method isUsingCookie
 * @param  {credential}      credential  Credential for login
 * @return {Boolean}
 */
function isUsingCookie(credential) {
    return credential.cookie ? true : false
}
