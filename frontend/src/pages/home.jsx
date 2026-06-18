import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>

      <h1 style={{ color: "#7c3aed" }}>SmartQueue</h1>
      <p>Smart Queue Management System</p>

      <div style={{ marginTop: "40px" }}>

        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button style={{ marginLeft: "10px" }}>
            Register
          </button>
        </Link>

      </div>

    </div>
  );
}

export default Home;