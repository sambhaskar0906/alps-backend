import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, contact, password, role } = req.body;

  if (!fullName || !email || !contact || !password) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { contact }] });
  if (existingUser) {
    throw new ApiError(409, "User with given email or contact already exists");
  }

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Profile photo is required");
  }

  const uploadedFile = await uploadOnCloudinary(localFilePath);

  if (!uploadedFile?.secure_url) {
    throw new ApiError(500, "Profile photo upload failed");
  }

  const user = await User.create({
    fullName,
    email,
    contact,
    password,
    profilePhoto: uploadedFile.secure_url,
    role,

  });

  res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(403, "Please enter your email or password")
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(404, "User not found with this emailId");
    }

    const isPasswordCorrect = await user.comparePassword(password);;
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Password is invalid");
    }
    const token = jwt.sign(
      {
        user_id: user.user_id,
        id: user._id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "12h" },
    );

    res.cookie("accessToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
    const UserData = user.toObject();
    delete UserData.password;

    return res.status(200).json(
      new ApiResponse(200, {
        token,
        user: UserData,
      }, "Login Successfully")
    );
  }
  catch (err) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, `Login Failed: ${err.message}`));
  }


})

const tokenBlacklist = new Set();
export const logoutUser = asyncHandler(async (req, res) => {
  try {

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not logged in"));
    }
    if (token) {
      tokenBlacklist.add(token);
    }


    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.error("Logout error:", error.message);
    throw new ApiError(500, "Logout failed", error.message);
  }
})
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const user = await User.findOne({ user_id }).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});


export const updateUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const updateData = req.body;

  if (updateData.password) {
    throw new ApiError(400, "Password can't be updated from this route");
  }

  if (req.file?.path) {
    const uploadedFile = await uploadOnCloudinary(req.file.path);

    if (!uploadedFile?.secure_url) {
      throw new ApiError(500, "Profile photo upload failed");
    }

    updateData.profilePhoto = uploadedFile.secure_url;
  }

  const updatedUser = await User.findOneAndUpdate(
    { user_id },
    updateData,
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found to update");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});


export const deleteUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const deleted = await User.findOneAndDelete({ user_id });
  if (!deleted) {
    throw new ApiError(404, "User not found to delete");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});
