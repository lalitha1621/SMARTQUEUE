const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS so your frontend (port 5173/3000) can communicate with the backend (port 5000)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Routes Linking
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/token", require("./routes/tokenRoutes"));

module.exports = app;