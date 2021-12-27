import login from "./login"
import hook from "./hook"
import {promisify} from "../../util/fca"

//                         _ooOoo_
//                        o8888888o
//                        88" . "88
//                        (| -_- |)
//                        O\  =  /O
//                     ____/`---'\____
//                   .'  \\|     |//  `.
//                  /  \\|||  :  |||//  \
//                 /  _||||| -:- |||||_  \
//                 |   | \\\  -  /'| |   |
//                 | \_|  `\`---'//  |_/ |
//                 \  .-\__ `-. -'__/-.  /
//               ___`. .'  /--.--\  `. .'___
//            ."" '<  `.___\_<|>_/___.' _> \"".
//           | | :  `- \`. ;`. _/; .'/ /  .' ; |
//           \  \ `-.   \_\_`. _.'_/_/  -' _.' /
// ===========`-.`___`-.__\ \___  /__.-'_.'_.-'================
//         JUST TO MAKE SURE THE CODE RUN SMOOTHLY ;)

export default async (credential, options) => {
	const {
		externalHook,
		apiOptions = {},
		pluginConfig = {},
		plugins = []
	} = options
	const client = await login(credential, apiOptions)
	const hooker = externalHook || hook
	const promisifyApi = promisify(client.api)
	for (const plugin of plugins) if (plugin.isInternal) plugin.plugins = plugins
	client.api.listenMqtt(async (err, message) => {
		try {
			const result = await hooker.bind({
				api: promisifyApi,
				config: pluginConfig,
				plugins
			})(err, message)
			if (result)
				await promisifyApi.sendMessage(
					result,
					message.threadID,
					message.messageID
				)
		} catch (err) {
			console.error(err)
		}
	})
	return client
}
