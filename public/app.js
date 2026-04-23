const state = {
  uploadedImageUrl: null,
  currentSort: 'latest',
  currentSearch: ''
};

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];

function switchTab(tab) {
  qsa('.tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  qsa('.page').forEach((page) => page.classList.toggle('active', page.id === tab));
  if (tab === 'discussion') loadPosts();
  if (tab === 'profile') loadProfile();
}

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function uploadFile(file) {
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const data = await api('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl })
  });

  state.uploadedImageUrl = data.imageUrl;
  renderPreview(data.imageUrl);
}

function renderPreview(url) {
  const img = qs('#previewImage');
  const placeholder = qs('#previewPlaceholder');
  if (!url) {
    img.style.display = 'none';
    placeholder.style.display = 'block';
    return;
  }
  img.src = url;
  img.style.display = 'block';
  placeholder.style.display = 'none';
}

function createIssueCard(issue) {
  return `
    <article class="card item-card">
      <div class="icon-box danger">⚠</div>
      <div>
        <div class="row-between"><h3>${issue.title}</h3><span class="chip danger">${issue.principle}</span></div>
        <p class="muted">${issue.description}</p>
      </div>
    </article>`;
}

function createSuggestionCard(suggestion) {
  return `
    <article class="card item-card">
      <div class="icon-box success">✓</div>
      <div>
        <h3>${suggestion.text}</h3>
        <span class="chip success">Impact: ${suggestion.impact}</span>
      </div>
    </article>`;
}

async function runAnalysis() {
  const data = await api('/api/analysis/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: state.uploadedImageUrl })
  });

  qs('#issuesList').innerHTML = data.issues.map(createIssueCard).join('');
  qs('#suggestionsList').innerHTML = data.suggestions.map(createSuggestionCard).join('');
  qs('#issueCount').textContent = `${data.issues.length} Issues Found`;
  qs('#suggestionCount').textContent = `${data.suggestions.length} Suggestions`;
  switchTab('results');
}

function postCard(post) {
  const comments = post.comments?.map((c) => `<div class="muted small">${c.user}: ${c.text}</div>`).join('') || '';
  return `
    <article class="card post-card">
      <h3>${post.title}</h3>
      <p class="muted">${post.preview}</p>
      <div class="post-meta"><strong>${post.author}</strong> • ${post.time} <span class="chip">${post.topic}</span></div>
      <div class="post-actions">💬 ${post.commentsCount} 👍 ${post.likes}</div>
      <div class="stack" style="margin-top:10px">${comments}</div>
      <form class="comment-form" data-id="${post.id}" style="margin-top:12px;display:flex;gap:8px;">
        <input name="user" placeholder="Your name" required />
        <input name="text" placeholder="Add a comment..." required style="flex:1" />
        <button class="btn secondary" type="submit">Reply</button>
      </form>
    </article>`;
}

async function loadPosts() {
  const posts = await api(`/api/posts?sort=${state.currentSort}&q=${encodeURIComponent(state.currentSearch)}`);
  qs('#postFeed').innerHTML = posts.map(postCard).join('');
  qsa('.comment-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const postId = form.dataset.id;
      const formData = new FormData(form);
      await api(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      loadPosts();
    });
  });
}

async function loadMeta() {
  const data = await api('/api/discussion/meta');
  qs('#contributors').innerHTML = data.topContributors.map((u) => `<p>${u.name} — ${u.points} points</p>`).join('');
  qs('#topics').innerHTML = data.popularTopics.map((t) => `<span class="chip">${t}</span>`).join('');
}

async function loadProfile() {
  const profile = await api('/api/profile');
  qs('#profileSummary').innerHTML = `
    <div class="row-between">
      <div>
        <h2>${profile.fullName}</h2>
        <p class="muted">${profile.email}</p>
        <span class="chip">${profile.role}</span>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div class="muted small">Analyses Run</div><strong>${profile.stats.analysesRun}</strong></div>
      <div class="stat"><div class="muted small">Discussions</div><strong>${profile.stats.discussions}</strong></div>
      <div class="stat"><div class="muted small">Helpful Votes</div><strong>${profile.stats.helpfulVotes}</strong></div>
      <div class="stat"><div class="muted small">Member Since</div><strong>${profile.stats.memberSince}</strong></div>
    </div>`;

  const form = qs('#profileForm');
  form.fullName.value = profile.fullName;
  form.email.value = profile.email;
  form.bio.value = profile.bio;
}

async function init() {
  qsa('.tab').forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const avatarBtn = qs('#avatarBtn');
  const avatarMenu = qs('#avatarMenu');
  avatarBtn.addEventListener('click', () => avatarMenu.classList.toggle('hidden'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.avatar-wrap')) avatarMenu.classList.add('hidden');
  });

  const fileInput = qs('#fileInput');
  const dropZone = qs('#dropZone');
  const changeFileBtn = qs('#changeFileBtn');

  dropZone.addEventListener('dragover', (e) => e.preventDefault());
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file).catch((err) => alert(err.message));
  });
  dropZone.addEventListener('click', () => fileInput.click());
  changeFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) await uploadFile(file).catch((err) => alert(err.message));
  });

  qs('#runAnalysisBtn').addEventListener('click', () => runAnalysis().catch((err) => alert(err.message)));

  qsa('.filter').forEach((btn) => btn.addEventListener('click', () => {
    qsa('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentSort = btn.dataset.sort;
    loadPosts();
  }));

  qs('#searchInput').addEventListener('input', (e) => {
    state.currentSearch = e.target.value;
    loadPosts();
  });

  const dialog = qs('#postDialog');
  qs('#createPostBtn').addEventListener('click', () => dialog.showModal());
  qs('#cancelPostBtn').addEventListener('click', () => dialog.close());
  qs('#createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await api('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    }).catch((err) => alert(err.message));
    dialog.close();
    e.target.reset();
    loadPosts();
  });

  qs('#profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await api('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    }).then(() => alert('Profile updated')).catch((err) => alert(err.message));
    loadProfile();
  });

  qs('#passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await api('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    }).then(() => {
      alert('Password updated');
      e.target.reset();
    }).catch((err) => alert(err.message));
  });

  const latestUpload = await api('/api/upload/latest');
  if (latestUpload.imageUrl) {
    state.uploadedImageUrl = latestUpload.imageUrl;
    renderPreview(latestUpload.imageUrl);
  }

  await Promise.all([loadMeta(), loadPosts(), loadProfile()]);
}

init().catch((err) => {
  console.error(err);
  alert(err.message);
});
