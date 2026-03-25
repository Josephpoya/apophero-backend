/* ═══════════════════════════════════════════
   BLOG PAGE
═══════════════════════════════════════════ */
pages['blog'] = function() {

  const [featured, ...rest] = BLOG_POSTS;

  const restCards = rest.map((p, i) => `
    <article class="blog-card reveal reveal-delay-${i%3+1}">
      <div class="blog-card-img" style="background:${p.gradient}">${p.emoji}</div>
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="tag tag-teal">${p.category}</span>
          <span class="blog-date">${p.date} · ${p.readTime}</span>
        </div>
        <h3 class="blog-card-title">${p.title}</h3>
        <p class="blog-card-excerpt">${p.excerpt}</p>
        <a class="blog-read-link" href="#">Read Article →</a>
      </div>
    </article>`).join('');

  return `
  <style>
    .blog-hero {
      padding:calc(var(--nav-h) + 4rem) 5% 3.5rem;
      background:linear-gradient(135deg,var(--sage) 0%,#c5cec8 100%);
      text-align:center;
    }
    /* featured post */
    .blog-featured {
      display:grid; grid-template-columns:1fr 1fr;
      border-radius:var(--radius-xl); overflow:hidden;
      background:var(--white); box-shadow:var(--shadow-lg);
      border:1px solid var(--border);
      margin-bottom:4rem;
      transition:transform .25s, box-shadow .25s;
    }
    .blog-featured:hover { transform:translateY(-4px); box-shadow:0 20px 60px rgba(22,25,25,.15); }
    .blog-featured-img {
      height:100%; min-height:380px;
      display:flex; align-items:center; justify-content:center; font-size:5rem;
    }
    .blog-featured-body { padding:3rem; display:flex; flex-direction:column; justify-content:center; }
    .blog-featured-tag { margin-bottom:1.2rem; }
    .blog-featured-title {
      font-family:var(--font-display); font-size:clamp(1.5rem,2.5vw,2.2rem);
      font-weight:700; line-height:1.2; margin-bottom:1rem; color:var(--black);
    }
    .blog-featured-excerpt { font-size:.92rem; color:var(--warm-brown); line-height:1.75; margin-bottom:1.6rem; }
    .blog-featured-meta { display:flex; align-items:center; gap:1rem; margin-bottom:1.6rem; }
    .blog-date { font-size:.75rem; color:var(--slate); }

    /* blog grid */
    .blog-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.8rem; }
    .blog-card {
      background:var(--white); border-radius:var(--radius-lg);
      overflow:hidden; border:1.5px solid var(--border);
      transition:transform .25s, box-shadow .25s; display:flex; flex-direction:column;
    }
    .blog-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
    .blog-card-img {
      height:180px; display:flex; align-items:center;
      justify-content:center; font-size:3rem;
    }
    .blog-card-body { padding:1.5rem; flex:1; display:flex; flex-direction:column; }
    .blog-meta { display:flex; align-items:center; gap:.7rem; margin-bottom:.8rem; flex-wrap:wrap; }
    .blog-card-title {
      font-family:var(--font-display); font-size:1.15rem; font-weight:600;
      line-height:1.3; margin-bottom:.7rem; flex:1;
    }
    .blog-card-excerpt { font-size:.82rem; color:var(--warm-brown); line-height:1.65; margin-bottom:1.2rem; }
    .blog-read-link {
      font-size:.82rem; font-weight:600; color:var(--teal);
      display:inline-flex; align-items:center; gap:.3rem;
      transition:gap .2s;
    }
    .blog-read-link:hover { gap:.6rem; }
    @media(max-width:768px) {
      .blog-featured { grid-template-columns:1fr; }
      .blog-featured-img { min-height:220px; }
    }
  </style>

  <div class="blog-hero">
    <div class="eyebrow" style="display:block;margin-bottom:.8rem">Health Knowledge</div>
    <h1 class="display-lg">The Apophero Blog</h1>
    <p class="lead" style="max-width:540px;margin:1rem auto 0">
      Evidence-based articles on weight loss, hormonal health, men's and women's wellness — written in plain language.
    </p>
  </div>

  <section class="section-pad">
    <div class="container">
      <div class="eyebrow" style="margin-bottom:1.2rem">Featured Article</div>
      <a class="blog-featured reveal" href="#">
        <div class="blog-featured-img" style="background:${featured.gradient}">${featured.emoji}</div>
        <div class="blog-featured-body">
          <div class="blog-featured-tag"><span class="tag tag-teal">${featured.category}</span></div>
          <h2 class="blog-featured-title">${featured.title}</h2>
          <p class="blog-featured-excerpt">${featured.excerpt}</p>
          <div class="blog-featured-meta">
            <span class="blog-date">${featured.date}</span>
            <span class="blog-date">·</span>
            <span class="blog-date">${featured.readTime}</span>
          </div>
          <span class="btn btn-dark btn-arrow">Read Article</span>
        </div>
      </a>

      <div class="eyebrow" style="margin-bottom:1.8rem">More Articles</div>
      <div class="blog-grid">${restCards}</div>
    </div>
  </section>

  ${renderNewsletter()}`;
};

