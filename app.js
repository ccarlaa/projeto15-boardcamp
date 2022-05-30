import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import categoriesRoute from "./Routes/CategoriesRoutes.js"
import gamesRoute from "./Routes/GamesRoutes.js";
import customersRoute from "./Routes/CustomersRoutes.js";
import rentalsRoute from "./Routes/RentalsRoutes.js";


const app = express()
app.use(express.json())
app.use(cors())

dotenv.config()

app.use(categoriesRoute)
app.use(gamesRoute)
app.use(customersRoute)
app.use(rentalsRoute)

const port = process.env.PORT
app.listen(port, () => {
    console.log(`|-----------------------------------|`)
    console.log(`| Running at http://localhost:${port}  |`)
    console.log(`|-----------------------------------|`)
})