import express from 'express';
import { generateNewRefreshToken, loginController, logoutController, registerController } from '../controllers/auth.js';
import { verifyJWT } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerController)

router.post('/login', loginController);

router.post('/refresh', generateNewRefreshToken);

router.post('/logout', verifyJWT, logoutController);

export default router;