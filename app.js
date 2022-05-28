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
			SELECT * FROM categories
		`)
		res.status(200).send(categories.rows)
	} catch (err) {
		res.sendStatus(500)
	}
})


app.post('/categories', async (req, res) => {
	const category = req.body.name
	console.log(category)
	const categorySchema = joi.object({
		name: joi.string()
			.required()
	})
	const validationEntry = categorySchema.validate({name: category})
	if(validationEntry.error){
		res.sendStatus(400)
        return;
    }
	try {
		const verificationOfExistence = await connection.query(`
			SELECT * FROM categories WHERE name LIKE ($1)
		`, [category])
		console.log(verificationOfExistence)
		if (verificationOfExistence.rowCount != 0) {
			return res.sendStatus(409)
		}
		await connection.query(`
			INSERT INTO categories (name) VALUES ($1)
		`, [category])
		res.status(201).send('Entrada salva')
	} catch (err) {
		res.sendStatus(500)
	}
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`|-----------------------------------|`)
    console.log(`| Running at http://localhost:${port}  |`)
    console.log(`|-----------------------------------|`)
})