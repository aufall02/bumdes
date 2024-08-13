import express from 'express';
import routeUser from "./users.js";
import routeAuth from "./auth.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', routeAuth)
router.use('/users', routeUser);

export default router;

