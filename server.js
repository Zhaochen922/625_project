const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

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
  posts: [
    { id: 1, title: 'How can I improve the onboarding flow of this app?', preview: 'I\'m working on a financial app and would love feedback on the onboarding experience. What could be clearer or more engaging?', author: 'Ethan Park', time: '2h ago', topic: 'UX Design', imageUrl: '', commentsCount: 12, likes: 24, comments: [{ id: 1, user: 'Sarah Johnson', text: 'Try progressive disclosure and fewer fields on first step.' }] },
    { id: 2, title: 'Thoughts on this dashboard layout', preview: 'Trying to simplify the dashboard for better readability. Any suggestions on reducing cognitive load?', author: 'Aisha Khan', time: '5h ago', topic: 'Dashboard', imageUrl: '', commentsCount: 8, likes: 18, comments: [] },
    { id: 3, title: 'Are these CTA buttons clear enough?', preview: 'Users skip the main action in testing. Should I change wording or placement?', author: 'Liam Chen', time: '7h ago', topic: 'Buttons', imageUrl: '', commentsCount: 5, likes: 11, comments: [] },
    { id: 4, title: 'Need feedback on mobile checkout steps', preview: 'Checkout has four steps and some drop-off in step 2. Looking for friction points.', author: 'Nora Patel', time: '9h ago', topic: 'E-commerce', imageUrl: '', commentsCount: 7, likes: 14, comments: [] },
    { id: 5, title: 'Best way to show validation errors?', preview: 'I currently show errors only after submit. Should I do inline validation too?', author: 'Marco Ruiz', time: '11h ago', topic: 'Forms', imageUrl: '', commentsCount: 4, likes: 9, comments: [] },
    { id: 6, title: 'Does this card layout feel too dense?', preview: 'Trying to fit more analytics without overwhelming users. Need hierarchy advice.', author: 'Yuna Kim', time: '12h ago', topic: 'Layout', imageUrl: '', commentsCount: 6, likes: 13, comments: [] },
    { id: 7, title: 'Improving empty state messaging', preview: 'My empty states feel generic. Any examples of better guidance copy?', author: 'David Cole', time: '14h ago', topic: 'UX Writing', imageUrl: '', commentsCount: 3, likes: 7, comments: [] },
    { id: 8, title: 'Navigation menu confusion in user tests', preview: 'Users struggle to find settings and billing pages.', author: 'Priya Rao', time: '16h ago', topic: 'Navigation', imageUrl: '', commentsCount: 10, likes: 16, comments: [] },
    { id: 9, title: 'Typography scale review request', preview: 'Is my heading/body scale too subtle? Looking for readability suggestions.', author: 'Noah Gray', time: '18h ago', topic: 'Typography', imageUrl: '', commentsCount: 2, likes: 6, comments: [] },
    { id: 10, title: 'How to reduce cognitive load on reports page?', preview: 'Report filters and charts are all above the fold and users feel overwhelmed.', author: 'Mia Lopez', time: '20h ago', topic: 'Analytics', imageUrl: '', commentsCount: 9, likes: 17, comments: [] },
    { id: 11, title: 'Accessibility check for color palette', preview: 'Can someone review my palette for contrast issues before dev handoff?', author: 'Sarah Johnson', time: '22h ago', topic: 'Accessibility', imageUrl: '', commentsCount: 13, likes: 21, comments: [] },
    { id: 12, title: 'Should I combine these two form fields?', preview: 'Address form seems long. Thinking of combining optional company fields.', author: 'Owen Price', time: '1d ago', topic: 'Forms', imageUrl: '', commentsCount: 5, likes: 10, comments: [] },
    { id: 13, title: 'Feedback on first-time tooltip tour', preview: 'Tooltip walkthrough may be too verbose. Any tips for concise onboarding?', author: 'Hana Suzuki', time: '1d ago', topic: 'Onboarding', imageUrl: '', commentsCount: 6, likes: 12, comments: [] },
    { id: 14, title: 'Is this table sorting interaction obvious?', preview: 'Users miss that columns are sortable. How can I improve affordance?', author: 'Ben Carter', time: '1d ago', topic: 'Data Table', imageUrl: '', commentsCount: 4, likes: 8, comments: [] },
    { id: 15, title: 'Review my profile settings page structure', preview: 'I split account/security/notification settings—does this grouping make sense?', author: 'Ivy Nguyen', time: '1d ago', topic: 'Information Architecture', imageUrl: '', commentsCount: 7, likes: 15, comments: [] },
    { id: 16, title: 'Need ideas for success state design', preview: 'After submitting, users are unsure what happens next.', author: 'Kai Morgan', time: '1d ago', topic: 'System Feedback', imageUrl: '', commentsCount: 8, likes: 14, comments: [] },
    { id: 17, title: 'Are my icon labels too ambiguous?', preview: 'Icon-only controls are causing misclicks in testing.', author: 'Sofia Mendes', time: '1d ago', topic: 'Iconography', imageUrl: '', commentsCount: 3, likes: 9, comments: [] },
    { id: 18, title: 'Help with progressive disclosure in advanced filters', preview: 'Advanced filter panel feels intimidating for new users.', author: 'Arjun Mehta', time: '2d ago', topic: 'Interaction Design', imageUrl: '', commentsCount: 6, likes: 11, comments: [] },
    { id: 19, title: 'Comparing two hero section variants', preview: 'Variant A is minimal, B is feature-heavy. Which one converts better for clarity?', author: 'Zoe Bennett', time: '2d ago', topic: 'Landing Page', imageUrl: '', commentsCount: 5, likes: 10, comments: [] },
    { id: 20, title: 'Any tips for reducing error rates in signup?', preview: 'Seeing many password and phone-number format errors.', author: 'Rafael Diaz', time: '2d ago', topic: 'Error Prevention', imageUrl: '', commentsCount: 11, likes: 20, comments: [] }
  ],
  lastPostId: 20,
  lastCommentId: 1
};



