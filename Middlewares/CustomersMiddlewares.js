import connection from "../db.js"
import joi from "joi"
import DateExtension from '@joi/date'

const Joi = joi.extend(DateExtension)

export async function postCustomersMiddleware(req, res, next) {
    const { name, phone, cpf, birthday } = req.body
	const customerSchema = joi.object({
		name: joi.string()
			.required(),
		phone: joi.string()
			.pattern(/^[0-9]{10,11}$/)
			.required(),
		cpf: joi.string()
			.pattern(/^[0-9]{11}$/)
			.required(),
		birthday: Joi.date()
			.format('DD-MM-YYYY')
			.required(),
	})
	const validation = customerSchema.validate({name, phone, cpf, birthday})
	if(validation.error){
		res.sendStatus(400)
        return;
    }
	try {
		const cpfValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				customers 
			WHERE 
				cpf = ($1) 
		`, [cpf])
		if (cpfValidation.rowCount !== 0) {
			return res.sendStatus(409)
		}
    } catch (err) {
        res.sendStatus(500)
    }
    next()
}

export async function putCustomersMiddleware(req, res, next) {
    const { name, phone, cpf, birthday } = req.body
	const customerSchema = joi.object({
		name: joi.string()
			.required(),
		phone: joi.string()
			.pattern(/^[0-9]{10,11}$/)
			.required(),
		cpf: joi.string()
			.pattern(/^[0-9]{11}$/)
			.required(),
		birthday: Joi.date()
			.format('DD-MM-YYYY')
			.required(),
	})
	const validation = customerSchema.validate({name, phone, cpf, birthday})
	if(validation.error){
		res.sendStatus(400)
        return;
    }
    next()
}