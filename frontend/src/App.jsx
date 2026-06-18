import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DisplayBoard from "./pages/DisplayBoard";

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = (role, token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId || "1");
    setUserRole(role);

    // Dynamic Role-Based Access Control Redirects
    if (role === "Customer") navigate("/customer");
    else if (role === "Staff") navigate("/staff");
    else if (role === "Manager") navigate("/manager");
    else if (role === "Admin") navigate("/admin");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    navigate("/login");
  };

  // Hide the navigation header if viewing the standalone public TV display board
  const isDisplayBoard = location.pathname === "/display";

  return (
    <div style={{ fontFamily: "'Segoe UI', Roboto, sans-serif", minHeight: "100vh", background: "#F8FAFC" }}>
      {!isDisplayBoard && (
        <nav style={styles.navbar}>
          <div style={styles.brand} onClick={() => navigate("/")}>
            ⚡ SmartQueue <span style={styles.brandHub}>Hub</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button style={styles.displayLinkBtn} onClick={() => navigate("/display")}>
              📺 Open Public TV Board
            </button>
            {userRole ? (
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={styles.roleTag}>{userRole} Profile</span>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                <button style={styles.navBtn} onClick={() => navigate("/login")}>Login</button>
                <button style={{ ...styles.navBtn, background: "#4F46E5", color: "#fff" }} onClick={() => navigate("/register")}>Register</button>
              </>
            )}
          </div>
        </nav>
      )}

      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={userRole ? <Navigate to={`/${userRole.toLowerCase()}`} /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />

        {/* Public TV Queue Monitor */}
        <Route path="/display" element={<DisplayBoard />} />

        {/* Protected Dashboard Routes (Enforced via RBAC State Check) */}
        <Route path="/customer" element={userRole === "Customer" ? <CustomerDashboard /> : <Navigate to="/login" />} />
        <Route path="/staff" element={userRole === "Staff" ? <StaffDashboard /> : <Navigate to="/login" />} />
        <Route path="/manager" element={userRole === "Manager" ? <ManagerDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={userRole === "Admin" ? <AdminDashboard /> : <Navigate to="/login" />} />

        {/* Catch-all Fallback Routing */}
        <Route path="*" element={<Navigate to={userRole ? `/${userRole.toLowerCase()}` : "/login"} />} />
      </Routes>
    </div>
  );
}

const styles = {
  navbar: { display: "flex", justifyContent: "space-between", padding: "14px 40px", background: "#ffffff", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  brand: { fontSize: "22px", fontWeight: "800", color: "#1E293B", cursor: "pointer", letterSpacing: "-0.5px" },
  brandHub: { color: "#4F46E5", fontWeight: "900" },
  displayLinkBtn: { padding: "8px 16px", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginRight: "10px" },
  navBtn: { padding: "8px 18px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.2s" },
  roleTag: { background: "#EEF2F6", color: "#475569", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase" },
  logoutBtn: { padding: "8px 16px", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FEE2E2", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }
};