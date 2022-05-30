import connection from "../db.js";

export async function getGames(req, res) {
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
}

export async function postGames(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body
	try {
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
}