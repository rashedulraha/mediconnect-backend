import { Router } from "express";
import { appointmentsControllers } from "./appointment.controller";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post(
	"/book-appointment",
	auth(),
	appointmentsControllers.bookAppointment,
);

router.post("/pay-appointment", auth(), appointmentsControllers.payAppointment);

router.post(
	"/cancel-appointment",
	auth(),
	appointmentsControllers.cancelAppointment,
);

// book appointment call back url
router.get(
	"/book-appointment/payment/callback",
	appointmentsControllers.bookAppointmentCallback,
);

export const appointmentRoutes = router;
