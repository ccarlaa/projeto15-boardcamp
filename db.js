import pg from "pg"

const { Pool } = pg
const db = {
	connectionString: process.env.DATABASE_URL,
  	user: "postgres",
	password: PASSWORD,
	database: "boardcamp"
}

if(process.env.MODE === "PROD"){
	db.ssl = {
		rejectUnauthorized: false
	}
}

const connection = new Pool(db)

export default connection