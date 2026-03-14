const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let connected = false;

async function connectDb() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

module.exports = { connectDb };
