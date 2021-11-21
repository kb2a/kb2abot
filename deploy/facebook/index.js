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

export default async (credential, options) => {
	// const { uid, name, api, appState: officialAppState }
	const { externalHook } = options
	const client = await login(credential, options.apiOptions)
	const hooker = (externalHook || hook).bind(options)
	client.api.listenMqtt(hooker)
	return client
}
