const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

pub.on("connect", () => console.log("Redis PUB connected"));
sub.on("connect", () => console.log("Redis SUB connected"));

module.exports = { pub, sub };