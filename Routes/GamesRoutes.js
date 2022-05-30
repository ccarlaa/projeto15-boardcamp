import { Router } from "express"
import { getGames, postGames } from "../Controllers/GamesControllers.js"
import  { gamesPostMiddleware }  from "../Middlewares/GamesMiddlewares.js"

const gamesRoute = Router();

gamesRoute.get('/games', getGames)
gamesRoute.post('/games', gamesPostMiddleware, postGames)
gamesRoute.post('/games', gamesPostMiddleware, postGames)

export default gamesRoute
