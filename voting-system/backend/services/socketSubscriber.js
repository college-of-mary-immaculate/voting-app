let isInitialized = false;
const { subWorker } = require("../config/redis");

const socketSubscriber = (io) => {
  // Ensure that the subscriber is initialized only once
  if (isInitialized) return;
  isInitialized = true;

  // Subscribe to Redis channels
  subWorker.subscribe("vote_updates");
  subWorker.subscribe("election_updates");
  subWorker.subscribe("candidate_updates");

  console.log("Socket subscriber initialized and listening on channels");

  // Handle incoming messages from Redis
  subWorker.on("message", (channel, message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Redis event: ${channel}`);

    try {
      // Parse the Redis message
      const data = JSON.parse(message);

      // Handle vote updates (emit to specific election room)
      if (channel === "vote_updates" && data.electionId) {
        io.to(String(data.electionId)).emit("resultsUpdated", data);
        console.log(`[${timestamp}] Emitting 'resultsUpdated' for electionId: ${data.electionId}`);
      }

      // Handle election updates (broadcast to all clients)
      if (channel === "election_updates" && data) {
        io.emit("election_update", data);
        console.log(`[${timestamp}] Broadcasting 'election_update'`);
      }

      // Handle candidate updates (broadcast to all clients)
      if (channel === "candidate_updates" && data) {
        io.emit("candidate_update", data);
        console.log(`[${timestamp}] Broadcasting 'candidate_update'`);
      }

    } catch (err) {
      console.error(`[${timestamp}] Redis parse error:`, err);
    }
  });

  // Redis Error Handling
  subWorker.on("error", (err) => {
    console.error("Redis subscriber error:", err);
  });

  // Redis Reconnection Handling
  subWorker.on("reconnecting", (delay) => {
    console.log(`Reconnecting to Redis in ${delay}ms...`);
  });

  // Redis Connection and Disconnect Handling
  subWorker.on("connect", () => {
    console.log("Connected to Redis");
  });

  subWorker.on("close", () => {
    console.log("Disconnected from Redis");
  });
};

module.exports = { socketSubscriber };