'use strict';
// ═══════════════════════════════════════════
//  DATABASE SEEDER
//  Usage:
//    node utils/seeder.js          → seed
//    node utils/seeder.js --clear  → wipe everything
// ═══════════════════════════════════════════
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose   = require('mongoose');
const User       = require('../models/User');
const { Blog }   = require('../models/index');
const logger     = require('./logger');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('✅ Connected to MongoDB for seeding');
};

// ── Sample blog posts ─────────────────────
const blogPosts = (authorId) => [
  {
    title:    '5 Metabolism Myths That Are Keeping You Fat',
    excerpt:  'Everything you\'ve been told about metabolism and weight loss is probably wrong. Here\'s what the science actually says.',
    content:  `<p>When it comes to weight loss, misinformation runs rampant...</p>
               <h2>Myth 1: Eating small meals boosts metabolism</h2>
               <p>This is one of the most persistent myths in nutrition. Multiple meta-analyses have shown that meal frequency has no meaningful impact on metabolic rate...</p>
               <h2>Myth 2: Cardio is the best fat-loss tool</h2>
               <p>While cardiovascular exercise is excellent for heart health, it is far inferior to resistance training for long-term metabolic adaptation...</p>`,
    category: 'Weight Loss', topic: 'weight',
    emoji: '🔥', gradient: 'linear-gradient(135deg,#161919,#2a2e2e)',
    tags: ['Metabolism','Fat Loss','Nutrition','Science'],
    readTime: '8 min read', status: 'published', featured: true,
    author: authorId
  },
  {
    title:    'The 10 Best Foods to Naturally Boost Testosterone',
    excerpt:  'What you eat directly shapes your hormone levels. These ten foods are backed by clinical studies to raise T naturally.',
    content:  `<p>Testosterone is the cornerstone of male health...</p>
               <h2>1. Fatty Fish (Salmon, Mackerel)</h2>
               <p>Rich in Vitamin D and omega-3 fatty acids, both independently associated with higher testosterone levels in clinical research...</p>
               <h2>2. Eggs</h2>
               <p>The yolk contains cholesterol — the direct precursor to testosterone synthesis in the Leydig cells of the testes...</p>`,
    category: "Men's Health", topic: 'hormones',
    emoji: '⚡', gradient: 'linear-gradient(135deg,#09C8B8,#07a89a)',
    tags: ['Testosterone','Men','Hormones','Food'],
    readTime: '6 min read', status: 'published', featured: false,
    author: authorId
  },
  {
    title:    'How Lifestyle Changes Can Reverse PCOS Symptoms',
    excerpt:  'PCOS doesn\'t have to be a life sentence. Mounting evidence shows lifestyle interventions can dramatically reduce — and even reverse — symptoms.',
    content:  `<p>Polycystic Ovarian Syndrome affects roughly 10% of women of reproductive age...</p>
               <h2>The Role of Insulin Resistance</h2>
               <p>Up to 70% of women with PCOS have some degree of insulin resistance, which drives excess androgen production...</p>
               <h2>Exercise as Medicine</h2>
               <p>Resistance training has been shown in multiple RCTs to improve insulin sensitivity, reduce androgen levels, and restore ovulatory function...</p>`,
    category: "Women's Health", topic: 'hormones',
    emoji: '🌸', gradient: 'linear-gradient(135deg,#A06046,#705C52)',
    tags: ['PCOS','Women','Hormones','Lifestyle'],
    readTime: '10 min read', status: 'published', featured: true,
    author: authorId
  },
  {
    title:    'Why Sleep Is Your Most Powerful Hormone Regulator',
    excerpt:  'Poor sleep is silently destroying your hormonal health. Here\'s the science and what to do about it tonight.',
    content:  `<p>Of all the lifestyle factors that influence hormonal health, sleep is the most underestimated...</p>
               <h2>Testosterone and Sleep</h2>
               <p>90% of daily testosterone release occurs during sleep, tightly coupled with REM cycles. A week of sleep restriction to 5 hours reduces testosterone by 10–15%...</p>`,
    category: 'Wellness', topic: 'wellness',
    emoji: '🌙', gradient: 'linear-gradient(135deg,#848B8C,#161919)',
    tags: ['Sleep','Hormones','Wellness','Recovery'],
    readTime: '7 min read', status: 'published', featured: false,
    author: authorId
  },
  {
    title:    'The Hidden Link Between Chronic Stress and Weight Gain',
    excerpt:  'Cortisol doesn\'t just make you anxious — it\'s actively making you store fat. Understanding this is the first step to breaking the cycle.',
    content:  `<p>Chronic psychological stress triggers a cascade of hormonal changes that promote fat storage...</p>
               <h2>How Cortisol Drives Visceral Fat</h2>
               <p>Cortisol increases appetite, promotes glucose release, and — critically — activates lipoprotein lipase in visceral adipose tissue, causing preferential fat storage around the abdomen...</p>`,
    category: 'Weight Loss', topic: 'weight',
    emoji: '🧬', gradient: 'linear-gradient(135deg,#705C52,#A06046)',
    tags: ['Stress','Cortisol','Weight','Mental Health'],
    readTime: '9 min read', status: 'published', featured: false,
    author: authorId
  },
  {
    title:    'The 20-Minute Morning Routine That Changes Everything',
    excerpt:  'You don\'t need two hours of morning rituals. These five focused practices can transform your energy, focus, and health — in just 20 minutes.',
    content:  `<p>The wellness industry has made morning routines needlessly complex...</p>
               <h2>Step 1: Hydration First (2 minutes)</h2>
               <p>You wake up 6–8 hours dehydrated. Drinking 500ml of water within 5 minutes of waking improves cognitive performance by up to 14%...</p>`,
    category: 'Wellness', topic: 'wellness',
    emoji: '☀️', gradient: 'linear-gradient(135deg,#09C8B8,#A06046)',
    tags: ['Morning Routine','Habits','Productivity','Wellness'],
    readTime: '5 min read', status: 'published', featured: false,
    author: authorId
  },
  {
    title:    'Understanding Premature Ejaculation: Causes & Solutions',
    excerpt:  'PE affects 1 in 3 men yet remains one of the least discussed men\'s health conditions. Here is a comprehensive, judgment-free breakdown.',
    content:  `<p>Premature ejaculation is defined clinically as ejaculation occurring within approximately one minute of penetration...</p>
               <h2>The Psychological Component</h2>
               <p>Performance anxiety creates a self-reinforcing cycle — anxiety causes PE, PE causes more anxiety...</p>
               <h2>Behavioral Techniques That Work</h2>
               <p>The stop-start method and squeeze technique both have strong evidence bases, with success rates above 60% in clinical settings...</p>`,
    category: "Men's Health", topic: 'sexual-health',
    emoji: '🛡️', gradient: 'linear-gradient(135deg,#A06046,#705C52)',
    tags: ["Men's Health",'Sexual Health','PE','Confidence'],
    readTime: '11 min read', status: 'draft', featured: false,
    author: authorId
  }
];

