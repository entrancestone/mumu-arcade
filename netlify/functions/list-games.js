const { verifySession, getFile } = require('./utils/shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!verifySession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) };
  }

  try {
    const manifestFile = await getFile('games.json');
    const manifest = manifestFile ? JSON.parse(manifestFile.content) : { games: [] };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games: manifest.games || [] }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