/* ═══════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════ */
pages['about'] = function() {
  const values = [
    { icon:'🔬', title:'Evidence-Based', desc:'Every recommendation is grounded in peer-reviewed research. We never publish advice without scientific backing.' },
    { icon:'🔒', title:'Private & Secure', desc:'Your health information is deeply personal. We guarantee 100% confidentiality across all our services.' },
    { icon:'🎯', title:'Personalized', desc:'Generic advice rarely works. Every guide and consultation is tailored to your specific condition, goals, and preferences.' },
    { icon:'🌱', title:'Natural-First', desc:'We prioritize lifestyle and natural interventions before jumping to medications or invasive treatments.' },
    { icon:'💬', title:'Accessible', desc:'All our foundational resources are free. We believe quality health education should not be gated by income.' },
    { icon:'🤝', title:'Compassionate', desc:'Health struggles can feel isolating. We approach every topic — no matter how sensitive — with empathy and zero judgment.' }
  ];

  const team = [
    { init:'AH', name:'Dr. A. Okello', role:'Founder & Lead Health Consultant', bg:'linear-gradient(135deg,#09C8B8,#07a89a)',
      bio:'Trained physician with 10+ years in integrative and preventive health. Passionate about making evidence-based healthcare accessible to everyone.' },
    { init:'SN', name:'Sarah Nakato', role:'Women\'s Health Specialist', bg:'linear-gradient(135deg,#A06046,#705C52)',
      bio:'Specializes in hormonal health, PCOS management, and maternal wellness. Dedicated to empowering women to understand their bodies.' },
    { init:'BK', name:'Brian Kiprotich', role:'Men\'s Health & Wellness Coach', bg:'linear-gradient(135deg,#161919,#2a2e2e)',
      bio:'Expert in men\'s hormonal optimization, sexual health, and behavioral change. Advocates for breaking the silence around men\'s health challenges.' }
  ];

  return `
  <style>
    .about-hero {
      padding:calc(var(--nav-h) + 5rem) 5% 5rem;
      background:linear-gradient(135deg,var(--sage) 0%,#c5cec8 100%);
      display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center;
    }
    .about-hero h1 { margin-bottom:1.2rem; }
    .about-hero .lead { margin-bottom:1.8rem; }
    .about-hero-img {
      border-radius:var(--radius-xl); overflow:hidden;
      background:linear-gradient(135deg,var(--black),var(--charcoal));
      height:440px; display:flex; align-items:center; justify-content:center;
      font-size:6rem; box-shadow:var(--shadow-lg);
      position:relative;
    }
    .about-hero-img::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(to top, rgba(9,200,184,.15), transparent);
    }
    .values-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.8rem; }
    .value-card {
      padding:2rem; border-radius:var(--radius-lg);
      border:1.5px solid var(--border); background:var(--white);
      transition:border-color .2s, transform .2s, box-shadow .2s;
    }
    .value-card:hover { border-color:var(--teal); transform:translateY(-4px); box-shadow:var(--shadow-md); }
    .value-icon { font-size:2rem; margin-bottom:1rem; }
    .value-card h3 { font-size:1rem; font-weight:700; margin-bottom:.5rem; }
    .value-card p { font-size:.85rem; color:var(--warm-brown); line-height:1.7; }

    .team-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; }
    .team-card {
      border-radius:var(--radius-lg); overflow:hidden;
      background:var(--white); border:1.5px solid var(--border);
      text-align:center;
      transition:transform .25s, box-shadow .25s;
    }
    .team-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
    .team-avatar {
      height:200px; display:flex; align-items:center; justify-content:center;
      font-family:var(--font-display); font-size:3.5rem; font-weight:700; color:#fff;
    }
    .team-body { padding:1.5rem; }
    .team-name { font-family:var(--font-display); font-size:1.3rem; font-weight:700; margin-bottom:.2rem; }
    .team-role { font-size:.78rem; color:var(--teal); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:.8rem; }
    .team-bio { font-size:.83rem; color:var(--warm-brown); line-height:1.65; }

    .mission-strip {
      background:var(--black); padding:6rem 5%;
      display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center;
    }
    .mission-strip h2 { color:var(--white); margin-bottom:1.2rem; }
    .mission-strip p { color:rgba(255,255,255,.55); line-height:1.8; margin-bottom:1rem; font-size:.95rem; }
    .mission-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .mission-stat {
      background:rgba(255,255,255,.05); border-radius:var(--radius-md);
      padding:1.5rem; border:1px solid rgba(255,255,255,.08);
    }
    .mission-stat .num { font-family:var(--font-display); font-size:2.5rem; font-weight:700; color:var(--teal); }
    .mission-stat .lbl { font-size:.78rem; color:rgba(255,255,255,.4); margin-top:.3rem; }
    @media(max-width:960px) {
      .about-hero, .mission-strip { grid-template-columns:1fr; }
      .values-grid { grid-template-columns:repeat(2,1fr); }
      .team-grid { grid-template-columns:1fr; }
    }
    @media(max-width:600px) { .values-grid { grid-template-columns:1fr; } }
  </style>

  <!-- ABOUT HERO -->
  <section class="about-hero">
    <div class="reveal">
      <div class="eyebrow" style="margin-bottom:.8rem">Our Story</div>
      <h1 class="display-lg">Health Should Be<br>Personal. Private.<br>Empowering.</h1>
      <p class="lead">We started Apophero Health because too many people struggle with health challenges in silence — unable to find practical, personalized guidance without expensive consultations or judgment.</p>
      <p class="lead">Our mission is simple: give every person access to the knowledge and support they need to transform their health — free, private, and on their own terms.</p>
      <div style="display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap">
        <a class="btn btn-primary" onclick="navigate('shop')">Browse Our Guides</a>
        <a class="btn btn-outline" onclick="navigate('contact')">Get in Touch</a>
      </div>
    </div>
    <div class="about-hero-img reveal reveal-delay-1">🏥</div>
  </section>

  <!-- MISSION -->
  <section class="mission-strip">
    <div class="reveal">
      <div class="eyebrow" style="color:var(--teal);margin-bottom:.8rem">Our Mission</div>
      <h2 class="display-md">Complete, Convenient Healthcare</h2>
      <p>We empower you with expert-guided insights and treatments, actionable guides and programs, and well-researched health articles — all in one place.</p>
      <p>Every recommendation is customized to your condition, goals, and preferences. We combine education, natural treatment options, and personal support into a cohesive framework that actually works.</p>
    </div>
    <div class="mission-stat-grid reveal reveal-delay-1">
      <div class="mission-stat"><div class="num">8+</div><div class="lbl">Free Health Guides</div></div>
      <div class="mission-stat"><div class="num">100%</div><div class="lbl">Private & Confidential</div></div>
      <div class="mission-stat"><div class="num">1:1</div><div class="lbl">Personal Counselling</div></div>
      <div class="mission-stat"><div class="num">5★</div><div class="lbl">Client Satisfaction</div></div>
    </div>
  </section>

  <!-- VALUES -->
  <section class="section-pad" style="background:var(--off-white)">
    <div class="container">
      <div class="section-header center reveal">
        <div class="eyebrow">What We Stand For</div>
        <h2 class="display-md" style="margin-top:.6rem">Our Core Values</h2>
        <p class="lead">The principles that guide everything we create and every person we serve.</p>
      </div>
      <div class="values-grid">
        ${values.map((v,i)=>`
          <div class="value-card reveal reveal-delay-${i%3+1}">
            <div class="value-icon">${v.icon}</div>
            <h3>${v.title}</h3>
            <p>${v.desc}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- TEAM -->
  <section class="section-pad" style="background:var(--white)">
    <div class="container">
      <div class="section-header center reveal">
        <div class="eyebrow">The Team</div>
        <h2 class="display-md" style="margin-top:.6rem">Meet Our Experts</h2>
        <p class="lead">Dedicated health professionals committed to your wellbeing.</p>
      </div>
      <div class="team-grid">
        ${team.map((m,i)=>`
          <div class="team-card reveal reveal-delay-${i+1}">
            <div class="team-avatar" style="background:${m.bg}">${m.init}</div>
            <div class="team-body">
              <div class="team-name">${m.name}</div>
              <div class="team-role">${m.role}</div>
              <p class="team-bio">${m.bio}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>

  ${renderNewsletter()}`;
};

/* ═══════════════════════════════════════════
   CONTACT PAGE
═══════════════════════════════════════════ */
pages['contact'] = function() {
  return `
  <style>
    .contact-layout {
      display:grid; grid-template-columns:1fr 1.4fr; gap:4rem; align-items:start;
    }
    .contact-info-card {
      background:var(--black); border-radius:var(--radius-xl);
      padding:3rem; color:#fff; position:sticky; top:calc(var(--nav-h) + 2rem);
    }
    .contact-info-card h2 { color:#fff; margin-bottom:1rem; }
    .contact-info-card p { color:rgba(255,255,255,.55); line-height:1.75; font-size:.9rem; margin-bottom:2rem; }
    .contact-detail { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1.5rem; }
    .contact-icon {
      width:42px; height:42px; border-radius:var(--radius-sm);
      background:rgba(9,200,184,.15); color:var(--teal);
      display:flex; align-items:center; justify-content:center;
      font-size:1.1rem; flex-shrink:0;
    }
    .contact-detail-label { font-size:.72rem; color:rgba(255,255,255,.35); font-weight:600; text-transform:uppercase; letter-spacing:.6px; }
    .contact-detail-val { font-size:.9rem; color:rgba(255,255,255,.8); margin-top:.2rem; }
    .contact-form-card {
      background:var(--white); border-radius:var(--radius-xl);
      padding:3rem; border:1.5px solid var(--border);
    }
    .contact-form-card h2 { margin-bottom:.5rem; }
    .contact-form-card > p { color:var(--warm-brown); font-size:.9rem; margin-bottom:2rem; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    @media(max-width:960px) { .contact-layout { grid-template-columns:1fr; } .contact-info-card { position:static; } }
    @media(max-width:600px) { .form-row { grid-template-columns:1fr; } .contact-form-card { padding:2rem; } .contact-info-card { padding:2rem; } }
  </style>

  <div class="page-hero">
    <span class="eyebrow">Get in Touch</span>
    <h1 class="display-lg">We'd Love to Hear From You</h1>
    <p class="lead">Have a question, feedback, or need guidance? Our team responds within 24 hours.</p>
  </div>

  <section class="section-pad">
    <div class="container">
      <div class="contact-layout">
        <div class="contact-info-card reveal">
          <div class="eyebrow" style="color:var(--teal);margin-bottom:.8rem">Contact Info</div>
          <h2 class="display-sm">Let's Talk Health</h2>
          <p>Whether you have a question about our guides, want to book a consultation, or just need direction — we're here for you.</p>
          <div class="contact-detail">
            <div class="contact-icon">📧</div>
            <div>
              <div class="contact-detail-label">Email</div>
              <div class="contact-detail-val">hello@apopherohealth.com</div>
            </div>
          </div>
          <div class="contact-detail">
            <div class="contact-icon">💬</div>
            <div>
              <div class="contact-detail-label">WhatsApp</div>
              <div class="contact-detail-val">+256 700 000 000</div>
            </div>
          </div>
          <div class="contact-detail">
            <div class="contact-icon">🕐</div>
            <div>
              <div class="contact-detail-label">Response Time</div>
              <div class="contact-detail-val">Within 24 hours</div>
            </div>
          </div>
          <div class="contact-detail">
            <div class="contact-icon">🌍</div>
            <div>
              <div class="contact-detail-label">Available</div>
              <div class="contact-detail-val">Worldwide — fully remote</div>
            </div>
          </div>
          <div style="margin-top:2rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.08)">
            <div class="contact-detail-label" style="margin-bottom:.8rem">Follow Us</div>
            <div style="display:flex;gap:.6rem">
              <a href="#" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.07);color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:var(--transition)" onmouseover="this.style.background='#09C8B8';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,.07)';this.style.color='rgba(255,255,255,.5)'">in</a>
              <a href="#" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.07);color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:var(--transition)" onmouseover="this.style.background='#09C8B8';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,.07)';this.style.color='rgba(255,255,255,.5)'">𝕏</a>
              <a href="#" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.07);color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:var(--transition)" onmouseover="this.style.background='#09C8B8';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,.07)';this.style.color='rgba(255,255,255,.5)'">◎</a>
            </div>
          </div>
        </div>

        <div class="contact-form-card reveal reveal-delay-1">
          <h2 class="display-sm">Send Us a Message</h2>
          <p>Fill in the form and we'll get back to you as soon as possible.</p>
          <form onsubmit="submitContact(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input class="form-input" type="text" placeholder="John" required>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input class="form-input" type="text" placeholder="Doe" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input class="form-input" type="email" placeholder="john@example.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Subject *</label>
              <select class="form-select form-input" required>
                <option value="">Select a topic…</option>
                <option>Question about a guide</option>
                <option>Book a consultation</option>
                <option>Technical issue</option>
                <option>Feedback or suggestion</option>
                <option>Partnership inquiry</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea class="form-textarea" placeholder="Tell us how we can help you…" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center" id="contactSubmitBtn">
              Send Message →
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>`;
};

function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactSubmitBtn');
  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'var(--teal-dark)';
  btn.disabled = true;
  showToast('Message sent! We\'ll respond within 24 hours.');
  setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; btn.disabled = false; e.target.reset(); }, 4000);
}

