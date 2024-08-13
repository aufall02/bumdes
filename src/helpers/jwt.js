import jwt from 'jsonwebtoken';
import 'dotenv/config.js'


const JWT_SECRET_KEY =  process.env.JWT_SECRET_KEY|| 'your_secret_key';

export const compileJWT = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, JWT_SECRET_KEY, {expiresIn});
};

export const decompileJWT = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};