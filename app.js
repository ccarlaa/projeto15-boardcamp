import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"

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
	if(name != undefined){
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
		`, [(`%${name}%`)])
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

const port = process.env.PORT
app.listen(port, () => {
    console.log(`|-----------------------------------|`)
    console.log(`| Running at http://localhost:${port}  |`)
    console.log(`|-----------------------------------|`)
})