const uxTopics = {
  "low color contrast": "Low color contrast reduces readability, especially for users with low vision. Increase luminance difference and validate key text/background pairs against WCAG AA.",
  "unclear navigation": "Unclear navigation slows task completion. Use explicit labels, reduce menu depth, and keep current-location indicators visible.",
  "poor hierarchy": "Poor hierarchy makes it hard to prioritize information. Emphasize key actions with stronger size, spacing, and typographic contrast.",
  "confusing labels": "Confusing labels cause errors and hesitation. Replace jargon with user language and pair labels with concise helper text.",
  "accessibility": "Accessibility improvements benefit all users. Ensure keyboard focus states, semantic structure, and text alternatives are consistently present.",
  "feedback visibility": "Users need immediate feedback after actions. Add visible loading, success, and error states close to where interactions happen.",
  "form design": "Improve form completion by grouping related fields, shortening labels, and validating inline with actionable messages.",
  "layout structure": "A stable layout structure improves scanability. Align components to a spacing system and avoid abrupt visual jumps.",
  "task flow": "Task flow should minimize cognitive load. Break complex flows into clear steps and show progress indicators.",
  "error prevention": "Prevent errors with defaults, constraints, and confirmation for destructive actions before submission.",
  "consistency": "Consistency helps users predict outcomes. Reuse components, interaction patterns, and terminology across screens.",
  "readability": "Readability improves comprehension. Use comfortable line lengths, adequate spacing, and clear typographic hierarchy.",
  "redesign suggestions": "Actionable redesign starts with top-impact fixes: contrast, hierarchy, and task clarity. Prioritize by severity and user impact."
};

const topicKeys = Object.keys(uxTopics);
const mockAiResponses = Array.from({ length: 130 }, (_, i) => {
  const topic = topicKeys[i % topicKeys.length];
  return {
    id: i + 1,
    topic,
    text: `${uxTopics[topic]} Recommendation ${i + 1}: run a focused usability check on this area and track completion rate, error rate, and perceived ease.`
  };
});

const userDirectory = {
  'Ethan Park': { name: 'Ethan Park', role: 'Product Designer', email: 'ethan.park@mockmail.dev', postsCount: 14, bio: 'Designs onboarding and growth flows for productivity apps.' },
  'Aisha Khan': { name: 'Aisha Khan', role: 'UX Researcher', email: 'aisha.khan@mockmail.dev', postsCount: 10, bio: 'Research-driven UX specialist focused on dashboards and analytics.' },
  'Sarah Johnson': { name: 'Sarah Johnson', role: 'Accessibility Advocate', email: 'sarah.johnson@mockmail.dev', postsCount: 19, bio: 'Helps teams ship inclusive interfaces and stronger UI copy.' }
};

