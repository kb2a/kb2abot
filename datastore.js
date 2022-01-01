/**
 * @module Datastore
 */

// this file just for init datastore, no need to instance in every action (insert, find ...)
import {existsSync} from "fs"
import {fileURLToPath} from "url"
import {join, isAbsolute} from "path"
import Joi from "joi"
import nedb from "nedb-promises"
import pluralize from "pluralize"
import getCallerFile from "get-caller-file"

let directory = null
const Models = {}

/**
 * Function create subclasses of Model. A Model is a class that's your primary tool for interacting with NeDB. An instance of a Model is called a Document.
 * @param  {string} name   Name of model (in singular form)
 * @param  {Joi_Schema} schema Joi schema
 * @return {Model}        Class Model
 */
export function model(name, schema) {
	if (!/^[A-Za-z0-9]+$/.test(name))
		throw new Error(`${name} is not a valid model name (A-Z, a-z, 0-9 only)`)
	if (name[name.length - 1] == "s")
		console.log(
			"INFO: No need to add 's' at end of the model name as it will be automatically add"
		)

	let loaded = false
	let collection = null
	let isHandling = false
	const queue = []

	const pushQueue = (method, args) =>
		new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				console.log("Timeout query, did you forget to init() the datastore?")
				const index = queue.findIndex(q => q[2] == resolve)
				queue.splice(index, 1)
				reject(new Error("Timeout query"))
			}, 30000)
			queue.push([method, args, resolve, reject, timeout])
			if (!isHandling) handleQueue()
		})

	class Model {
		static async load() {
			if (loaded) return collection
			collection = nedb.create(join(directory, pluralize(name) + ".db"))
			await collection.load()
			loaded = true
			handleQueue()
			return collection
		}

		static insert(...args) {
			return pushQueue("insert", args)
		}
		static find(...args) {
			return pushQueue("find", args)
		}
		static findOne(...args) {
			return pushQueue("findOne", args)
		}
		static update(...args) {
			return pushQueue("update", args)
		}
		static remove(...args) {
			return pushQueue("remove", args)
		}
		static count(...args) {
			return pushQueue("count", args)
		}
		static ensureIndex(...args) {
			return pushQueue("ensureIndex", args)
		}
		static removeIndex(...args) {
			return pushQueue("removeIndex", args)
		}

		constructor(document) {
			Object.assign(this, this.validate(document))
		}

		async save() {
			const document = this.validate({...this})
			if (this._id)
				return await this.constructor.update({_id: this._id}, document)
			else {
				const {_id} = await this.constructor.insert(document)
				this._id = _id
			}
		}

		validate(document = this) {
			const validate = schema.keys({_id: Joi.string()}).validate(document)
			if (validate.error) throw new Error(validate.error)
			return validate.value
		}
	}

	async function handleQueue() {
		if (queue.length == 0 || !loaded) return (isHandling = false)
		isHandling = true
		const [method, args, resolve, reject, timeout] = queue[0]
		clearTimeout(timeout)
		try {
			const result = await collection[method](...args)
			resolve(
				["find", "findOne"].includes(method) && result
					? new Model(result)
					: result
			)
			queue.splice(0, 1)
		} catch (error) {
			reject(error)
		}
		setTimeout(handleQueue)
	}

	if (directory) Model.load()
	return (Models[name] = Model)
}

export async function init(dir) {
	if (!isAbsolute(dir)) dir = fileURLToPath(join(getCallerFile(), "..", dir))
	if (!existsSync(dir)) throw new Error(`Dir not found: ${dir}`)
	directory = dir
	const jobs = []
	for (const modelName in Models) {
		jobs.push(Models[modelName].load())
	}
	return await Promise.all(jobs)
}
