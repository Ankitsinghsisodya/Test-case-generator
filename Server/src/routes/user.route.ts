import express from "express";
import { getCurrentUser, updateUserDetails } from "../controller/userController.js";
import { authMiddleware } from "../middleware.ts/auth.middleware.js";

const router = express.Router();

router.get('/getCurrentUser',authMiddleware, getCurrentUser);
router.put('/updateUserDetails',authMiddleware, updateUserDetails);

export default router;
