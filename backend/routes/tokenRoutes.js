const router = require("express").Router();
const token = require("../controllers/tokenController");

// --- Core Token Queues ---
router.post("/generate", token.generate);
router.post("/call-next", token.callNext);

// --- Vertical Service Track Administration ---
router.get("/services", token.getServices);
router.post("/services", token.createService);

// --- Meeting Scheduling Flow ---
router.post("/appointments/book", token.bookAppointment);
router.get("/appointments/customer/:customer_id", token.getMyAppointments);
router.get("/appointments/manager/all", token.getAllAppointments);
router.post("/appointments/manager/action", token.updateAppointmentStatus);

module.exports = router;