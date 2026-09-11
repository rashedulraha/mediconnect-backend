import { Router } from "express";
import { appointmentsControllers } from "./appointment.controller";

const router = Router();

router.post("/book-appointment", appointmentsControllers.bookAppointment);

// book appointment call back url
router.get(
  "/book-appointment/payment/callback",
  appointmentsControllers.bookAppointmentCallback,
);

export const appointmentRoutes = router;
