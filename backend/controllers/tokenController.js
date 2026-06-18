const pool = require("../config/db");
exports.generate = async (req, res) => {
    try {
        const { service_id, customer_name } = req.body;
 
        // ✅ FIX: Validate required fields
        if (!service_id) return res.status(400).json({ message: "service_id is required." });
        if (!customer_name) return res.status(400).json({ message: "customer_name is required." });
 
        const serviceRes = await pool.query("SELECT * FROM services WHERE id=$1", [service_id]);
        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ message: "Service not found." });
        }
        const service = serviceRes.rows[0];
 
        const countRes = await pool.query("SELECT COUNT(*) FROM tokens WHERE service_id=$1", [service_id]);
        const nextNum = parseInt(countRes.rows[0].count) + 1;
        const tokenDisplay = `${service.prefix}-${nextNum}`;
 
        const result = await pool.query(
            `INSERT INTO tokens(service_id, customer_name, token_number, status) 
             VALUES($1, $2, $3, 'WAITING') RETURNING *`,
            [service_id, customer_name, tokenDisplay]
        );
 
        global.io.emit("token_created", result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("generate error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
exports.callNext = async (req, res) => {
    try {
        const { service_id } = req.body;
 
        // ✅ FIX: Validate required field
        if (!service_id) return res.status(400).json({ message: "service_id is required." });
 
        const result = await pool.query(
            `SELECT * FROM tokens WHERE service_id=$1 AND status='WAITING' 
             ORDER BY id ASC LIMIT 1`,
            [service_id]
        );
 
        if (result.rows.length === 0) {
            return res.json({ message: "No tokens" });
        }
 
        const token = result.rows[0];
        await pool.query("UPDATE tokens SET status='CALLED' WHERE id=$1", [token.id]);
 
        global.io.emit("token_called", token);
        res.json(token);
    } catch (err) {
        console.error("callNext error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
// ✅ FIX: Return only necessary fields — prevents undefined field mismatches on frontend
exports.getServices = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, prefix, description FROM services ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("getServices error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
exports.createService = async (req, res) => {
    try {
        const { name, prefix, description } = req.body;
 
        // ✅ FIX: Validate ALL fields before touching the DB (was crashing on prefix.toUpperCase() when undefined)
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Service name is required." });
        }
        if (!prefix || !prefix.trim()) {
            return res.status(400).json({ message: "Prefix code is required." });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: "Description is required." });
        }
 
        const cleanPrefix = prefix.trim().toUpperCase();
 
        // ✅ FIX: Validate prefix format — letters only
        if (!/^[A-Z]+$/.test(cleanPrefix)) {
            return res.status(400).json({ message: "Prefix must contain letters only (e.g. HOSP, VISA)." });
        }
 
        // ✅ FIX: Check for duplicate prefix before inserting
        const existing = await pool.query("SELECT id FROM services WHERE prefix=$1", [cleanPrefix]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: `Prefix "${cleanPrefix}" already exists. Choose a unique prefix.` });
        }
 
        const result = await pool.query(
            "INSERT INTO services(name, prefix, description) VALUES($1, $2, $3) RETURNING id, name, prefix, description",
            [name.trim(), cleanPrefix, description.trim()]
        );
 
        res.json(result.rows[0]);
    } catch (err) {
        console.error("createService error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
 
// =========================================================================
// 📅 PART 2: MEETING SCHEDULING & APPROVAL WORKFLOW
// =========================================================================
 
exports.bookAppointment = async (req, res) => {
    try {
        const { customer_id, service_id, customer_name, requested_date, requested_time } = req.body;
 
        // ✅ FIX: Validate required fields
        if (!customer_id || !service_id || !requested_date || !requested_time) {
            return res.status(400).json({ message: "customer_id, service_id, requested_date and requested_time are all required." });
        }
 
        // ✅ FIX: Verify service exists before booking
        const svc = await pool.query("SELECT id FROM services WHERE id=$1", [service_id]);
        if (svc.rows.length === 0) {
            return res.status(404).json({ message: "Selected service does not exist." });
        }
 
        const result = await pool.query(
            `INSERT INTO appointments (customer_id, service_id, customer_name, requested_date, requested_time, status) 
             VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING *`,
            [customer_id, service_id, customer_name, requested_date, requested_time]
        );
 
        global.io.emit("appointment_requested", result.rows[0]);
        res.json({ success: true, appointment: result.rows[0] });
    } catch (err) {
        console.error("bookAppointment error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
exports.getMyAppointments = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const result = await pool.query(
            `SELECT a.*, s.name as service_name, s.prefix 
             FROM appointments a 
             JOIN services s ON a.service_id = s.id 
             WHERE a.customer_id = $1 
             ORDER BY a.requested_date DESC, a.requested_time DESC`,
            [customer_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("getMyAppointments error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
exports.getAllAppointments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, s.name as service_name, s.prefix 
             FROM appointments a 
             JOIN services s ON a.service_id = s.id 
             ORDER BY CASE WHEN a.status = 'PENDING' THEN 1 ELSE 2 END, a.requested_date ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("getAllAppointments error:", err);
        res.status(500).json({ error: err.message });
    }
};
 
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointment_id, status, updated_date, updated_time, manager_notes } = req.body;
 
        // ✅ FIX: Validate required fields
        if (!appointment_id || !status) {
            return res.status(400).json({ message: "appointment_id and status are required." });
        }
 
        const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
        }
 
        const result = await pool.query(
            `UPDATE appointments 
             SET status=$1, requested_date=$2, requested_time=$3, manager_notes=$4 
             WHERE id=$5 RETURNING *`,
            [status, updated_date, updated_time, manager_notes, appointment_id]
        );
 
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Appointment not found." });
        }
 
        global.io.emit("appointment_updated", result.rows[0]);
        res.json({ success: true, appointment: result.rows[0] });
    } catch (err) {
        console.error("updateAppointmentStatus error:", err);
        res.status(500).json({ error: err.message });
    }
};