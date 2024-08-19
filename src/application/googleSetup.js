import {google} from 'googleapis'
import 'dotenv/config.js'
import * as fs from "node:fs";
import {logger} from "./logging.js";
import {database} from "./database.js";

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL,
})

try {
    // const creds = fs.readFileSync('tmp/creds.json');
    const {data} = await database.from('token').select('token').single();
    console.log(data)
    oauth2Client.setCredentials(data.token);
    const tokenInfo = oauth2Client.credentials;

    if (tokenInfo) {
        const expiryDate = tokenInfo.expiry_date;
        console.log(expiryDate)
        const isExpired = expiryDate && expiryDate < Date.now();

        if (isExpired) {
            console.log('Token has expired. Refreshing token...');
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);

            // fs.writeFileSync('tmp/creds.json', JSON.stringify(credentials));
            await database.from('token').update({token: credentials});
            console.log('Token refreshed and saved.');
        } else {
            console.log('Token is still valid.');
        }
    } else {
        console.log('No token found.');
    }
}catch (e) {
    logger.error('auth error', e);
}

export default{
    oauth2Client,
    google
}