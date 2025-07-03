import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import {upload} from "../middleware/imageMulter.middleware.js";
const router = express.Router();

router.post("/",upload.single("profilePhoto") ,createUser);
router.get("/", getAllUsers);
router.post("/login",loginUser),
router.post("/logout",logoutUser);
router.get("/:user_id", getUserById);
router.put("/:user_id", upload.single("profilePhoto"),updateUser);
router.delete("/:user_id", deleteUser);

export default router;
