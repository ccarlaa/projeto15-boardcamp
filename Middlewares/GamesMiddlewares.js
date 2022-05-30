import joi from "joi"
import connection from "../db.js"

export async function gamesPostMiddleware(req, res, next) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body
	const gameSchema = joi.object({
		name: joi.string()
			.required(),
		image: joi.string()
			.uri()
			.required(),
		stockTotal: joi.number()
			.integer()
			.min(1),
		pricePerDay: joi.number()
			.integer()
			.min(1)
	})
	const validation = gameSchema.validate({name, image, stockTotal, pricePerDay})
	if(validation.error){
		res.sendStatus(400)
        return;
    }
	try {
		const idValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				categories 
			WHERE 
				id = ($1) 
		`, [categoryId])
		if (idValidation.rowCount == 0) {
			return res.sendStatus(400)
		}
		const gameValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				games 
			WHERE 
				name = ($1) 
		`, [name])
		if (gameValidation.rowCount != 0) {
			return res.sendStatus(409)
		}
    } catch (err) {
        res.sendStatus(500)
    }
    next()
}