import connection from "../db.js";

export async function getCustomers(req, res) {
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
}

export async function getCustomersById(req, res) {
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
}

export async function postCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body
    try {
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
}

export async function putCustomers(req, res) {
    const id = req.params.id
	const { name, phone, cpf, birthday } = req.body
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
}