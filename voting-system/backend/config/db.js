const mysql = require("mysql2");

const master = mysql.createPool({
  host: process.env.DB_MASTER_HOST || "db-master",
  user: process.env.DB_ROOT_USER || "root",
  password: process.env.DB_ROOT_PASSWORD || "rootpass",
  database: process.env.DB_NAME || "voting_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const slaves = [
  mysql.createPool({
    host: process.env.DB_SLAVE1_HOST || "db-slave1",
    user: process.env.DB_ROOT_USER || "root",
    password: process.env.DB_ROOT_PASSWORD || "rootpass",
    database: process.env.DB_NAME || "voting_system",
    waitForConnections: true,
    connectionLimit: 5,
  }),
  mysql.createPool({
    host: process.env.DB_SLAVE2_HOST || "db-slave2",
    user: process.env.DB_ROOT_USER || "root",
    password: process.env.DB_ROOT_PASSWORD || "rootpass",
    database: process.env.DB_NAME || "voting_system",
    waitForConnections: true,
    connectionLimit: 5,
  }),
];

let readIndex = 0;

function getSlave() {
  const slave = slaves[readIndex];
  readIndex = (readIndex + 1) % slaves.length;
  return slave;
}

module.exports = {
  write: (sql, params) =>
    new Promise((resolve, reject) => {
      master.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),

  read: (sql, params) =>
    new Promise((resolve, reject) => {
      const slave = getSlave();
      slave.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }),
};