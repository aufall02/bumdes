import {database} from "../application/database.js";
import {logger} from "../application/logging.js";
import bcrypt from "../helpers/bcrypt.js";
import {compileJWT, decompileJWT} from "../helpers/jwt.js";


const loginUser = async (username, password) => {
    logger.info("loginUser", username, password);

    const { data: user, error: userError } = await database
        .from('users')
        .select('id, username, password, unit')
        .eq('username', username)
        .single();

    if (userError) {
        logger.error(`Error fetching user: ${userError.message}`);
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.decryptPassword(password, user.password);
    if (!isPasswordValid) {
        logger.error('Invalid password');
        throw new Error('Invalid password');
    }

    const payload = {
        userId: user.id,
        username: user.username,
        unit: user.unit
    };
    const token = await compileJWT(payload)
    return { token };
};


const checkAuth = async (token) => {
    try {
        logger.info("checkAuth", token);
        return decompileJWT(token)
    } catch (error) {
        logger.error(`Invalid or expired token: ${error.message}`);
        throw new Error('Invalid or expired token');
    }
};

export default {
    checkAuth,
    loginUser,
};
