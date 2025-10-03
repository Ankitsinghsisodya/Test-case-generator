import type { Request, Response } from "express";
import asyncHandler from "../utilities/asynchandler.js";
import ApiError from "../utilities/ApiError.js";
import { prisma } from "../utilities/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utilities/ApiResponse.js";
import dotenv from "dotenv";
import { sendEmail } from "../utilities/sendOTP.js";
import axios from 'axios'
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
  if(!user.password)throw new ApiError(400, "First make an password")
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
  if (!emailResult.success) throw new ApiError(500, "failed to send the mail");
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

export const getGoogleAuthURL = asyncHandler(
  async (req: Request, res: Response) => {

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    if (!process.env.SERVER_ROOT_URI || !process.env.GOOGLE_CLIENT_ID)
      throw new ApiError(400, "Some fields are missing");
    const options = {
      redirect_uri: `${process.env.SERVER_ROOT_URI}/api/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    const authUrl = `${rootUrl}?${qs.toString()}`;

    res.json(new ApiResponse(200, { authUrl }, "Google auth URL generated"));
  }
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
      throw new ApiError(400, "Authorization code is required");
    }

    try {
      // Get tokens from Google
      const tokens = await getTokens({
        code: code as string,
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: `${process.env.SERVER_ROOT_URI}/api/auth/google/callback`,
      });

      // Get user info from Google
      const googleUser = await axios
        .get(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`,
          {
            headers: { Authorization: `Bearer ${tokens.id_token}` },
          }
        )
        .then((res) => res.data);

      // Check if user exists in database
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email: googleUser.email }, { googleId: googleUser.id }],
        },
      });

      // If user doesn't exist, create new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: googleUser.name,
            email: googleUser.email,
            googleId: googleUser.id,
            picture: googleUser.picture,
            password: null, // No password for Google users
          },
        });
      } else if (!user.googleId) {
        // If user exists but doesn't have googleId, update it
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id },
        });
      }

      // Create JWT token
      const payload = {
        id: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
        expiresIn: "7d",
      });

      // Set cookie and redirect
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "lax",
        })
        .redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect(`${process.env.CLIENT_URL}/signin?error=google_auth_failed`);
    }
  }
);

// Helper function for getting tokens
async function getTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post(url, new URLSearchParams(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch auth tokens:", error.response?.data?.error);
    throw new Error(error.message);
  }
}