// ── Seed function ──────────────────────────
const seed = async () => {
  await connectDB();

  // 1. Create / update admin user
  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (admin) {
    logger.info(`Admin already exists: ${admin.email} — skipping user creation`);
  } else {
    admin = await User.create({
      name:     process.env.ADMIN_NAME     || 'Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@apopherohealth.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@2026!',
      role:     'admin',
      isVerified: true
    });
    logger.info(`✅ Admin created: ${admin.email}`);
  }

  // 2. Seed blog posts (skip if already seeded)
  const existingPosts = await Blog.countDocuments();
  if (existingPosts > 0) {
    logger.info(`Blog posts already exist (${existingPosts}) — skipping`);
  } else {
    const posts = await Blog.insertMany(blogPosts(admin._id));
    logger.info(`✅ ${posts.length} blog posts seeded`);
  }

  logger.info('🌱 Seeding complete!');
  logger.info('─────────────────────────────────────');
  logger.info(`Admin Email:    ${admin.email}`);
  logger.info(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@2026!'}`);
  logger.info('─────────────────────────────────────');
  logger.info('⚠️  Change the admin password after first login!');

  process.exit(0);
};

// ── Clear function ─────────────────────────
const clear = async () => {
  await connectDB();

  const { Contact, Newsletter, Booking } = require('../models/index');

  await Promise.all([
    User.deleteMany(),
    Blog.deleteMany(),
    Contact.deleteMany(),
    Newsletter.deleteMany(),
    Booking.deleteMany()
  ]);

  logger.warn('⚠️  All data wiped from database.');
  process.exit(0);
};

// ── Run ───────────────────────────────────
if (process.argv.includes('--clear')) {
  clear().catch(err => { logger.error(err); process.exit(1); });
} else {
  seed().catch(err => { logger.error(err); process.exit(1); });
}
