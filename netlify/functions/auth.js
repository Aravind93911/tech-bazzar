const { connectDb } = require("../../db");

exports.handler = async (event) => {
  try {
    const db = await connectDb();

    const type = event.queryStringParameters?.type;

    if (!type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing type" }),
      };
    }

    const body = JSON.parse(event.body);

    if (type === "login") {
      const { email, password } = body;

      const result = await db.query(
        "SELECT * FROM users WHERE email=$1 AND password=$2",
        [email, password]
      );

      if (result.rows.length > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify(result.rows[0]),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: "Invalid credentials" }),
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
          body: JSON.stringify({ error: "Email exists" }),
        };
      }

      const result = await db.query(
        "INSERT INTO users(name,email,password,phone) VALUES($1,$2,$3,$4) RETURNING *",
        [name, email, password, phone]
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0]),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid type" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
