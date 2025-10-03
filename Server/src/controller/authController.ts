import type { Request, Response } from "express";
import asyncHandler from "../utilities/asynchandler.js";
import ApiError from "../utilities/ApiError.js";
import { prisma } from "../utilities/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utilities/ApiResponse.js";
import dotenv from "dotenv";
import { sendEmail } from "../utilities/sendOTP.js";
dotenv.config();
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email?.trim() === "" || !email || password?.trim() === "" || !password) {
    throw new ApiError(400, "Email and Password are Required");
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) throw new ApiError(400, "User doesn't exist with this mail id");
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw new ApiError(400, "Password is incorrect");
  const payload = {
    id: user.id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!);
  return res
    .cookie("token", token, {
      sameSite: "strict",
      httpOnly: true,
      secure: false,
    })
    .status(200)
    .json(new ApiResponse(200, {}, "successfully login"));
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (
    !email ||
    !name ||
    !password ||
    email.trim().length === "" ||
    password.trim().length === "" ||
    name.trim().length === ""
  )
    throw new ApiError(400, "Fields are missing");

  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (existingUser) throw new ApiError(403, "User already exists");
  const otp = Math.floor(10000 + Math.random() * 90000);

  await prisma.otp.create({
     data: {
       email,
       otp,
     },
   });
  const emailResult = await sendEmail(email, otp);
   if(!emailResult.success)
        throw new ApiError(500, "failed to send the mail")
  res.json(new ApiResponse(200, {}, "OTP Sent Successfully"));
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp, email, name, password } = req.body;
  const OTP = await prisma.otp.findFirst({
    where: {
      email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!name || !email || !password || !otp)
    throw new ApiError(400, "fields are missing");
  if (!OTP) throw new ApiError(400, "otp not matched");
  const time = Date.now() - new Date(OTP.createdAt).getTime();
  if (time > 180000) throw new ApiError(400, "time passed");
  if (OTP.otp !== parseInt(otp)) throw new ApiError(403, "OTP is incorrect");
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  const payload = {
    id: newUser.id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!);
  res
    .status(200)
    .cookie("token", token, {
      sameSite: "strict",
      httpOnly: true,
      secure: false,
    })
    .json(new ApiResponse(200, {}, "User successfully created"));
});
