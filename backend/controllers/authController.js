const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// USER REGISTRATION
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    
    // 1. Lowercase the email to avoid case-sensitivity lookup bugs
    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // 3. Hash the password with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert clean records into database
    await pool.query(
      "INSERT INTO users(full_name, email, password, role) VALUES($1, $2, $3, $4)",
      [full_name, cleanEmail, hashedPassword, role]
    );
    
    return res.json({ message: "Registered Successfully" });
  } catch (err) {
    console.error("🔴 REGISTRATION DATABASE ERROR:", err.message);
    return res.status(500).json({ message: "Database registration failure error" });
  }
};

// USER LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Login failed: Email ${cleanEmail} not found in database.`);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const user = result.rows[0];

    // 2. Compare the plain-text password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`❌ Login failed: Password mismatch for ${cleanEmail}.`);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // 3. If correct, sign token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      "secret"
    );
    
    console.log(`✅ Success: User authenticated as [${user.role}]`);
    return res.json({ token, role: user.role });

  } catch (err) {
    console.error("🔴 LOGIN SERVER ERROR:", err.message);
    return res.status(500).json({ message: "Server login processing error" });
  }
};