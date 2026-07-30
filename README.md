# Homemade Arcade — How to add a new game

This site is fully static — no backend, no database. Anyone with the link can play, no login needed.

## To add a game

1. Make a new folder inside `games/`, named after the game, e.g. `games/space-quest/`.
2. Put the game's files inside it. There must be an `index.html` that the browser can open directly.
   - If the game is a single HTML file, just name it `index.html`.
   - If it has multiple files (JS, CSS, images), keep them all in that same folder and reference them with relative paths.
3. Add a screenshot so the game gets a picture on its card:
   - Open the game in a browser, take a screenshot (any size works — it gets cropped to fit).
   - Save it as `screenshot.png` (or `.jpg`) inside that same game folder, e.g. `games/space-quest/screenshot.png`.
4. Open `games.json` and add an entry to the `"games"` array:

```json
{
  "id": "space-quest",
  "title": "Space Quest",
  "description": "A short one-line description of the game.",
  "folder": "games/space-quest/index.html",
  "thumbnail": "games/space-quest/screenshot.png",
  "tags": ["arcade"],
  "added": "2026-08-01"
}
```

If you skip the `thumbnail` field, the card just shows a 🎮 icon instead — the site still works fine either way.

5. Save. Refresh the site — the new game card appears automatically, no code changes needed.

To remove the two placeholder demo games, just delete their entries from `games.json` (you can leave the folders, or delete those too).

## Site name / tagline

Edit the `"site"` object at the top of `games.json` to change the title and tagline shown on the homepage.

## Deploying

This is a plain static site (HTML/CSS/JS only), so it works with any static host:

**Fastest — Netlify Drop (no account needed for a quick live link):**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. You get a live URL immediately. Create a free account to keep it permanently and get a custom subdomain.

**GitHub Pages (free, good if you'll keep adding games over time):**
1. Create a new GitHub repository and upload this folder's contents.
2. In the repo settings, under "Pages", set the source to the main branch, root folder.
3. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.
4. To add a game later, just upload the new folder + edit `games.json` in the repo — it goes live automatically.

**Vercel:** similarly, drag-and-drop or connect a GitHub repo at vercel.com — no build step needed, just set the output as static.

## Admin panel (upload/delete games from a web page)

This site includes a password-protected admin page at `/admin/` where you can upload a new game or delete an existing one from your browser — no editing files by hand. When you use it, changes are committed straight to your GitHub repo, and your live GitHub Pages site rebuilds automatically about a minute later.

This part **requires Netlify** (in addition to GitHub Pages) because the login and file-writing logic needs a small server, which GitHub Pages can't run. Your public site keeps living on GitHub Pages exactly as before — Netlify is only used to host the admin page and its backend functions.

### One-time setup

**1. Get a GitHub Personal Access Token**
This lets the admin page write files to your repo on your behalf.
1. Go to https://github.com/settings/tokens?type=beta → **Generate new token** (fine-grained).
2. Give it a name like "Homemade Arcade Admin".
3. Under **Repository access**, choose **Only select repositories** and pick your arcade repo.
4. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**.
5. Generate the token and copy it somewhere safe — you won't see it again.

**2. Push these new files to your GitHub repo**
Upload the `admin/` folder, `netlify/` folder, and `netlify.toml` file (all included in this download) into your existing repo, the same way you uploaded the site originally.

**3. Create a Netlify site connected to the same repo**
1. Go to https://app.netlify.com → **Add new site → Import an existing project**.
2. Connect your GitHub account and pick your arcade repo.
3. Leave build settings as detected (Netlify will find `netlify.toml` automatically) → **Deploy**.

**4. Add environment variables**
In your new Netlify site: **Site configuration → Environment variables → Add a variable**. Add all of these:

| Key | Value |
|---|---|
| `ADMIN_PASSWORD` | a password you choose for logging into `/admin/` |
| `GITHUB_TOKEN` | the token from step 1 |
| `GITHUB_OWNER` | your GitHub username |
| `GITHUB_REPO` | your repo's name |
| `GITHUB_BRANCH` | `main` (or whatever branch GitHub Pages deploys from) |

After adding them, trigger a redeploy (**Deploys → Trigger deploy**).

**5. Use it**
Visit `https://<your-netlify-site>.netlify.app/admin/`, log in with your `ADMIN_PASSWORD`, and upload or delete games. Each change commits to GitHub, and your GitHub Pages site updates itself shortly after.

**Note:** the game-upload form expects a single self-contained `.html` file per game (inline CSS/JS, no separate asset files). That covers most single-file vibe-coded games. If a game needs multiple files, let me know and I can extend the admin panel to support a zip upload instead.
