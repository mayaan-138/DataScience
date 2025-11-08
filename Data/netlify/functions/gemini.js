const respond = (statusCode, body = {}, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders,
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return respond(
      200,
      '',
      {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    );
  }

  if (event.httpMethod !== 'POST') {
    return respond(
      405,
      { error: 'Method Not Allowed' },
      {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return respond(500, { error: 'Gemini API key is not configured on the server.' });
    }

    const { model, contents, systemInstruction, generationConfig } = JSON.parse(event.body || '{}');

    if (!model || !Array.isArray(contents)) {
      return respond(400, { error: 'Invalid request payload.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return respond(response.status, { error: data.error?.message || 'Gemini API responded with an error.' });
    }

    return respond(200, data);
  } catch (error) {
    return respond(500, { error: error.message || 'Unexpected server error.' });
  }
};

