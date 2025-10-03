import express from "express";
import {
  getGithubAuthURL,
  getGoogleAuthURL,
  githubCallback,
  googleCallback,
  login,
  signup,
  verifyOTP,
} from "../controller/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verifyOTP", verifyOTP);
router.get("/google/url", getGoogleAuthURL);
router.get("/google/callback", googleCallback);
router.get("/github/url", getGithubAuthURL);
router.get("/github/callback", githubCallback);

export default router;
