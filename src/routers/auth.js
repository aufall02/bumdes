import express from 'express';
import authController from "../controllers/authController.js";
const routeAuth = express.Router();

routeAuth.post('/login',authController.loginUser);
routeAuth.post('/logout',authController.logoutUser);
routeAuth.get('/check-auth',authController.checkAuth);

export default routeAuth;