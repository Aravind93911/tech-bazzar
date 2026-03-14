const { connectDb } = require("../../db");

exports.handler = async (event) => {
  const db = await connectDb();
  const data = JSON.parse(event.body);
  const type = event.queryStringParameters.type;

  try {
    if (type === "login") {
      const res = await db.query(
        "SELECT * FROM users WHERE email=$1 AND password=$2",
        [data.email, data.password]
      );

      if (res.rows.length > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify(res.rows[0]),
        };
      }

      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    if (type === "register") {
      const check = await db.query(
        "SELECT * FROM users WHERE email=$1",
        [data.email]
      );

      if (check.rows.length > 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Email exists" }),
        };
      }

      const res = await db.query(
        "INSERT INTO users(name,email,password,phone) VALUES($1,$2,$3,$4) RETURNING *",
        [data.name, data.email, data.password, data.phone]
      );

      return {
        statusCode: 200,
        body: JSON.stringify(res.rows[0]),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
};
