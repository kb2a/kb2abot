import Joi from "joi"
import {model} from "../../../datastores"

const Thread = model("Thread", Joi.object({
	id: Joi.string(),
	prefix: Joi.string().max(3).default("/")
}))

export default Thread