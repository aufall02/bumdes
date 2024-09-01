import express from 'express';
import routeUser from "./users.js";
import routeAuth from "./auth.js";
import routeFiles from "./files.js";
import googleSetup from "../application/googleSetup.js";
import fs from "fs";
import {logger} from "../application/logging.js";
import {database} from "../application/database.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', routeAuth)
router.use('/users', routeUser);
router.use('/files', routeFiles);
router.use('/google/auth',(req,res,next)=>{
  const url = googleSetup.oauth2Client.generateAuthUrl({
    access_type:'offline',
    prompt: 'consent',
    scope:[
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/drive',
    ],
  })

  res.redirect(url)
})

router.use('/redirect', async (req,res,next)=>{
  const code = req.query
  const {tokens } = await googleSetup.oauth2Client.getToken(code)
  logger.info('token', tokens)
  googleSetup.oauth2Client.setCredentials(tokens)
  await database.from('token').insert({
    token: tokens
  })
  // fs.writeFileSync(  "tmp/creds.json", JSON.stringify(tokens))
  res.send('sukses')
});


export default router;