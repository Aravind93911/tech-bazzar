const { Client } = require("pg");

let client;

const connectDb = async () => {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
  }
  return client;
};

exports.handler = async (event) => {
  let body = {};

  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const type = event.queryStringParameters?.type;

  if (!type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing type" }),
    };
  }

  const db = await connectDb();

  if (type === "login") {
    const { email, password } = body;

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0])
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" })
      };
    }
  }

  if (type === "register") {
    const { name, email, password, phone } = body;

    const check = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (check.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email exists" })
      };
    }

    const result = await db.query(
      "INSERT INTO users(name,email,password,phone) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, password, phone]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Invalid type" })
  };
};
