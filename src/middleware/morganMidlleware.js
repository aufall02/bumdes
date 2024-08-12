import {logger} from "../application/logging.js";
import morgan from "morgan";
import stripAnsi from "strip-ansi";



const processLog = (message) => {
    // Ekstrak status kode dari log
    const statusCode = message.match(/\d{3}/)?.[0] || '200';

    // Tentukan tingkat keparahan berdasarkan status kode
    if (statusCode.startsWith('4')) {
        return logger.warn(stripAnsi(message.trim()));
    } else if (statusCode.startsWith('5')) {
        return logger.error(stripAnsi(message.trim()));
    } else {
        return logger.info(stripAnsi(message.trim()));
    }
};

export const morganMiddleware = morgan('dev', {
    stream: {
        write: message => processLog(message)
    }
});