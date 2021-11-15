import login from "./login"
import hook from "./hook"

export default async (credential, options) => {
	// const { uid, name, fca, appState: officialAppState }
	const { externalHook } = options
	const { fca } = await login(credential, options)
	fca.listen((externalHook || hook).bind(options))
}
