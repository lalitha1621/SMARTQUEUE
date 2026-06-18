import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const adminId = localStorage.getItem("userId") || "Root_Super_Node";

  const loadGlobalSectors = async () => {
    try {
      const res = await api.get("/token/services");
      setServices(res.data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };

  useEffect(() => { loadGlobalSectors(); }, []);

  const handleDeployVertical = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) return setErrorMsg("Service name is required.");
    if (!desc.trim()) return setErrorMsg("Description is required.");

    setLoading(true);
    try {
      await api.post("/token/services", {
        name: name.trim(),
        prefix: prefix.trim() || name.trim().substring(0, 4).toUpperCase(),
        description: desc.trim(),
      });
      setName(""); setPrefix(""); setDesc("");
      await loadGlobalSectors();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      setErrorMsg(msg || "Failed to deploy service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", background: "#FFF7ED", minHeight: "92vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={styles.profileHeader}>
          <div>
            <h2 style={{ margin: 0, color: "#C2410C" }}>👑 System Infrastructure Super Administrator</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>
              Global Principal UID: <strong>{adminId}</strong> | Server Context Node Cluster Master
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={styles.metaCard}>Active Nodes: {services.length} Tracks</div>
            <div style={{ ...styles.metaCard, color: "#16A34A" }}>Uptime: 99.99%</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>

          <div style={styles.panel}>
            <h3 style={{ color: "#EA580C", marginTop: 0 }}>⚙️ Deploy System Service Vertical</h3>

            {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

            <form onSubmit={handleDeployVertical}>
              <label style={styles.lbl}>Service Name <span style={{ color: "red" }}>*</span></label>
              <input
                style={styles.inp}
                placeholder="e.g. Hospital Checkup"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />

              <label style={styles.lbl}>Queue Prefix Code <span style={{ color: "#94A3B8", fontWeight: "normal" }}>(optional — auto-generated if blank)</span></label>
              <input
                style={styles.inp}
                placeholder="e.g. HOSP (max 4 letters)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4))}
                disabled={loading}
              />

              <label style={styles.lbl}>Description <span style={{ color: "red" }}>*</span></label>
              <textarea
                style={styles.inp}
                rows="3"
                placeholder="Describe this service..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={loading}
              />

              <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
                {loading ? "Deploying..." : "Activate Core Track"}
              </button>
            </form>
          </div>

          <div style={styles.panel}>
            <h3 style={{ color: "#EA580C", marginTop: 0 }}>📂 Active Cluster Domain Directories</h3>
            {services.length === 0 ? (
              <p style={{ color: "#94A3B8", textAlign: "center", marginTop: "30px" }}>
                No services deployed yet. Use the form to create one.
              </p>
            ) : (
              <div style={{ overflowY: "auto", maxHeight: "410px" }}>
                {services.map((s) => (
                  <div key={s.id} style={styles.dirRow}>
                    <div>
                      {/* ✅ Correctly uses service_name from DB via getServices join */}
                      <strong style={{ color: "#431407" }}>{s.service_name || s.name}</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: s.description ? "#64748B" : "#FCA5A5" }}>
                        {s.description || "⚠️ No description set."}
                      </p>
                    </div>
                    <span style={styles.tag}>{s.prefix || s.name?.substring(0, 4).toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  profileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(234, 88, 12, 0.05)" },
  metaCard: { padding: "6px 12px", background: "#FFF7ED", border: "1px solid #FFEDD5", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", color: "#EA580C" },
  panel: { background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" },
  lbl: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#EA580C", marginBottom: "4px" },
  inp: { width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "8px", boxSizing: "border-box", marginBottom: "14px" },
  btn: { width: "100%", padding: "12px", background: "#EA580C", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  dirRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", marginBottom: "10px" },
  tag: { background: "#EA580C", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" },
  errorBox: { background: "#FEF2F2", color: "#EF4444", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FEE2E2" },
};
