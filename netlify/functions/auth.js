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

  // rest of login/register logic
};
