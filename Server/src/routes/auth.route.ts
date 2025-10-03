import express from 'express'
import { getGoogleAuthURL, googleCallback, login, signup, verifyOTP } from '../controller/authController.js';
import { verify } from 'crypto';
const router = express.Router();

router.post('/login',login);
router.post('/signup',signup);
router.post('/verifyOTP',verifyOTP);
router.get('/google/url',getGoogleAuthURL);
router.get('/google/callback', googleCallback);

export default router;