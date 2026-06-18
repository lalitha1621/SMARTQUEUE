import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
      await api.post("/auth/register", { full_name: fullName, email, password, role });
      setMsg({ type: "success", text: "Account provisioned successfully! Redirecting..." });
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Registration failed." });
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "85vh", background: "#FAF5FF" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", padding: "35px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.02)", border: "1px solid #E9D5FF" }}>
        <h2 style={{ textAlign: "center", margin: "0 0 5px 0", color: "#6B21A8" }}>Create Account</h2>
        <p style={{ textAlign: "center", color: "#9333EA", margin: "0 0 20px 0", fontSize: "14px" }}>Join the SmartQueue orchestration framework</p>

        {msg.text && (
          <div style={{ padding: "12px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", fontWeight: "600", background: msg.type === "success" ? "#ECFDF5" : "#FEF2F2", color: msg.type === "success" ? "#059669" : "#EF4444" }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" required placeholder="Alice Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" required placeholder="alice@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

          <label style={styles.label}>System Access Profile Role</label>
          <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Customer">Customer / Visitor</option>
            <option value="Staff">Service Agent (Staff)</option>
            <option value="Manager">Operations Manager</option>
            <option value="Admin">System Administrator</option>
          </select>

          <button style={{ ...styles.btn, background: "#A855F7" }} type="submit">Register Infrastructure Account</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4B5563", marginBottom: "4px" },
  input: { width: "100%", padding: "11px", borderRadius: "8px", border: "1px solid #E9D5FF", boxSizing: "border-box", marginBottom: "15px" },
  btn: { width: "100%", padding: "12px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }
};