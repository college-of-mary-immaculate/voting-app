const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminCandidateRoutes = require("./routes/adminCandidateRoutes");
const adminElectionRoutes = require("./routes/adminElectionRoutes");
const adminPositionRoutes = require("./routes/adminPositionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voting System API",
      version: "1.0.0",
      description: "API documentation for Voting System project",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/candidates", candidateRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin/candidates", adminCandidateRoutes);
app.use("/api/admin/elections", adminElectionRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin/positions", adminPositionRoutes);

app.get("/", (req, res) => {
  res.send("Voting API is running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});