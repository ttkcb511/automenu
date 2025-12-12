// netlify/functions/gemini-combo.js

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Allow': 'POST' },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' }) };
    }

    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gemini proxy error' })
    };
  }
}
