const { sub } = require("../config/redis");

const initSubscriber = (io) => {
  sub.subscribe("vote_updates");
  sub.subscribe("election_updates");
  sub.subscribe("candidate_updates");

  console.log("Subscribed to vote_updates, election_updates, candidate_updates");

  sub.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);

      if (channel === "vote_updates") {
        io.to(String(data.electionId)).emit("resultsUpdated", data);
      }

      if (channel === "election_updates") {
        io.emit("election_update", data);
      }

      if (channel === "candidate_updates") {
        io.emit("candidate_update", data);
      }

    } catch (err) {
      console.error("Redis parse error:", err);
    }
  });
};

module.exports = { initSubscriber };