const sampleAnalysis = {
  issues: [
    { id: 1, title: 'Low Color Contrast', description: 'Some text elements have insufficient contrast against their background.', principle: 'Visibility', severity: 'High' },
    { id: 2, title: 'Inconsistent Spacing', description: 'Spacing between elements varies, creating a less predictable layout.', principle: 'Consistency', severity: 'Medium' },
    { id: 3, title: 'Unclear Visual Hierarchy', description: 'Important elements do not stand out, making it hard for users to focus.', principle: 'Hierarchy', severity: 'High' },
    { id: 4, title: 'Missing Affordances', description: 'Some interactive elements do not look clickable or actionable.', principle: 'Learnability', severity: 'Medium' }
  ],
  suggestions: [
    { id: 1, text: 'Increase contrast between text and background to meet WCAG AA standards.', impact: 'High' },
    { id: 2, text: 'Use a consistent spacing scale (e.g., 8px grid) for margins and paddings.', impact: 'Medium' },
    { id: 3, text: 'Strengthen hierarchy using size, weight, color, and whitespace.', impact: 'High' },
    { id: 4, text: 'Add clear visual cues for interactive elements (hover/button styles).', impact: 'Medium' }
  ]
};


function makeExtraPosts(count = 10) {
  const topics = ['UX Design', 'Navigation', 'Accessibility', 'Forms', 'Dashboard', 'Onboarding'];
  return Array.from({ length: count }, (_, i) => ({
    id: 500 + i,
    title: `Extra community discussion ${i + 1}`,
    preview: 'Share ideas to improve interface clarity, consistency, and flow.',
    author: `Guest User ${i + 1}`,
    time: `${i + 3}h ago`,
    topic: topics[i % topics.length],
    imageUrl: '',
    commentsCount: (i % 7) + 1,
    likes: (i % 15) + 4,
    comments: []
  }));
}


const randomCommentPool = [
  'Great point—try simplifying the first step.',
  'I had a similar issue; clearer labels helped a lot.',
  'Consider improving contrast for key actions.',
  'This flow looks better with fewer form fields.',
  'Nice direction. Maybe add stronger visual hierarchy.'
];

function seedRandomComments() {
  db.posts.forEach((post) => {
    if (!Array.isArray(post.comments)) post.comments = [];
    if (post.comments.length === 0) {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i += 1) {
        db.lastCommentId += 1;
        post.comments.push({ id: db.lastCommentId, user: `User ${i + 1}`, text: randomCommentPool[(post.id + i) % randomCommentPool.length] });
      }
    }
    post.commentsCount = post.comments.length;
  });
}

