import express from 'express';
import routeUser from "./users.js";
import routeAuth from "./auth.js";
import routeFiles from "./files.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', routeAuth)
router.use('/users', routeUser);
router.use('/files', routeFiles);

export default router;

