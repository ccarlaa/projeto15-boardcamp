import connection from "../db.js";

export async function getCategories(req, res) {
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
}

export async function postCategories(req, res) {
    const category = req.body.name
    try {
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
}