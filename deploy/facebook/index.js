import login from "./login"
import hook from "./hook"

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

/**
 * Bootstrap login (add hook -> listener, create api, catch error, ...)
 * @namespace facebook
 * @method facebook
 * @param  {credential} credential  See type definition in "./login.js"
 * @param  {apiOptions} options     See type definition in "./login.js"
 * @return {Promise} result from import("./login.js").default(credential, apiOptions)
 */
export default async (credential, options) => {
	const {
		externalHook,
		apiOptions = {},
		pluginOptions = {},
		pluginManager = []
	} = options
	const client = await login(credential, apiOptions)
	const hooker = externalHook || hook
	for (const plugin of pluginManager) if (plugin.isInternal) plugin.pluginManager = pluginManager
	client.api.listenMqtt(async (err, message) => {
		try {
			const result = await hooker.bind({
				api: client.api,
				config: pluginOptions,
				pluginManager
			})(err, message)
			if (result)
				await client.api.sendMessage(
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
