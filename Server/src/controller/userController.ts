import type { Request, Response } from "express";
import asyncHandler from "../utilities/asynchandler.js";
import ApiError from "../utilities/ApiError.js";
import { prisma } from "../utilities/prisma.js";
import ApiResponse from "../utilities/ApiResponse.js";

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.id;
    console.log("userId", userId);
    if (!userId) throw new ApiError(400, "User not found");
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        picture: true,
      },
    });
    return res.status(200).json(new ApiResponse(200, user, "user information"));
  }
);

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, picture } = req.body;

    const userId = req.id as number;
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name || user?.name,
        picture: picture || user?.picture,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "updated successfully"));
  }
);
