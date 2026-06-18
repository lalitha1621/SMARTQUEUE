const http = require("http");
const app = require("./app");

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

io.on("connection", () => {
  console.log("Client connected");
});

server.listen(5000, () =>
  console.log("Server running on 5000")
);