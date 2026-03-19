const { sub } = require("../config/redis");

const initSubscriber = (io) => {
  sub.subscribe("vote_updates");
  sub.subscribe("election_updates");

  console.log("Subscribed to vote_updates and election_updates");

  sub.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);

      if (channel === "vote_updates") {
        console.log("Redis vote message:", data);

        io.to(String(data.electionId)).emit("resultsUpdated", data);
      }

      if (channel === "election_updates") {
        console.log("Redis election message:", data);

        io.emit("election_update", data);
      }
    } catch (err) {
      console.error("Redis parse error:", err);
    }
  });
};

module.exports = { initSubscriber };