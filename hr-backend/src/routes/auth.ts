import { Router } from "express";
import { authController } from "../controllers/authcontroller";

const routes = Router()

routes.post('/register', authController.register);
routes.post('/login', authController.login);


export default routes;