/* ═══════════════════════════════════════════
   BOOK CONSULTATION PAGE
═══════════════════════════════════════════ */
pages['book'] = function() {
  const packages = [
    { icon:'💬', name:'Quick Consult', duration:'30 minutes', price:'Free intro', desc:'A brief orientation session to understand your health goals and point you to the right resources.', features:['Health goal assessment','Resource recommendations','Q&A session','Follow-up email summary'], highlight:false },
    { icon:'🎯', name:'Deep Dive', duration:'60 minutes', price:'Premium', desc:'A comprehensive 1-on-1 session where we build a fully personalized health protocol for your specific condition.', features:['Full health assessment','Custom protocol creation','Lifestyle & nutrition plan','2-week email follow-up','Supplement guidance'], highlight:true },
    { icon:'🚀', name:'3-Month Journey', duration:'Monthly sessions', price:'Full Program', desc:'Three monthly deep-dive sessions plus unlimited WhatsApp support to ensure you hit your health goals.', features:['3 × 60-min sessions','Unlimited WhatsApp support','Protocol adjustments','Progress tracking','Priority response'], highlight:false }
  ];

  return `
  <style>
    .book-hero {
      padding:calc(var(--nav-h) + 5rem) 5% 4rem;
      background:linear-gradient(135deg,var(--black) 0%,var(--charcoal) 100%);
      text-align:center; position:relative; overflow:hidden;
    }
    .book-hero::before {
      content:''; position:absolute; top:-100px; left:50%; transform:translateX(-50%);
      width:600px; height:600px; border-radius:50%;
      background:radial-gradient(circle,rgba(9,200,184,.15) 0%,transparent 65%);
      pointer-events:none;
    }
    .book-hero h1 { color:var(--white); }
    .book-hero .lead { color:rgba(255,255,255,.6); }
    .packages-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; }
    .pkg-card {
      border-radius:var(--radius-xl); padding:2.5rem 2rem;
      border:1.5px solid var(--border); background:var(--white);
      transition:transform .25s, box-shadow .25s;
      display:flex; flex-direction:column;
    }
    .pkg-card.highlight {
      background:var(--black); border-color:var(--teal);
      position:relative; transform:scale(1.03);
      box-shadow:var(--shadow-lg);
    }
    .pkg-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
    .pkg-card.highlight:hover { transform:scale(1.03) translateY(-5px); }
    .pkg-badge {
      position:absolute; top:-14px; left:50%; transform:translateX(-50%);
      background:var(--teal); color:#fff;
      font-size:.7rem; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
      padding:.35rem 1rem; border-radius:100px; white-space:nowrap;
    }
    .pkg-icon { font-size:2.5rem; margin-bottom:1.2rem; }
    .pkg-name { font-family:var(--font-display); font-size:1.5rem; font-weight:700; margin-bottom:.3rem; }
    .pkg-card.highlight .pkg-name { color:var(--white); }
    .pkg-duration { font-size:.78rem; color:var(--teal); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:.8rem; }
    .pkg-price { font-family:var(--font-display); font-size:1.8rem; font-weight:700; color:var(--teal); margin-bottom:1rem; }
    .pkg-desc { font-size:.85rem; color:var(--warm-brown); line-height:1.7; margin-bottom:1.5rem; }
    .pkg-card.highlight .pkg-desc { color:rgba(255,255,255,.5); }
    .pkg-features { list-style:none; display:flex; flex-direction:column; gap:.6rem; flex:1; margin-bottom:1.8rem; }
    .pkg-features li { font-size:.85rem; display:flex; align-items:center; gap:.6rem; }
    .pkg-card.highlight .pkg-features li { color:rgba(255,255,255,.75); }
    .pkg-features li::before { content:'✓'; color:var(--teal); font-weight:700; flex-shrink:0; }

    .book-form-section { background:var(--sage); }
    .book-form-card {
      max-width:680px; margin:0 auto;
      background:var(--white); border-radius:var(--radius-xl);
      padding:3rem; border:1.5px solid var(--border);
      box-shadow:var(--shadow-lg);
    }
    .book-form-card h2 { margin-bottom:.5rem; }
    .book-form-card > p { color:var(--warm-brown); font-size:.9rem; margin-bottom:2rem; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    @media(max-width:960px) { .packages-grid { grid-template-columns:1fr; } .pkg-card.highlight { transform:none; } }
    @media(max-width:600px) { .form-row { grid-template-columns:1fr; } .book-form-card { padding:2rem; } }
  </style>

  <div class="book-hero">
    <div class="eyebrow" style="margin-bottom:.8rem">1-on-1 Consultation</div>
    <h1 class="display-lg" style="margin-bottom:1rem">Your Personalized<br>Health Session</h1>
    <p class="lead" style="max-width:540px;margin:0 auto">
      Work directly with our health experts to build a protocol tailored to your exact condition, lifestyle, and goals.
    </p>
  </div>

  <!-- PACKAGES -->
  <section class="section-pad" style="background:var(--white)">
    <div class="container">
      <div class="section-header center reveal">
        <div class="eyebrow">Choose Your Package</div>
        <h2 class="display-md" style="margin-top:.6rem">Find the Right Level of Support</h2>
        <p class="lead">From a quick orientation call to a full 3-month transformation program.</p>
      </div>
      <div class="packages-grid">
        ${packages.map((p,i)=>`
          <div class="pkg-card ${p.highlight?'highlight':''} reveal reveal-delay-${i+1}">
            ${p.highlight?'<span class="pkg-badge">Most Popular</span>':''}
            <div class="pkg-icon">${p.icon}</div>
            <div class="pkg-name">${p.name}</div>
            <div class="pkg-duration">${p.duration}</div>
            <div class="pkg-price">${p.price}</div>
            <p class="pkg-desc">${p.desc}</p>
            <ul class="pkg-features">
              ${p.features.map(f=>`<li>${f}</li>`).join('')}
            </ul>
            <a class="btn ${p.highlight?'btn-primary':'btn-outline'}" onclick="scrollToBookForm()" style="text-align:center;justify-content:center">
              Book This Session →
            </a>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- BOOKING FORM -->
  <section class="section-pad book-form-section" id="bookForm">
    <div class="container">
      <div class="book-form-card reveal">
        <div class="eyebrow" style="margin-bottom:.8rem">Book Your Session</div>
        <h2 class="display-sm">Fill in Your Details</h2>
        <p>We'll confirm your session and send preparation materials within 24 hours.</p>
        <form onsubmit="submitBooking(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name *</label>
              <input class="form-input" type="text" placeholder="Jane" required>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input class="form-input" type="text" placeholder="Doe" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input class="form-input" type="email" placeholder="jane@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp Number</label>
            <input class="form-input" type="tel" placeholder="+256 700 000 000">
          </div>
          <div class="form-group">
            <label class="form-label">Session Type *</label>
            <select class="form-select form-input" required>
              <option value="">Choose a session…</option>
              <option>Quick Consult (Free intro)</option>
              <option>Deep Dive (Premium)</option>
              <option>3-Month Journey (Full Program)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Primary Health Concern *</label>
            <select class="form-select form-input" required>
              <option value="">Select your concern…</option>
              <option>Weight Loss / Metabolism</option>
              <option>Testosterone / Men's Hormones</option>
              <option>Premature Ejaculation</option>
              <option>PCOS / Women's Hormones</option>
              <option>Pregnancy / Antenatal</option>
              <option>Mental / Behavioral Health</option>
              <option>General Wellness</option>
              <option>Multiple concerns</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tell us more about your goals</label>
            <textarea class="form-textarea" placeholder="What are you hoping to achieve? Any current medications or conditions we should know about?"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center" id="bookBtn">
            Request Booking →
          </button>
          <p style="font-size:.74rem;color:var(--slate);margin-top:.8rem;text-align:center">
            🔒 Your information is 100% private and confidential. We will never share your data.
          </p>
        </form>
      </div>
    </div>
  </section>`;
};

function scrollToBookForm() {
  document.getElementById('bookForm')?.scrollIntoView({ behavior:'smooth' });
}

function submitBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('bookBtn');
  btn.textContent = '✓ Booking Request Sent!';
  btn.style.background = 'var(--teal-dark)';
  btn.disabled = true;
  showToast('Booking received! We\'ll confirm within 24 hours. 🎉');
  setTimeout(() => { btn.textContent = 'Request Booking →'; btn.style.background = ''; btn.disabled = false; e.target.reset(); }, 5000);
}
