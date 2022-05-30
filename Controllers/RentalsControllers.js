import connection from "../db.js"
import dayjs from "dayjs"

export async function getRentals(req, res) {
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
}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body
    const { game } = res.locals
    try {
		const rentDate = dayjs().format("DD-MM-YYYY")
		const originalPrice = (daysRented*game[0].pricePerDay)
		await connection.query(`
			INSERT INTO 
				rentals ("customerId", "gameId", "rentDate", "daysRented", "originalPrice")
			VALUES 
				($1, $2, $3, $4, $5) 
		`, [customerId, gameId, `'${rentDate}'`, daysRented, `${originalPrice}`]) 
		res.status(201).send('Entrada salva')
	} catch(err) {
		res.sendStatus(500)
	}
}

export async function postRentalsById(req, res) {
    const { id } = req.params
	const returnDate = dayjs().format("YYYY-MM-DD HH:mm")
    try {
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
}

export async function deleteRentals(req, res) {
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
}