seedRandomComments();

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 12 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8'
  }[ext] || 'text/plain; charset=utf-8';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;

  try {
    if (pathname === '/api/upload' && req.method === 'POST') {
      const { imageDataUrl } = await readBody(req);
      if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) return sendJson(res, 400, { error: 'Valid image is required.' });
      db.uploadedImage = imageDataUrl;
      return sendJson(res, 200, { success: true, imageUrl: db.uploadedImage });
    }

    if (pathname === '/api/upload/latest' && req.method === 'GET') return sendJson(res, 200, { imageUrl: db.uploadedImage });

    if (pathname === '/api/analysis/run' && req.method === 'POST') {
      if (!db.uploadedImage) return sendJson(res, 400, { error: 'Please upload a screenshot first.' });
      db.profile.stats.analysesRun += 1;
      return sendJson(res, 200, { ...sampleAnalysis, generatedAt: new Date().toISOString() });
    }

    if (pathname === '/api/posts' && req.method === 'GET') {
      const sort = searchParams.get('sort') || 'latest';
      const q = (searchParams.get('q') || '').toLowerCase();
      let posts = [...db.posts];
      if (q) posts = posts.filter((p) => [p.title, p.preview, p.author, p.topic].join(' ').toLowerCase().includes(q));
      if (posts.length < 30) posts = [...posts, ...makeExtraPosts(30 - posts.length)];
      posts = posts.map((p) => ({ ...p, commentsCount: Array.isArray(p.comments) ? p.comments.length : (p.commentsCount || 0) }));
      posts.sort((a, b) => (sort === 'top' ? b.likes - a.likes : b.id - a.id));
      return sendJson(res, 200, posts);
    }

    if (pathname === '/api/posts' && req.method === 'POST') {
      const { title, preview, author, topic, imageUrl } = await readBody(req);
      if (!title || !preview || !author || !topic) return sendJson(res, 400, { error: 'title, preview, author, topic are required.' });
      db.lastPostId += 1;
      const post = { id: db.lastPostId, title, preview, author, topic, imageUrl: imageUrl || '', time: 'Just now', commentsCount: 0, likes: 0, comments: [] };
      db.posts.push(post);
      db.profile.stats.discussions += 1;
      return sendJson(res, 201, post);
    }

    if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments') && req.method === 'POST') {
      const postId = Number(pathname.split('/')[3]);
      const post = db.posts.find((p) => p.id === postId);
      if (!post) return sendJson(res, 404, { error: 'Post not found.' });
      const { user, text } = await readBody(req);
      if (!user || !text) return sendJson(res, 400, { error: 'user and text are required.' });
      db.lastCommentId += 1;
      const comment = { id: db.lastCommentId, user, text };
      post.comments.push(comment);
      post.commentsCount += 1;
      return sendJson(res, 201, comment);
    }


    if (pathname.startsWith('/api/posts/') && pathname.endsWith('/like') && req.method === 'POST') {
      const postId = Number(pathname.split('/')[3]);
      const post = db.posts.find((p) => p.id === postId);
      if (!post) return sendJson(res, 404, { error: 'Post not found.' });
      const { liked } = await readBody(req);
      if (liked) post.likes += 1;
      else post.likes = Math.max(0, post.likes - 1);
      return sendJson(res, 200, { id: post.id, likes: post.likes });
    }

    if (pathname === '/api/profile' && req.method === 'GET') return sendJson(res, 200, db.profile);

    if (pathname === '/api/profile' && req.method === 'PUT') {
      const { fullName, email, bio } = await readBody(req);
      if (!fullName || !email) return sendJson(res, 400, { error: 'fullName and email are required.' });
      db.profile.fullName = fullName;
      db.profile.email = email;
      db.profile.bio = bio || '';
      return sendJson(res, 200, { success: true, profile: db.profile });
    }

    if (pathname === '/api/profile/password' && req.method === 'PUT') {
      const { newPassword, confirmPassword } = await readBody(req);
      if (!newPassword || !confirmPassword) return sendJson(res, 400, { error: 'Both fields are required.' });
      if (newPassword !== confirmPassword) return sendJson(res, 400, { error: 'Passwords do not match.' });
      if (newPassword.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
      db.password = newPassword;
      return sendJson(res, 200, { success: true, message: 'Password updated.' });
    }

    if (pathname === '/api/discussion/meta' && req.method === 'GET') {
      return sendJson(res, 200, {
        topContributors: [
          { name: 'Sarah Johnson', points: 128 },
          { name: 'Ethan Park', points: 112 },
          { name: 'Aisha Khan', points: 98 },
          { name: 'Liam Chen', points: 85 }
        ],
        popularTopics: ['Onboarding', 'Dashboard', 'Buttons', 'Navigation', 'Typography', 'Forms']
      });
    }



    if (pathname === '/api/analysis/chat' && req.method === 'POST') {
      const { question = '', analysis } = await readBody(req);
      const normalized = question.toLowerCase();
      const detectedTopic = topicKeys.find((topic) => normalized.includes(topic)) || (normalized.includes('contrast') ? 'low color contrast' : null) || topicKeys.find((topic) => topic.split(' ').some((k) => normalized.includes(k))) || 'redesign suggestions';
      const relevant = mockAiResponses.filter((r) => r.topic === detectedTopic);
      const pick = relevant[Math.floor(Math.random() * relevant.length)] || mockAiResponses[0];
      const issueTitles = (analysis?.issues || sampleAnalysis.issues).map((i) => i.title).slice(0, 2).join(', ');
      return sendJson(res, 200, { answer: `${pick.text} Based on this analysis, pay extra attention to: ${issueTitles}.` });
    }

    if (pathname === '/api/users/profile' && req.method === 'GET') {
      const name = searchParams.get('name') || '';
      return sendJson(res, 200, userDirectory[name] || { name, role: 'Community Member', email: `${name.toLowerCase().replace(/\s+/g, '.')}@mockmail.dev`, postsCount: 3, bio: 'Active community participant sharing UI/UX ideas.' });
    }

    if (pathname === '/api/users/message' && req.method === 'POST') {
      const { to = 'Community Member', text = '' } = await readBody(req);
      const responses = [
        `Thanks for the message. I agree we should prioritize clearer hierarchy first.`,
        `Great point. I'd start with contrast and labeling updates before layout refinements.`,
        `I like this direction. We can test that change quickly with a short usability session.`
      ];
      const reply = responses[text.length % responses.length];
      return sendJson(res, 200, { to, reply });
    }
    if (pathname === '/' || pathname === '/index.html') return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    if (pathname === '/styles.css') return serveFile(res, path.join(PUBLIC_DIR, 'styles.css'));
    if (pathname === '/app.js') return serveFile(res, path.join(PUBLIC_DIR, 'app.js'));

    return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
  } catch (err) {
    return sendJson(res, 400, { error: err.message || 'Request failed' });
  }
});

server.listen(PORT, () => {
  console.log(`UI Insight running at http://localhost:${PORT}`);
});
