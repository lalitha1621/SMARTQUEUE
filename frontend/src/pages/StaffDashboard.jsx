import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import socket from "../services/socket";

export default function StaffDashboard() {
  const [services, setServices] = useState([]);
  const [activeService, setActiveService] = useState("");
  const [currentServing, setCurrentServing] = useState(null);
  const [servedCount, setServedCount] = useState(0);
  const [servicesError, setServicesError] = useState("");
  const [calling, setCalling] = useState(false);

  const staffId = localStorage.getItem("userId") || "Agent_Node";
  const staffRole = localStorage.getItem("role") || "Staff";

  // ✅ FIX: useCallback with no deps that change — stable reference for socket listeners
  const loadStaffData = useCallback(async () => {
    try {
      setServicesError("");
      const res = await api.get("/token/services");
      const list = res.data || [];
      setServices(list);

      // ✅ FIX: Only set default once using functional update — never triggers re-render loop
      setActiveService((prev) => {
        if (!prev && list.length > 0) return String(list[0].id);
        return prev;
      });
    } catch (err) {
      console.error("Error loading services:", err);
      setServicesError("Could not load services. Please refresh.");
    }
  }, []); // ✅ FIX: Empty deps — loadStaffData never changes identity

  useEffect(() => {
    loadStaffData();

    // ✅ FIX: Pass the stable function reference directly to socket
    socket.on("token_created", loadStaffData);

    return () => {
      socket.off("token_created", loadStaffData);
    };
  }, [loadStaffData]); // ✅ FIX: Only depends on loadStaffData (stable), NOT activeService

  const handleNextToken = async () => {
    if (!activeService) return alert("Please select a service first.");
    setCalling(true);
    try {
      const res = await api.post("/token/call-next", { service_id: activeService });
      if (res.data.message === "No tokens") {
        alert("Queue is empty — no waiting clients for this service.");
        setCurrentServing(null);
      } else {
        setCurrentServing(res.data);
        setServedCount((prev) => prev + 1);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to call next token.";
      alert(msg);
    } finally {
      setCalling(false);
    }
  };

  return (
    <div style={{ padding: "30px", background: "#F0FDF4", minHeight: "92vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Agent Profile Ribbon */}
        <div style={styles.profileHeader}>
          <div>
            <h2 style={{ margin: 0, color: "#166534" }}>📟 Service Agent Counter Terminal</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>
              System Identity Vector: <strong>{staffId}</strong> | Clearance Authorization Level: {staffRole}
            </p>
          </div>
          <div style={styles.badge}>Processed Today: {servedCount} Tickets</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>

          {/* Counter Config Panel */}
          <div style={styles.card}>
            <h3 style={{ color: "#166534", marginTop: 0 }}>⚙️ Counter Track Configuration</h3>
            <label style={styles.label}>Assigned Operations Stream Channel</label>

            {/* ✅ FIX: Show clear states for error / empty / loaded */}
            {servicesError ? (
              <div style={styles.errorBox}>{servicesError}</div>
            ) : services.length === 0 ? (
              <div style={styles.warningBox}>
                ⚠️ No services found. Ask your admin to deploy a service first.
              </div>
            ) : (
              <select
                style={styles.select}
                value={activeService}
                onChange={(e) => setActiveService(e.target.value)}
              >
                {/* ✅ FIX: Safely render name and prefix with fallbacks */}
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || "Unnamed Service"} ({s.prefix || "N/A"})
                  </option>
                ))}
              </select>
            )}

            <button
              style={{
                ...styles.btn,
                opacity: calling || services.length === 0 ? 0.6 : 1,
                cursor: calling || services.length === 0 ? "not-allowed" : "pointer",
              }}
              onClick={handleNextToken}
              disabled={calling || services.length === 0}
            >
              {calling ? "Calling..." : "Call Next Inline Client 🔊"}
            </button>
          </div>

          {/* Active Token Display */}
          <div style={styles.card}>
            <h3 style={{ color: "#166534", marginTop: 0 }}>🎯 Active Worksite Monitor Target</h3>
            {currentServing ? (
              <div style={styles.tokenCard}>
                <span style={{ fontSize: "12px", color: "#166534", fontWeight: "bold" }}>
                  NOW SERVING
                </span>
                <h1 style={{ fontSize: "56px", margin: "10px 0", color: "#166534" }}>
                  {currentServing.token_number}
                </h1>
                <p style={{ margin: 0 }}>
                  Client: <strong>{currentServing.customer_name}</strong>
                </p>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#64748B", paddingTop: "40px" }}>
                Counter sequence currently empty. Pull next ticket to begin tracking.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  profileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(34, 197, 94, 0.05)" },
  badge: { padding: "8px 15px", background: "#DCFCE7", color: "#166534", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" },
  card: { background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" },
  label: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "6px" },
  select: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", marginBottom: "20px", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", background: "#22C55E", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  tokenCard: { background: "#DCFCE7", border: "1px solid #86EFAC", padding: "25px", borderRadius: "12px", textAlign: "center" },
  errorBox: { background: "#FEF2F2", color: "#EF4444", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", border: "1px solid #FEE2E2" },
  warningBox: { background: "#FEF9C3", color: "#A16207", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", border: "1px solid #FDE68A" },
};
