const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function createMockKnowledgeBase(count = 140) {
  const topics = ['low color contrast', 'visual hierarchy', 'spacing system', 'navigation clarity', 'button affordance', 'form usability', 'accessibility', 'responsive layout', 'typography', 'dashboard structure'];
  const tips = ['Increase contrast ratios for text and UI controls.', 'Use stronger heading scales and whitespace grouping.', 'Adopt an 8px spacing scale for predictable rhythm.', 'Simplify nav labels and keep primary actions prominent.', 'Add clear hover/focus/pressed states on clickable elements.', 'Reduce form fields and provide inline validation.', 'Ensure keyboard support and meaningful focus order.', 'Design mobile-first breakpoints and test overflow behavior.', 'Limit font variants and improve line-height consistency.', 'Group related metrics into clear visual sections.'];
  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length];
    const tip = tips[i % tips.length];
    return {
      id: i + 1,
      question: `Tell me more about ${topic}`,
      answer: `Detailed guidance #${i + 1}: For ${topic}, start by auditing current screens with user tasks. ${tip} Then validate with 5 quick usability tests and measure completion time, error rate, and confidence before and after changes.`
    };
  });
}

const db = {
  uploadedImage: null,
  profile: {
    fullName: 'Olivia Smith',
    email: 'olivia.smith@student.com',
    bio: 'UX design enthusiast and computer science student.',
    role: 'Student',
    stats: { analysesRun: 24, discussions: 12, helpfulVotes: 89, memberSince: 'Apr 2024' }
  },
  password: 'password123',
  messages: [],
  users: {
    'Ethan Park': { fullName: 'Ethan Park', role: 'UX Designer', bio: 'Focused on onboarding and conversion.', email: 'ethan@example.com' },
    'Aisha Khan': { fullName: 'Aisha Khan', role: 'Product Designer', bio: 'Loves data-dense dashboards.', email: 'aisha@example.com' },
    'Sarah Johnson': { fullName: 'Sarah Johnson', role: 'UX Researcher', bio: 'Runs usability tests and interviews.', email: 'sarah@example.com' },
    'Olivia Smith': { fullName: 'Olivia Smith', role: 'Student', bio: 'UX design enthusiast and computer science student.', email: 'olivia.smith@student.com' }
  },
  analysisKnowledgeBase: createMockKnowledgeBase(140),
  posts: [
    {
      id: 1,
      title: 'How can I improve the onboarding flow of this app?',
      preview: 'I\'m working on a financial app and would love feedback on the onboarding experience. What could be clearer or more engaging?',
      author: 'Ethan Park',
      time: '2h ago',
      topic: 'UX Design',
      imageUrl: null,
      commentsCount: 12,
      likes: 24,
      comments: [{ id: 1, user: 'Sarah Johnson', text: 'Try progressive disclosure and fewer fields on first step.' }]
    },
    {
      id: 2,
      title: 'Thoughts on this dashboard layout',
      preview: 'Trying to simplify the dashboard for better readability. Any suggestions on reducing cognitive load?',
      author: 'Aisha Khan',
      time: '5h ago',
      topic: 'Dashboard',
      imageUrl: null,
      commentsCount: 8,
      likes: 18,
      comments: []
    }
  ],
  lastPostId: 2,
  lastCommentId: 1
};

const sampleAnalysis = { issues: [{ id: 1, title: 'Low Color Contrast', description: 'Some text elements have insufficient contrast against their background.', principle: 'Visibility', severity: 'High' }], suggestions: [{ id: 1, text: 'Increase contrast between text and background to meet WCAG AA standards.', impact: 'High' }] };

