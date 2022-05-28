import pg from "pg"

const { Pool } = pg
const connection = new Pool({
	connectionString: process.env.DATABASE_URL,
  	user: "postgres",
	password: "102545",
	database: "boardcamp"
})

export default connection