async function init() {
  const res = await fetch('games.json');
  const data = await res.json();

  document.getElementById('site-name').textContent = data.site.name;
  document.getElementById('site-tagline').textContent = data.site.tagline;
  document.title = data.site.name;

  const grid = document.getElementById('grid');
  const games = data.games || [];
  document.getElementById('game-count').textContent = games.length;

  if (games.length === 0) {
    grid.innerHTML = '<p class="empty">No games yet. Add one in games.json to see it here.</p>';
    return;
  }

  grid.innerHTML = games.map((g, i) => {
    const num = String(i + 1).padStart(2, '0');
    const tags = (g.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    return `
      <article class="cart" style="animation-delay:${i * 0.06}s">
        <div class="tape"></div>
        <div class="cart-thumb">${g.thumbnail ? `<img src="${g.thumbnail}" alt="">` : '🎮'}</div>
        <span class="cart-eyebrow">GAME #${num}</span>
        <h3 class="cart-title">${g.title}</h3>
        <p class="cart-desc">${g.description || ''}</p>
        <div class="cart-meta">${tags}</div>
        <a class="play-btn" href="play.html?id=${encodeURIComponent(g.id)}">▶ PLAY</a>
      </article>
    `;
  }).join('');
}

init();
