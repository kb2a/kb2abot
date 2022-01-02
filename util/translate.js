/**
 * Chứa các function dịch thuật<br>
 * Hướng dẫn sử dụng:<br>
 * import {<tên hàm 1>, <tên hàm 2>} from "kb2abot/util/translate.js"<br>
 * Ví dụ:
 * <code>import {bing, google, detect} from "kb2abot/util/translate.js"</code>
 * @module Util.Translate
 */
import fetch from "node-fetch"

/**
 * Translate a text from <from> to <to> using Bing engine
 * @async
 * @method bing
 * @param  {string} text  Text to be translated
 * @param  {string} from  Source language
 * @param  {string} to    Destination language
 * @return {string} Translated text
 * @example
 * await bing("xin chào kẻ mạo danh", "vi", "en") // => "hello impostor"
 */
export async function bing(text, from, to) {
	const body = await (
		await fetch(
			`http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId=68D088969D79A8B23AF8585CC83EBA2A05A97651&from=${from}&to=${to}&text=${text}`
		)
	).text()
	return body.slice(1, body.length - 1)
}

/**
 * Translate a text from <from> to <to> using Google engine
 * @async
 * @method bing
 * @param  {string} text  Text to be translated
 * @param  {string} [from="auto"]  Source language
 * @param  {string} to    Destination language
 * @return {string} Translated text
 * @example
 * await google("giữa chúng ta", null, "en") // => "among us"
 */
export async function google(text, from = "auto", to) {
	const json = await (
		await fetch(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${text}`
		)
	).json()
	return json[0][0][0]
}

/**
 * Detect language that the text are using
 * @async
 * @method detect
 * @param  {string} text  Source text
 * @return {string} language
 * @example
 * await detect("Hello") // => "vi"
 */
export async function detect(text) {
	const body = await (
		await fetch(
			`https://api.microsofttranslator.com/V2/Http.svc/Detect?&appid=68D088969D79A8B23AF8585CC83EBA2A05A97651&text=${text}`
		)
	).text()
	return />(.*?)</.exec(body)[1]
}
