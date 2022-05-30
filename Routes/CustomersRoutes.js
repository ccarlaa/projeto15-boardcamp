import { Router } from "express"
import { getCustomers, getCustomersById, postCustomers, putCustomers } from "../Controllers/CustomersControllers.js";
import { postCustomersMiddleware, putCustomersMiddleware } from "../Middlewares/CustomersMiddlewares.js"

const customersRoute = Router();

customersRoute.get('/customers', getCustomers)
customersRoute.get('/customers/:id', getCustomersById)
customersRoute.post('/customers', postCustomersMiddleware, postCustomers)
customersRoute.put ('/customers/:id', putCustomersMiddleware, putCustomers)

export default customersRoute