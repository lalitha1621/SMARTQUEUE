import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      // 👇 IMPLEMENTED: Saves email metadata to power profile headers correctly across the system
      localStorage.setItem("email", email);
      
      // Pass authentication details back up to App.jsx global state provider
      // Expecting backend payload structure: { token, role, id }
      onLoginSuccess(res.data.role, res.data.token, res.data.id);
    } catch (err) {
      console.error("Authentication handshake fault:", err);
      setErrorMsg(
        err.response?.data?.message || 
        "Invalid email or password. Please verify your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        {/* Brand/Welcome Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log into your smart automated terminal</p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div style={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Email Address</label>
            <input 
              style={styles.input} 
              type="email" 
              required 
              placeholder="name@domain.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Security Password</label>
            <input 
              style={styles.input} 
              type="password" 
              required 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={isLoading}
            />
          </div>

          <button 
            style={{ 
              ...styles.submitBtn, 
              background: isLoading ? "#C084FC" : "#A855F7",
              cursor: isLoading ? "not-allowed" : "pointer"
            }} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating Session..." : "Authenticate Session"}
          </button>
        </form>
        
        {/* Register Redirection Footer */}
        <p style={styles.footerText}>
          New to the workspace?{" "}
          <span style={styles.signupLink} onClick={() => !isLoading && navigate("/register")}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    minHeight: "85vh", 
    background: "#FAF5FF" 
  },
  authCard: { 
    width: "100%", 
    maxWidth: "420px", 
    background: "#ffffff", 
    padding: "40px 35px", 
    borderRadius: "16px", 
    boxShadow: "0 10px 25px rgba(107, 33, 168, 0.05)", 
    border: "1px solid #F3E8FF",
    boxSizing: "border-box"
  },
  title: { 
    margin: "0 0 6px 0", 
    color: "#6B21A8", 
    fontSize: "26px", 
    fontWeight: "800",
    letterSpacing: "-0.5px"
  },
  subtitle: { 
    color: "#9333EA", 
    margin: 0, 
    fontSize: "14px",
    fontWeight: "500"
  },
  errorBox: { 
    background: "#FEF2F2", 
    color: "#EF4444", 
    padding: "12px 14px", 
    borderRadius: "8px", 
    marginBottom: "20px", 
    fontSize: "13px", 
    fontWeight: "600", 
    border: "1px solid #FEE2E2",
    lineHeight: "1.4"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  label: { 
    display: "block", 
    fontSize: "13px", 
    fontWeight: "700", 
    color: "#4B5563", 
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: { 
    width: "100%", 
    padding: "12px 14px", 
    borderRadius: "8px", 
    border: "1px solid #E9D5FF", 
    boxSizing: "border-box", 
    fontSize: "15px",
    background: "#FAFAFA",
    color: "#1F2937",
    transition: "border-color 0.2s ease-in-out",
    outline: "none"
  },
  submitBtn: { 
    width: "100%", 
    padding: "14px", 
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    fontSize: "15px", 
    fontWeight: "700", 
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
    transition: "background 0.2s"
  },
  footerText: { 
    textAlign: "center", 
    marginTop: "24px", 
    fontSize: "14px", 
    color: "#64748B",
    marginBottom: 0
  },
  signupLink: { 
    color: "#A855F7", 
    fontWeight: "700", 
    cursor: "pointer",
    textDecoration: "underline"
  }
};