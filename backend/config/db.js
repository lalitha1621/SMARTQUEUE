const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Lally@143", 
  database: "smartqueue",
  port: 5433
});

module.exports = pool;