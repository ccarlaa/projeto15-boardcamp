import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"
import DateExtension from '@joi/date';
import dayjs from "dayjs";

import connection from "./db.js"

const app = express()
app.use(express.json())
app.use(cors())

dotenv.config()



app.get('/categories', async (req, res) => {
	try {
		const categories = await connection.query(`
			SELECT 
				* 
			FROM 
				categories
		`)
		res.status(200).send(categories.rows)
	} catch (err) {
		res.sendStatus(500)
	}
})

app.post('/categories', async (req, res) => {
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
		await connection.query(`
			INSERT INTO 
				categories (name) 
			VALUES 
				($1)
		`, [category])
		res.status(201).send('Entrada salva')
	} catch (err) {
		res.sendStatus(500)
	}
})

app.get('/games', async (req, res) => {
	const name = req.query.name
	if(name !== undefined){
		try {
			await connection.query(`
				SELECT 
					games.*, categories.name as categoryName 
				FROM 
					games 
				JOIN 
					categories 
				ON 
					games."categoryId" = categories.id
			`)
			const filteredGames = await connection.query(`
				SELECT 
					* 
				FROM 
					games 
				WHERE 
					upper(name) LIKE upper($1);
			`, [(`${name}%`)])
			res.status(200).send(filteredGames.rows)
		} catch (err) {
			res.sendStatus(500)
		}
	} else {
		try {
			const games = await connection.query(`
				SELECT 
					games.*, categories.name as categoryName 
				FROM 
					games 
				JOIN 
					categories 
				ON 
					games."categoryId" = categories.id
			`)
			res.status(200).send(games.rows)
		} catch (err) {
			res.sendStatus(500)
		}
	}
})

app.post('/games', async (req, res) => {
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
		await connection.query(`
			INSERT INTO
				games (name, image, "stockTotal", "categoryId", "pricePerDay")
			VALUES 
				($1, $2, $3, $4, $5)
		`, [name, image, stockTotal, categoryId, pricePerDay])
		res.status(201).send('Entrada salva')
	} catch(err) {
		res.sendStatus(500)
	}
})

app.get('/customers', async (req, res) => {
	const cpf = req.query.cpf
	if(cpf !== undefined){
		try {
			const filterCPF = await connection.query(`
				SELECT 
					* 
				FROM 
					customers 
				WHERE 
					upper(cpf)
				LIKE 
					upper($1);
			`, [(`${cpf}%`)])
			res.status(200).send(filterCPF.rows)
		} catch (err) {
			res.sendStatus(500)
		}
	} else {
		try {
			const customers = await connection.query(`
				SELECT 
					* 
				FROM 
					customers
			`)
			res.status(200).send(customers.rows)
		} catch (err) {
			res.sendStatus(500)
		}
	}
})

app.get('/customers/:id', async (req, res) => {
	const id = req.params.id
	try {
		const categoryById = await connection.query(`
			SELECT 
				* 
			FROM 
				customers
			WHERE
				id = ($1)
		`, [id])
		res.status(200).send(categoryById.rows)
	} catch (err) {
		res.sendStatus(500)
	}
})

const Joi = joi.extend(DateExtension)

app.post('/customers', async (req, res) => {
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
		await connection.query(`
			INSERT INTO
				customers (name, phone, cpf, birthday)
			VALUES 
				($1, $2, $3, $4)
		`, [name, phone, cpf, birthday])
		res.status(201).send('Entrada salva')
	} catch(err) {
		res.sendStatus(500)
	}
})

app.put('/customers/:id', async (req, res) => {
	const id = req.params.id
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
		await connection.query(`
			UPDATE
				customers
			SET 
				name = ($1), phone =  ($2), cpf = ($3), birthday = ($4)
			WHERE
				id = ($5)
		`, [name, phone, cpf, birthday, id])
		res.status(201).send('Entrada salva')
	} catch(err) {
		res.sendStatus(500)
	}
})

app.get('/rentals', async (req, res) => {
	try {
		const rentals = await connection.query(` 
			SELECT 
				rentals.*, games.name as "gameName", customers.name as "customerName", categories.name as "categoryName", categories.id as "categoryId"
			FROM 
				rentals
			JOIN
				customers
			ON
				customers."id" = rentals."customerId"
			JOIN 
				games 
			ON 
				games."id" = rentals."gameId"
			JOIN 
				categories 
			ON 
				categories."id" = games."categoryId"
		`)
		const rentalsRows = rentals.rows
		const rentalsBody = []
		for (let rental of rentalsRows){
			rental = {
				...rental,
				customer: {
					id: rental.customerId,
					name: rental.customerName,
				},
				game: {
					id: rental.gameId,
					name: rental.gameName,
					categoryId: rental.categoryId,
					categoryName: rental.categoryName
				}
			}
			rentalsBody.push(rental)
		}
	res.send(rentalsBody);
	} catch(err) {
		res.sendStatus(500)
	}
})

app.post('/rentals', async (req, res) => {
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
		const rentDate = dayjs().format("DD-MM-YYYY")
		const originalPrice = (daysRented*gameRows[0].pricePerDay)
		await connection.query(`
			INSERT INTO 
				rentals ("customerId", "gameId", "rentDate", "daysRented", "originalPrice")
			VALUES 
				($1, $2, $3, $4, $5) 
		`, [customerId, gameId, `'${rentDate}'`, daysRented, `${originalPrice}`]) 
		res.status(201).send('Entrada salva')
	} catch(err) {
		res.sendStatus(err)
	}
})

app.post('/rentals/:id/return', async (req, res) => {
	const { id } = req.params
	const returnDate = dayjs().format("YYYY-MM-DD HH:mm")
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
        const rental = await connection.query(`
            SELECT 
                rentals.*, games."pricePerDay" AS "pricePerDay" 
            FROM
                rentals
            JOIN 
                games ON games."id" = rentals."gameId"
            WHERE
                rentals."id" = ($1)
        `, [id])
		const rentalRows = rental.rows
        const delayDays = dayjs().diff(rentalRows[0].rentDate, "days" )
		const delayFee = null;
		if(delayDays > 0) {
			delayFee =parseInt(delayDays) * rentalRows[0].pricePerDay
		}
        await connection.query(`
            UPDATE
                rentals
            SET
                "returnDate" = ($1), "delayFee" = ($2)
            WHERE 
                id = ($3)
        `, [returnDate, delayFee, id])
		res.status(201).send('Entrada salva')
	} catch (err) {
		res.sendStatus(500)
	}
})

app.delete('/rentals/:id', async (req, res) => {
	const { id } = req.params;
    try {
        await connection.query(`
            DELETE FROM 
				rentals
            WHERE 
				id = ($1)
        `, [id]);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`|-----------------------------------|`)
    console.log(`| Running at http://localhost:${port}  |`)
    console.log(`|-----------------------------------|`)
})