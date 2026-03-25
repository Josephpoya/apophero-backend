/* ═══════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════ */
pages['shop'] = function(filterParam) {

  const topics = [
    { key:'all',          label:'All Guides' },
    { key:'weight',       label:'Weight Loss' },
    { key:'hormones',     label:'Hormones' },
    { key:'sexual-health',label:'Sexual Health' },
    { key:'pregnancy',    label:'Pregnancy' },
    { key:'mental-health',label:'Mental Health' },
    { key:'wellness',     label:'Wellness' }
  ];

  const filterBtns = topics.map(t => `
    <button class="filter-btn ${(filterParam||'all')===t.key?'active':''}"
      onclick="filterShop('${t.key}', this)">${t.label}</button>`).join('');

  const allCards = PRODUCTS.map((p, i) => `
    <div class="prod-card reveal reveal-delay-${i%3+1}" data-topic="${p.topic}"
         style="${(filterParam && filterParam!=='all' && p.topic!==filterParam)?'display:none':''}" >
      <div class="prod-card-img" style="background:${p.gradient}">
        <span>${p.emoji}</span>
        <span class="badge">Free</span>
      </div>
      <div class="prod-card-body">
        <div class="prod-card-cat">${p.category}</div>
        <div class="prod-card-title">${p.title}</div>
        <div class="prod-card-desc">${p.desc}</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem">
          ${p.tags.map(tag=>`<span class="tag tag-sage">${tag}</span>`).join('')}
        </div>
        <div style="font-size:.75rem;color:var(--slate);margin-bottom:1rem">📖 ${p.readTime}</div>
        <div class="prod-card-footer">
          <span class="prod-price">Free</span>
          <a href="${p.link}" target="_blank" class="btn btn-dark btn-sm">Download →</a>
        </div>
      </div>
    </div>`).join('');

  return `
  <style>
    .shop-hero {
      padding:calc(var(--nav-h) + 4rem) 5% 3.5rem;
      background:linear-gradient(135deg,var(--sage) 0%,#c5cec8 100%);
      text-align:center;
    }
    .filter-bar {
      display:flex; gap:.6rem; flex-wrap:wrap; justify-content:center;
      padding:2.5rem 5% 0;
    }
    .filter-btn {
      padding:.55rem 1.3rem; border-radius:100px;
      font-size:.82rem; font-weight:600; cursor:pointer;
      border:1.5px solid var(--border); background:var(--white);
      color:var(--warm-brown); transition:all .2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background:var(--teal); color:var(--white); border-color:var(--teal);
    }
    .shop-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
      gap:1.8rem;
    }
    .no-results {
      grid-column:1/-1; text-align:center;
      padding:4rem 0; color:var(--slate);
    }
    .no-results span { font-size:3rem; display:block; margin-bottom:1rem; }
  </style>

  <div class="shop-hero">
    <div class="eyebrow" style="display:block;margin-bottom:.8rem">Free Health Resources</div>
    <h1 class="display-lg">All Our Guides</h1>
    <p class="lead" style="max-width:550px;margin:1rem auto 0">
      Every guide is free, downloadable, and grounded in science. Filter by topic to find exactly what you need.
    </p>
  </div>

  <div class="filter-bar" id="filterBar">${filterBtns}</div>

  <section class="section-pad">
    <div class="container">
      <div class="shop-grid" id="shopGrid">${allCards}</div>
    </div>
  </section>

  ${renderNewsletter()}`;
};

function filterShop(topic, btn) {
  // update active button
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // show/hide cards
  const cards = document.querySelectorAll('#shopGrid .prod-card');
  let visible = 0;
  cards.forEach(card => {
    const match = topic === 'all' || card.dataset.topic === topic;
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  // show no-results if needed
  let noRes = document.getElementById('no-results');
  if (visible === 0) {
    if (!noRes) {
      const grid = document.getElementById('shopGrid');
      grid.insertAdjacentHTML('beforeend',
        `<div class="no-results" id="no-results"><span>🔍</span>No guides in this category yet. Check back soon!</div>`);
    }
  } else {
    noRes?.remove();
  }
}
