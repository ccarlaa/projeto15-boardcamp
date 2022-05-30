import joi from "joi"
import connection from "../db.js"

export default async function categoriesPostMiddleware(req, res, next) {
    const category = req.body.name
    const categorySchema = joi.object({
		name: joi.string()
			.required()
	})
	const validation = categorySchema.validate({name: category})
	if(validation.error){
		res.sendStatus(400)
        return;
    }
	try {
		const categoryValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				categories 
			WHERE 
				name LIKE ($1)
		`, [category])
		if (categoryValidation.rowCount != 0) {
			return res.sendStatus(409)
		}
    } catch (err) {
        res.sendStatus(500)
    }
    next()
}