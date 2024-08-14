import {logger} from "../application/logging.js";
import authService from "../services/authService.js";

export const authenticateJWT = async (req, res, next) => {
    logger.info(req.headers["authorization"])
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            req.user = await authService.checkAuth(token); // Attach user info to request
            logger.info(req.user, 'req.user')
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    } else {
        res.status(401).json({ message: 'Token not provided' });
    }
};