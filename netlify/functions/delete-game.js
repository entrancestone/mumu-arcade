const { verifySession, getFile, putFile, deleteFile } = require('./utils/shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!verifySession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) };
  }

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

    const manifestFile = await getFile('games.json');
    if (!manifestFile) return { statusCode: 404, body: JSON.stringify({ error: 'games.json not found' }) };

    const manifest = JSON.parse(manifestFile.content);
    const game = (manifest.games || []).find((g) => g.id === id);
    manifest.games = (manifest.games || []).filter((g) => g.id !== id);

    const newManifestBase64 = Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64');
    await putFile('games.json', newManifestBase64, `Remove game: ${id}`, manifestFile.sha);

    // Best-effort cleanup of the game's files. If these fail, the manifest update above
    // already removed it from the site, so we don't fail the whole request.
    if (game) {
      try {
        const htmlFile = await getFile(game.folder);
        if (htmlFile) await deleteFile(game.folder, `Delete game file: ${id}`, htmlFile.sha);
      } catch {}
      if (game.thumbnail) {
        try {
          const thumbFile = await getFile(game.thumbnail);
          if (thumbFile) await deleteFile(game.thumbnail, `Delete screenshot: ${id}`, thumbFile.sha);
        } catch {}
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
