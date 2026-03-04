const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

let isConnected = false;

const connectDb = async () => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
};

module.exports = { connectDb };
