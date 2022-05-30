import connection from "../db.js"
import joi from "joi"

export async function rentalsPostMiddleware(req, res, next) {
    const { customerId, gameId, daysRented } = req.body
	const rentalSchema = joi.object({
		daysRented: joi.number()
			.min(1)
			.required()
	})
	const validation = rentalSchema.validate({daysRented})
	if(validation.error){
		res.sendStatus(400)
        return;
    }
	try {
		const customerValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				customers 
			WHERE 
				id = ($1) 
		`, [customerId])
		if (customerValidation.rowCount == 0) {
			return res.sendStatus(400)
		}
		const gameValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				games 
			WHERE 
				id = ($1) 
		`, [gameId])
		if (gameValidation.rowCount == 0) {
			return res.sendStatus(400)
		}
		const gameRows = gameValidation.rows
		const stock = gameRows.stockTotal
		const unavailable = await connection.query(`
			SELECT 
				* 
			FROM 
				rentals 
			WHERE 
				"gameId" = ($1) 
		`, [gameId])
		const unavailableRows = unavailable.rows
		const unavailableNumber = unavailableRows.length 
		if( unavailableNumber === stock){
			return res.sendStatus(400)
		}
        res.locals.game = gameRows
    } catch (err) {
        res.sendStatus(500)
    }
    next()
}

export async function rentalsPostByIdMiddleware(req, res, next) {
    const { id } = req.params
    try {
		const idValidation = await connection.query(`
			SELECT 
				* 
			FROM 
				rentals 
			WHERE 
				id = ($1)
		`, [id]);

        if (idValidation.rowCount == 0) {
			return res.sendStatus(404)
		}
        if (idValidation.rows[0].returnDate !== null) {
			res.sendStatus(400)
		}
    } catch (err) {
        res.sendStatus(500)
    }
	next()
}