import { Router } from "express";
import encuestasRouter from "./encuestasRouter.js"
import respuestasRouter from "./respuestasRouter.js"

const mainRouter = Router();

mainRouter.get('/', (req, res) => {
    res.send('¡HOLAA MUNDO, DESDE MAIN ROUTER!');
});

//Enrutamiento.
mainRouter.use("/encuestas",encuestasRouter);
mainRouter.use("/respuestas",respuestasRouter);


export default mainRouter;