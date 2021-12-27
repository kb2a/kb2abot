import Joi from "joi"
import {model} from "../../../datastores"

const User = model(
	"User",
	Joi.object({
		id: Joi.string()
		//...
	})
)

export default User
