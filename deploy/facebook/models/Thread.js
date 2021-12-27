import Joi from "joi"
import {model} from "../../../datastore.js"

const Thread = model(
	"Thread",
	Joi.object({
		id: Joi.string(),
		prefix: Joi.string()
			.max(1)
			.default("/")
	})
)

export default Thread
