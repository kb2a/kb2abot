// this file just for init datastore, no need to instance in every action (insert, find ...)
import path from "path"
import nedb from "nedb-promises"
import pluralize from "pluralize"

let directory = null
const Models = {}

export function model(name, schema) {
	if (!/^[A-Za-z0-9]+$/.test(name))
		throw new Error(`${name} is not a valid model name (A-Z, a-z, 0-9 only)`)
	if (name[name.length - 1] == "s")
		console.log("INFO: No need to add 's' at end of the model name as it will be automatically add")

	let loaded = false
	let collection = null
	let isHandling = false
	const queue = []

	async function handleQueue() {
		if (queue.length == 0 || !loaded)
			return isHandling = false
		isHandling = true
		const [method, args, resolve, reject] = queue[0]
		try {
			resolve(await collection[method](...args))
			queue.splice(0, 1)
		} catch (error) {
			reject(error)
		}
		setTimeout(handleQueue)
	}

	class Model {
		static async load() {
			if (loaded) return collection
			collection = nedb.create(path.join(directory, pluralize(name) + ".db"))
			await collection.load()
			loaded = true
			handleQueue()
			return collection
		}

		static insert(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["insert", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static find(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["find", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static findOne(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["findOne", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static update(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["update", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static remove(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["remove", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static count(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["count", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static ensureIndex(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["ensureIndex", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		static removeIndex(...args) {
			return new Promise((resolve, reject) => {
				queue.push(["removeIndex", args, resolve, reject])
				if (!isHandling) handleQueue()
			})
		}

		constructor(document) {
			const validated = schema.validate(document)
			Object.assign(this, validated.value)
		}

		save() {
			return this.constructor.insert({ ...this })
		}
	}
	if (directory) Model.load()
	return Models[name] = Model
}

export async function init(dir) {
	directory = dir
	const jobs = []
	for (const modelName in Models) {
		jobs.push(Models[modelName].load())
	}
	return await Promise.all(jobs)
}
