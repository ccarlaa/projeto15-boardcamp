import { Router } from "express"
import { getCategories, postCategories } from "../Controllers/CategoriesControllers.js"
import  categoriesPostMiddleware  from "../Middlewares/CategoriesMiddlewares.js"

const categoriesRoute = Router();

categoriesRoute.get('/categories', getCategories)
categoriesRoute.post('/categories', categoriesPostMiddleware, postCategories)

export default categoriesRoute
