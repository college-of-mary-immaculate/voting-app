const { sub } = require("../config/redis");

const initSubscriber = (io) => {
  sub.subscribe("vote_updates");

  console.log("Subscribed to vote_updates");

  sub.on("message", (channel, message) => {
    if (channel === "vote_updates") {
      try {
        const data = JSON.parse(message);

        console.log("Redis message:", data);

        io.to(String(data.electionId)).emit("resultsUpdated", data);
      } catch (err) {
        console.error("Redis parse error:", err);
      }
    }
  });
};

module.exports = { initSubscriber };