const sendJson = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
const readBody = (req) => new Promise((resolve, reject) => { let raw = ''; req.on('data', (c) => { raw += c; if (raw.length > 12 * 1024 * 1024) { reject(new Error('Payload too large')); req.destroy(); } }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON body')); } }); req.on('error', reject); });

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8' }[ext] || 'text/plain; charset=utf-8';
  fs.readFile(filePath, (err, content) => { if (err) return sendJson(res, 404, { error: 'Not found' }); res.writeHead(200, { 'Content-Type': mime }); res.end(content); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;

  try {
    if (pathname === '/api/upload' && req.method === 'POST') { const { imageDataUrl } = await readBody(req); if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) return sendJson(res, 400, { error: 'Valid image is required.' }); db.uploadedImage = imageDataUrl; return sendJson(res, 200, { success: true, imageUrl: db.uploadedImage }); }
    if (pathname === '/api/upload/latest' && req.method === 'GET') return sendJson(res, 200, { imageUrl: db.uploadedImage });
    if (pathname === '/api/analysis/run' && req.method === 'POST') { if (!db.uploadedImage) return sendJson(res, 400, { error: 'Please upload a screenshot first.' }); db.profile.stats.analysesRun += 1; return sendJson(res, 200, { ...sampleAnalysis, generatedAt: new Date().toISOString() }); }
    if (pathname === '/api/analysis/chat' && req.method === 'POST') {
      const { message } = await readBody(req);
      if (!message) return sendJson(res, 400, { error: 'message is required.' });
      const lower = message.toLowerCase();
      const matches = db.analysisKnowledgeBase.filter((k) => lower.includes(k.question.replace('Tell me more about ', '')) || k.answer.toLowerCase().includes(lower.split(' ')[0])).slice(0, 4);
      const fallback = db.analysisKnowledgeBase.slice(0, 3);
      return sendJson(res, 200, { reply: (matches.length ? matches : fallback).map((m) => m.answer).join('\n\n') });
    }
    if (pathname === '/api/analysis/knowledge-base' && req.method === 'GET') return sendJson(res, 200, db.analysisKnowledgeBase);

    if (pathname === '/api/posts' && req.method === 'GET') {
      const sort = searchParams.get('sort') || 'latest';
      const q = (searchParams.get('q') || '').toLowerCase();
      let posts = [...db.posts];
      if (q) posts = posts.filter((p) => [p.title, p.preview, p.author, p.topic].join(' ').toLowerCase().includes(q));
      posts.sort((a, b) => (sort === 'top' ? b.likes - a.likes : b.id - a.id));
      return sendJson(res, 200, posts);
    }
    if (pathname === '/api/posts' && req.method === 'POST') {
      const { title, preview, author, topic, imageDataUrl } = await readBody(req);
      if (!title || !preview || !author || !topic) return sendJson(res, 400, { error: 'title, preview, author, topic are required.' });
      db.lastPostId += 1;
      const post = { id: db.lastPostId, title, preview, author, topic, imageUrl: imageDataUrl || null, time: 'Just now', commentsCount: 0, likes: 0, comments: [] };
      db.posts.push(post);
      db.profile.stats.discussions += 1;
      return sendJson(res, 201, post);
    }
    if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments') && req.method === 'POST') {
      const postId = Number(pathname.split('/')[3]); const post = db.posts.find((p) => p.id === postId); if (!post) return sendJson(res, 404, { error: 'Post not found.' });
      const { user, text } = await readBody(req); if (!user || !text) return sendJson(res, 400, { error: 'user and text are required.' });
      db.lastCommentId += 1; const comment = { id: db.lastCommentId, user, text }; post.comments.push(comment); post.commentsCount += 1; return sendJson(res, 201, comment);
    }
    if (pathname === '/api/user/profile' && req.method === 'GET') {
      const name = searchParams.get('name');
      if (!name || !db.users[name]) return sendJson(res, 404, { error: 'User not found.' });
      return sendJson(res, 200, db.users[name]);
    }
    if (pathname === '/api/messages' && req.method === 'POST') {
      const { to, message } = await readBody(req);
      if (!to || !message) return sendJson(res, 400, { error: 'to and message are required.' });
      const entry = { to, from: db.profile.fullName, message, sentAt: new Date().toISOString() };
      db.messages.push(entry);
      return sendJson(res, 201, { success: true, entry, autoReply: `${to} received your message and can reply in inbox.` });
    }

    if (pathname === '/api/profile' && req.method === 'GET') return sendJson(res, 200, db.profile);
    if (pathname === '/api/profile' && req.method === 'PUT') { const { fullName, email, bio } = await readBody(req); if (!fullName || !email) return sendJson(res, 400, { error: 'fullName and email are required.' }); db.profile.fullName = fullName; db.profile.email = email; db.profile.bio = bio || ''; return sendJson(res, 200, { success: true, profile: db.profile }); }
    if (pathname === '/api/profile/password' && req.method === 'PUT') { const { newPassword, confirmPassword } = await readBody(req); if (!newPassword || !confirmPassword) return sendJson(res, 400, { error: 'Both fields are required.' }); if (newPassword !== confirmPassword) return sendJson(res, 400, { error: 'Passwords do not match.' }); if (newPassword.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters.' }); db.password = newPassword; return sendJson(res, 200, { success: true, message: 'Password updated.' }); }
    if (pathname === '/api/discussion/meta' && req.method === 'GET') return sendJson(res, 200, { topContributors: [{ name: 'Sarah Johnson', points: 128 }, { name: 'Ethan Park', points: 112 }, { name: 'Aisha Khan', points: 98 }, { name: 'Liam Chen', points: 85 }], popularTopics: ['Onboarding', 'Dashboard', 'Buttons', 'Navigation', 'Typography', 'Forms'] });

    if (pathname === '/' || pathname === '/index.html') return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    if (pathname === '/styles.css') return serveFile(res, path.join(PUBLIC_DIR, 'styles.css'));
    if (pathname === '/app.js') return serveFile(res, path.join(PUBLIC_DIR, 'app.js'));
    return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
  } catch (err) { return sendJson(res, 400, { error: err.message || 'Request failed' }); }
});

server.listen(PORT, () => console.log(`UI Insight running at http://localhost:${PORT}`));
