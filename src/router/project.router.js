import express from "express";
import {
  createProject,
  getAllProject,
  viewProjectById,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";

import { isAuthenticated, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("Admin"),
  createProject
);

router.get(
  "/",
  isAuthenticated,
  authorizeRoles("Admin", "Client"),
  getAllProject
);

router.get(
  "/:project_id",
  isAuthenticated,
  authorizeRoles("Admin", "Client"),
  viewProjectById
);

router.put(
  "/:project_id",
  isAuthenticated,
  authorizeRoles("Admin"),
  updateProject
);

router.delete(
  "/:project_id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteProject
);

export default router;
