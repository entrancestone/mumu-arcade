const { verifySession, getFile, putFile } = require('./utils/shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!verifySession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not logged in' }) };
  }

  try {
    const {
      id,
      title,
      description,
      tags,
      gameHtmlBase64,
      screenshotBase64,
      screenshotExt,
    } = JSON.parse(event.body || '{}');

    if (!id || !title || !gameHtmlBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields (id, title, game file).' }) };
    }

    const safeId = String(id).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!safeId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Game id is invalid after cleanup.' }) };
    }

    // 1. Write the game's index.html
    await putFile(`games/${safeId}/index.html`, gameHtmlBase64, `Add game: ${title}`);

    // 2. Write the screenshot, if one was provided
    let thumbnail = null;
    if (screenshotBase64) {
      const ext = (screenshotExt || 'png').replace(/[^a-z0-9]/gi, '');
      thumbnail = `games/${safeId}/screenshot.${ext}`;
      await putFile(thumbnail, screenshotBase64, `Add screenshot for: ${title}`);
    }

    // 3. Update games.json (read current, replace/add entry, write back)
    const manifestFile = await getFile('games.json');
    const manifest = manifestFile
      ? JSON.parse(manifestFile.content)
      : { site: { name: 'Homemade Arcade', tagline: '' }, games: [] };

    manifest.games = (manifest.games || []).filter((g) => g.id !== safeId);
    const entry = {
      id: safeId,
      title,
      description: description || '',
      folder: `games/${safeId}/index.html`,
      tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
      added: new Date().toISOString().slice(0, 10),
    };
    if (thumbnail) entry.thumbnail = thumbnail;
    manifest.games.push(entry);

    const newManifestBase64 = Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64');
    await putFile('games.json', newManifestBase64, `Update manifest: add ${title}`, manifestFile ? manifestFile.sha : undefined);

    return { statusCode: 200, body: JSON.stringify({ ok: true, id: safeId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
