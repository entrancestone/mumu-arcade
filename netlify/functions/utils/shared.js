const crypto = require('crypto');

// ---- bearer token signing/verification ----

function verifySession(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;

  const expected = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(data)
    .digest('base64url');

  if (sig !== expected) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

function signSession() {
  const payload = { exp: Date.now() + 4 * 60 * 60 * 1000 }; // 4 hour session
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

// ---- GitHub content API helpers ----

const GH_API = 'https://api.github.com';

async function ghRequest(path, options = {}) {
  return fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'homemade-arcade-admin',
      ...(options.headers || {}),
    },
  });
}

function repoSlug() {
  return `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`;
}

async function getFile(path) {
  const repo = repoSlug();
  const branch = process.env.GITHUB_BRANCH || 'main';
  const res = await ghRequest(`/repos/${repo}/contents/${path}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return {
    sha: json.sha,
    content: Buffer.from(json.content, 'base64').toString('utf8'),
  };
}

// content must already be a base64 string
async function putFile(path, base64Content, message, sha) {
  const repo = repoSlug();
  const branch = process.env.GITHUB_BRANCH || 'main';
  const body = { message, content: base64Content, branch };
  if (sha) body.sha = sha;
  const res = await ghRequest(`/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function deleteFile(path, message, sha) {
  const repo = repoSlug();
  const branch = process.env.GITHUB_BRANCH || 'main';
  const res = await ghRequest(`/repos/${repo}/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed (${res.status}): ${await res.text()}`);
  return res.json();
}

module.exports = { verifySession, signSession, getFile, putFile, deleteFile };
