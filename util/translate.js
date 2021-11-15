import fetch from "node-fetch"

export async function bing(text, from, to) {
	const body = await (await fetch(`http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId=68D088969D79A8B23AF8585CC83EBA2A05A97651&from=${from}&to=${to}&text=${text}`)).text()
	return body.slice(1, body.length - 1)
}

export async function google(text, from = "auto", to) {
	const json = await (await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${text}`)).json()
	return json[0][0][0]
}

export async function detect(text) {
	const body = await (await fetch(`https://api.microsofttranslator.com/V2/Http.svc/Detect?&appid=68D088969D79A8B23AF8585CC83EBA2A05A97651&text=${text}`)).text()
	return />(.*?)</.exec(body)[1]
}