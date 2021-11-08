import Joi from "joi"
import {model} from "../../../datastores"

const Thread = model("Thread", Joi.object({
	id: Joi.string(),
	//...
}))

export default Thread