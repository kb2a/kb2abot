// this file just for cache import, no re-init datastore in every updates
import nedb from "nedb-promises"
const obj = {
	main: null,
	isReady: function() {
		return this.main ? true : false
	}
}
export default obj
export function init(absPath) {
	obj.datastore = nedb.create(absPath)
}