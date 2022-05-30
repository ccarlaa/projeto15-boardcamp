import { Router } from "express"
import { getRentals, postRentals, postRentalsById, deleteRentals } from "../Controllers/RentalsControllers.js"
import { rentalsPostMiddleware, rentalsPostByIdMiddleware } from "../Middlewares/RentalsMiddlewares.js"


const rentalsRoute = Router();

rentalsRoute.get('/rentals', getRentals)
rentalsRoute.post('/rentals', rentalsPostMiddleware, postRentals)
rentalsRoute.post('/rentals/:id/return', rentalsPostByIdMiddleware, postRentalsById)
rentalsRoute.delete('/rentals/:id', deleteRentals)


export default rentalsRoute
