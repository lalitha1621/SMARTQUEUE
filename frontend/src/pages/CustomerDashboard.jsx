import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import socket from "../services/socket";

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);
  const [servicesError, setServicesError] = useState(""); // ✅ FIX: Track load errors

  const customerId = localStorage.getItem("userId") || "1";
  const userEmail = localStorage.getItem("email") || "user@smartqueue.com";

  // ✅ FIX: useCallback so socket listeners don't create stale closures
  const loadCustomerData = useCallback(async () => {
    try {
      setServicesError("");
      const sRes = await api.get("/token/services");
      const serviceList = sRes.data || [];
      setServices(serviceList);

      // ✅ FIX: Only set default selected service once, not on every reload
      setSelectedService((prev) => {
        if (!prev && serviceList.length > 0) return String(serviceList[0].id);
        return prev;
      });
    } catch (err) {
      console.error("Error loading services:", err);
      setServicesError("Unable to load services. Please refresh the page.");
    }

    try {
      const aRes = await api.get(`/token/appointments/customer/${customerId}`);
      setMyAppointments(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  }, [customerId]); // ✅ FIX: Only customerId as dependency — no selectedService

  useEffect(() => {
    loadCustomerData();

    // Socket listeners
    socket.on("appointment_updated", loadCustomerData);
    socket.on("token_called", loadCustomerData);

    return () => {
      socket.off("appointment_updated", loadCustomerData);
      socket.off("token_called", loadCustomerData);
    };
  }, [loadCustomerData]); // ✅ FIX: Correct dependency — no infinite loop

  const handleInstantToken = async () => {
    if (!selectedService) return alert("Please select a service first.");
    try {
      const res = await api.post("/token/generate", {
        service_id: selectedService,
        customer_name: `User #${customerId}`,
      });
      setGeneratedToken(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Error generating token. Please try again.";
      alert(msg);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!selectedService) return alert("Please select a service.");
    if (!meetDate || !meetTime) return alert("Please select both a date and time.");

    try {
      await api.post("/token/appointments/book", {
        customer_id: customerId,
        service_id: selectedService,
        customer_name: `User #${customerId}`,
        requested_date: meetDate,
        requested_time: meetTime,
      });
      alert("Appointment booked successfully!");
      setMeetDate("");
      setMeetTime("");
      loadCustomerData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to book appointment. Please try again.";
      alert(msg);
    }
  };

  const pendingCount = myAppointments.filter((a) => a.status === "PENDING").length;
  const approvedCount = myAppointments.filter((a) => a.status === "APPROVED").length;

  return (
    <div style={{ padding: "30px", background: "#F0F9FF", minHeight: "92vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Profile Meta Ribbon */}
        <div style={styles.profileHeader}>
          <div>
            <h2 style={{ margin: 0, color: "#0369A1" }}>👤 Customer Account Profile</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>
              UID Reference: <strong>{customerId}</strong> | Channel: {userEmail}
            </p>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ ...styles.miniBadge, background: "#E0F2FE", color: "#0369A1" }}>⏳ {pendingCount} Pending</div>
            <div style={{ ...styles.miniBadge, background: "#DCFCE7", color: "#16A34A" }}>✅ {approvedCount} Confirmed</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>

          {/* Action Module */}
          <div style={styles.card}>
            <h3 style={{ color: "#0369A1", marginTop: 0 }}>🎟️ Request Instant Queue Allocation</h3>

            <label style={styles.label}>Select Department Target Track</label>

            {/* ✅ FIX: Show error if services failed to load */}
            {servicesError ? (
              <div style={styles.errorBox}>{servicesError}</div>
            ) : services.length === 0 ? (
              <div style={styles.warningBox}>
                ⚠️ No services available. Please contact the administrator.
              </div>
            ) : (
              <select
                style={styles.input}
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services.map((s) => (
                  // ✅ FIX: Show service name and prefix clearly
                  <option key={s.id} value={s.id}>
                    {s.name} [{s.prefix}]
                  </option>
                ))}
              </select>
            )}

            <button
              style={{ ...styles.btn, background: "#0EA5E9", width: "100%", opacity: services.length === 0 ? 0.5 : 1 }}
              onClick={handleInstantToken}
              disabled={services.length === 0}
            >
              Generate Dynamic Token Code
            </button>

            {generatedToken && (
              <div style={styles.tokenDisplayBlock}>
                <span style={{ fontSize: "11px", color: "#0369A1", fontWeight: "bold" }}>YOUR TICKET NUMBER</span>
                <h1 style={{ fontSize: "52px", margin: "5px 0", color: "#0369A1" }}>{generatedToken.token_number}</h1>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Status: <strong style={{ color: "#0369A1" }}>{generatedToken.status}</strong>
                </p>
              </div>
            )}

            <hr style={{ margin: "25px 0", border: 0, borderTop: "1px solid #E2E8F0" }} />

            <h3 style={{ color: "#0369A1", marginTop: 0 }}>📅 Reserve Calendar Booking Slot</h3>
            <form onSubmit={handleScheduleMeeting}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Requested Date</label>
                  <input style={styles.input} type="date" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Target Time Window</label>
                  <input style={styles.input} type="time" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} />
                </div>
              </div>
              <button
                style={{ ...styles.btn, background: "#0284C7", width: "100%", opacity: services.length === 0 ? 0.5 : 1 }}
                type="submit"
                disabled={services.length === 0}
              >
                File Schedule Registration
              </button>
            </form>
          </div>

          {/* Records Log */}
          <div style={styles.card}>
            <h3 style={{ color: "#0369A1", marginTop: 0 }}>📋 Historical Records & Verification Tracks</h3>
            <div style={{ overflowY: "auto", maxHeight: "480px" }}>
              {myAppointments.length === 0 ? (
                <p style={{ color: "#94A3B8" }}>No appointments booked yet.</p>
              ) : (
                myAppointments.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      ...styles.logItem,
                      borderLeft:
                        app.status === "APPROVED"
                          ? "5px solid #22C55E"
                          : app.status === "REJECTED"
                          ? "5px solid #EF4444"
                          : "5px solid #64748B",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{app.service_name} ({app.prefix})</strong>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color:
                            app.status === "APPROVED"
                              ? "#16A34A"
                              : app.status === "REJECTED"
                              ? "#EF4444"
                              : "#475569",
                        }}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
                      {app.requested_date?.split("T")[0]} at {app.requested_time}
                    </p>
                    {app.manager_notes && (
                      <p style={styles.noteText}>💬 Feedback: "{app.manager_notes}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  profileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px 25px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(14, 165, 233, 0.05)" },
  miniBadge: { padding: "8px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" },
  card: { background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" },
  label: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "5px" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", boxSizing: "border-box", marginBottom: "15px" },
  btn: { padding: "12px", border: "none", color: "#fff", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  tokenDisplayBlock: { marginTop: "15px", padding: "15px", background: "#E0F2FE", borderRadius: "12px", textAlign: "center" },
  logItem: { background: "#F8FAFC", padding: "12px", borderRadius: "8px", marginBottom: "10px" },
  noteText: { margin: "5px 0 0 0", fontSize: "12px", color: "#0284C7", background: "#EFF6FF", padding: "6px", borderRadius: "4px" },
  errorBox: { background: "#FEF2F2", color: "#EF4444", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", border: "1px solid #FEE2E2" },
  warningBox: { background: "#FEF9C3", color: "#A16207", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", border: "1px solid #FDE68A" },
};
