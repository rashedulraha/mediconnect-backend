import { Router } from "express";
import { userController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.patch(
  "/profile-img",
  auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  upload.single("profile-img"),
  userController.uploadProfileImg,
);

// export user routers
export const userRoute = router;
