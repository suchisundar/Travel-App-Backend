const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: { rejectUnauthorized: false },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}

db.connect()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Connection error", err.stack));

process.on("exit", async () => {
  if (db) await db.end();
});

module.exports = db;
