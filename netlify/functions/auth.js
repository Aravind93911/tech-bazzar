const { connectDb } = require('./db');

exports.handler = async (event, context) => {
  const db = await connectDb();
  const data = JSON.parse(event.body);
  const type = event.queryStringParameters.type; // 'login' or 'register'

  try {
    if (type === 'login') {
      // SECURE LOGIN QUERY
      const res = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [data.email, data.password]);
      
      if (res.rows.length > 0) {
        return { statusCode: 200, body: JSON.stringify(res.rows[0]) };
      } else {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
      }
    } 
    
    else if (type === 'register') {
      // CHECK IF EXISTS
      const check = await db.query('SELECT * FROM users WHERE email = $1', [data.email]);
      if (check.rows.length > 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email already exists' }) };
      }

      // INSERT NEW USER
      const res = await db.query(
        'INSERT INTO users (name, email, password, phone, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.name, data.email, data.password, data.phone, 'user', 'active']
      );
      return { statusCode: 200, body: JSON.stringify(res.rows[0]) };
    }

  } catch (error) {
    return { statusCode: 500, body: String(error) };
  }
};
