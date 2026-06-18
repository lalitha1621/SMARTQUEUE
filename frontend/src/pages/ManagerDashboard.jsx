// frontend/src/pages/ManagerDashboard.jsx
import { useState, useEffect } from "react";
import api from "../services/api";
import socket from "../services/socket";

export default function ManagerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [adjDate, setAdjDate] = useState("");
  const [adjTime, setAdjTime] = useState("");
  const [notes, setNotes] = useState("");
  const [signals, setSignals] = useState([]);

  const managerId = localStorage.getItem("userId") || "Mgr_Cluster";

  const loadPipeline = async () => {
    try {
      const res = await api.get("/token/appointments/manager/all");
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error reading platform architecture:", err);
    }
  };

  useEffect(() => {
    loadPipeline();
    socket.on("appointment_requested", (data) => {
      loadPipeline();
      setSignals(prev => [`Booking request filed by ${data.customer_name}`, ...prev.slice(0, 4)]);
    });
    return () => socket.off("appointment_requested");
  }, []);

  const openProcessingModal = (app) => {
    setSelectedApp(app);
    setAdjDate(app.requested_date ? app.requested_date.split("T")[0] : "");
    setAdjTime(app.requested_time || "");
    setNotes(app.manager_notes || "");
  };

  const handleUpdateStatus = async (statusTarget) => {
    if (!selectedApp) return;
    try {
      await api.post("/token/appointments/manager/action", {
        appointment_id: selectedApp.id,
        status: statusTarget,
        updated_date: adjDate,
        updated_time: adjTime,
        manager_notes: notes
      });
      alert(`Transaction catalog modified state to: ${statusTarget}`);
      setSelectedApp(null);
      loadPipeline();
    } catch (err) {
      alert("Failed status modifications operations execution.");
    }
  };

  const totalPending = appointments.filter(a => a.status === "PENDING").length;

  return (
    <div style={{ padding: "30px", background: "#FAF5FF", minHeight: "92vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Manager Profile Ribbon */}
        <div style={styles.profileHeader}>
          <div>
            <h2 style={{ margin: 0, color: "#6B21A8" }}>🍇 Operations Management Controller</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>Operator ID Code: <strong>{managerId}</strong> | Control Matrix Namespace Monitor</p>
          </div>
          <div style={styles.badge}>{totalPending} Pending Requests Critical</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "25px" }}>
          {/* Data Processing Pipeline */}
          <div style={styles.pane}>
            <h3 style={{ color: "#6B21A8", marginTop: 0 }}>📋 Pipeline Core Allocation Calendar</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F3E8FF", textAlign: "left" }}>
                  <th style={styles.th}>Client Name</th>
                  <th style={styles.th}>Track Sector</th>
                  <th style={styles.th}>Requested Matrix</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Execution</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.map(app => (
                  <tr key={app.id} style={{ borderBottom: "1px solid #F3E8FF" }}>
                    <td style={styles.td}>{app.customer_name}</td>
                    <td style={styles.td}><strong>{app.prefix}</strong></td>
                    <td style={styles.td}>{app.requested_date?.split("T")[0]} - {app.requested_time}</td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: app.status === "PENDING" ? "#7C3AED" : "#1E293B" }}>{app.status}</td>
                    <td style={styles.td}>
                      <button style={styles.miniBtn} onClick={() => openProcessingModal(app)}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verification Box Context */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={styles.pane}>
              <h3 style={{ color: "#6B21A8", marginTop: 0 }}>🛠️ Slot Configuration Controls</h3>
              {selectedApp ? (
                <div>
                  <p style={{ fontSize: "14px" }}>Processing client: <strong>{selectedApp.customer_name}</strong></p>
                  
                  <label style={styles.label}>Adjust Date Field</label>
                  <input style={styles.input} type="date" value={adjDate} onChange={(e) => setAdjDate(e.target.value)} />

                  <label style={styles.label}>Adjust Time Window</label>
                  <input style={styles.input} type="time" value={adjTime} onChange={(e) => setAdjTime(e.target.value)} />

                  <label style={styles.label}>Feedback Internal Logs</label>
                  <textarea style={styles.input} rows="3" placeholder="Attach operational feedback or resolution tracking indices..." value={notes} onChange={(e) => setNotes(e.target.value)} />

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button style={{ ...styles.actionBtn, background: "#22C55E" }} onClick={() => handleUpdateStatus("APPROVED")}>Approve</button>
                    <button style={{ ...styles.actionBtn, background: "#EF4444" }} onClick={() => handleUpdateStatus("REJECTED")}>Reject</button>
                  </div>
                </div>
              ) : <p style={{ color: "#64748B", fontSize: "14px" }}>Select a target row item to deploy structural runtime corrections.</p>}
            </div>

            <div style={styles.pane}>
              <h4 style={{ color: "#6B21A8", margin: "0 0 10px 0" }}>⚡ Real-time Event Broadcaster</h4>
              <div style={styles.signalLog}>
                {signals.map((sig, i) => <p key={i} style={{ margin: "4px 0", fontStyle: "italic" }}>• {sig}</p>)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  profileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(168, 85, 247, 0.05)" },
  badge: { padding: "8px 15px", background: "#F3E8FF", color: "#6B21A8", borderRadius: "20px", fontWeight: "bold", fontSize: "13px" },
  pane: { background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" },
  th: { padding: "12px 10px", color: "#6B21A8", fontWeight: "bold" },
  td: { padding: "12px 10px", fontSize: "14px" },
  miniBtn: { padding: "4px 10px", background: "#A855F7", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  label: { display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginTop: "10px" },
  input: { width: "100%", padding: "8px", border: "1px solid #D8B4FE", borderRadius: "6px", boxSizing: "border-box", marginTop: "4px" },
  actionBtn: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  signalLog: { background: "#FAF5FF", padding: "10px", borderRadius: "8px", minHeight: "80px", color: "#6B21A8", fontSize: "12px" }
};