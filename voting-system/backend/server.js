const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const http = require("http");
const { Server } = require("socket.io");

const { createAdapter } = require("@socket.io/redis-adapter");
const { pub, sub } = require("./config/redis");

// Routes
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminCandidateRoutes = require("./routes/adminCandidateRoutes");
const adminElectionRoutes = require("./routes/adminElectionRoutes");
const adminPositionRoutes = require("./routes/adminPositionRoutes");
const electionRoutes = require("./routes/electionRoutes");

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Redis Adapter (THIS handles scaling)
io.adapter(createAdapter(pub, sub));

// export io globally
module.exports.io = io;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voting System API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost" }],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin/candidates", adminCandidateRoutes);
app.use("/api/admin/elections", adminElectionRoutes);
app.use("/api/admin/positions", adminPositionRoutes);
app.use("/api/elections", electionRoutes);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Voting API is running");
});

// ✅ Socket handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinElection", (electionId) => {
    const room = String(electionId);
    socket.join(room);
    console.log(`Socket ${socket.id} joined election ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});