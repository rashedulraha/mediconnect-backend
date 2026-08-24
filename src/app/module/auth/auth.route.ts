import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.registerPatientValidationSchema),
	AuthController.registerPatient,
);

router.post(
	"/login",
	validateRequest(AuthValidation.loginValidationSchema),
	AuthController.loginUser,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
	"/change-password",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	validateRequest(AuthValidation.changePasswordValidationSchema),
	AuthController.changePassword,
);

router.post(
	"/logout",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	AuthController.logout,
);

router.get(
	"/me",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	AuthController.getMe,
);

export const AuthRoutes = router;
