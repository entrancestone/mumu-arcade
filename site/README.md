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
