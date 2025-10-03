import express from 'express'
import { login, signup, verifyOTP } from '../controller/authController.js';
import { verify } from 'crypto';
const router = express.Router();

router.post('/login',login);
router.post('/signup',signup);
router.post('/verifyOTP',verifyOTP);

export default router;