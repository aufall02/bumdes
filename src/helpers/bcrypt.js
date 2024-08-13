import bcrypt from 'bcrypt';


const saltRounds = 10;

const encryptPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
}

const decryptPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

export default {
    encryptPassword,
    decryptPassword,
}