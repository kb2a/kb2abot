import login from "./login"
import hook from "./hook"

export default async (credential, config) => {
	// const { uid, name, fca, appState: officialAppState }
	const { externalHook } = config
	const { fca } = await login(credential, config)
	fca.listen(externalHook || hook)
}
