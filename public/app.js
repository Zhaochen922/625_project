const state = { uploadedImageUrl: null, currentSort: 'latest', currentSearch: '', selectedUser: null };
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

const api = async (url, options = {}) => { const r = await fetch(url, options); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Request failed'); return j; };
const toDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

function switchTab(tab) { qsa('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab)); qsa('.page').forEach((p) => p.classList.toggle('active', p.id === tab)); if (tab === 'discussion') loadPosts(); }
function renderPreview(url) { const img = qs('#previewImage'); const ph = qs('#previewPlaceholder'); if (!url) { img.style.display = 'none'; ph.style.display = 'block'; return; } img.src = url; img.style.display = 'block'; ph.style.display = 'none'; }
async function uploadFile(file) { const imageDataUrl = await toDataUrl(file); const data = await api('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageDataUrl }) }); state.uploadedImageUrl = data.imageUrl; renderPreview(data.imageUrl); }

function postCard(post) {
  const comments = (post.comments || []).map((c) => `<div class="muted small">${c.user}: ${c.text}</div>`).join('');
  const thumb = post.imageUrl ? `<img class="post-thumb" src="${post.imageUrl}" data-full="${post.imageUrl}" alt="post">` : '';
  return `<article class="card post-card"><h3>${post.title}</h3><p class="muted">${post.preview}</p>${thumb}<div class="post-meta"><button class="author-link" data-user="${post.author}">${post.author}</button> • ${post.time} <span class="chip">${post.topic}</span></div><div class="post-actions">💬 ${post.commentsCount} 👍 ${post.likes}</div><div class="stack" style="margin-top:10px">${comments}</div><form class="comment-form" data-id="${post.id}" style="margin-top:12px;display:flex;gap:8px;"><input name="user" placeholder="Your name" required /><input name="text" placeholder="Add a comment..." required style="flex:1" /><button class="btn secondary" type="submit">Reply</button></form></article>`;
}

async function loadPosts() {
  const posts = await api(`/api/posts?sort=${state.currentSort}&q=${encodeURIComponent(state.currentSearch)}`);
  qs('#postFeed').innerHTML = posts.map(postCard).join('');
  qsa('.comment-form').forEach((f) => f.addEventListener('submit', async (e) => { e.preventDefault(); await api(`/api/posts/${f.dataset.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(f).entries())) }); loadPosts(); }));
  qsa('.post-thumb').forEach((img) => img.addEventListener('click', () => { qs('#largePreviewImage').src = img.dataset.full; qs('#imagePreviewDialog').showModal(); }));
  qsa('.author-link').forEach((btn) => btn.addEventListener('click', () => openUserProfile(btn.dataset.user)));
}

async function openUserProfile(name) {
  const profile = await api(`/api/user/profile?name=${encodeURIComponent(name)}`);
  state.selectedUser = name;
  qs('#userProfileContent').innerHTML = `<h3>${profile.fullName}</h3><p class="muted">${profile.role}</p><p>${profile.bio}</p><p class="muted small">${profile.email}</p>`;
  qs('#messageStatus').textContent = '';
  qs('#userProfileDialog').showModal();
}

async function runAnalysis() { const data = await api('/api/analysis/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: state.uploadedImageUrl }) }); qs('#issuesList').innerHTML = data.issues.map((i) => `<article class="card item-card"><div class="icon-box danger">⚠</div><div><h3>${i.title}</h3><p class="muted">${i.description}</p></div></article>`).join(''); qs('#suggestionsList').innerHTML = data.suggestions.map((s) => `<article class="card item-card"><div class="icon-box success">✓</div><div><h3>${s.text}</h3></div></article>`).join(''); switchTab('results'); }

async function init() {
  qsa('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  qs('#dropZone').addEventListener('click', () => qs('#fileInput').click());
  qs('#changeFileBtn').addEventListener('click', () => qs('#fileInput').click());
  qs('#fileInput').addEventListener('change', async (e) => e.target.files[0] && uploadFile(e.target.files[0]));
  qs('#runAnalysisBtn').addEventListener('click', () => runAnalysis().catch((e) => alert(e.message)));

  qsa('.filter').forEach((b) => b.addEventListener('click', () => { qsa('.filter').forEach((x) => x.classList.remove('active')); b.classList.add('active'); state.currentSort = b.dataset.sort; loadPosts(); }));
  qs('#searchInput').addEventListener('input', (e) => { state.currentSearch = e.target.value; loadPosts(); });

  qs('#createPostBtn').addEventListener('click', () => qs('#postDialog').showModal());
  qs('#cancelPostBtn').addEventListener('click', () => qs('#postDialog').close());
  qs('#createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
    const imageFile = qs('#postImageInput').files[0]; if (imageFile) body.imageDataUrl = await toDataUrl(imageFile);
    await api('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    e.target.reset(); qs('#postDialog').close(); loadPosts();
  });

  qs('#closeImagePreview').addEventListener('click', () => qs('#imagePreviewDialog').close());
  qs('#closeUserProfile').addEventListener('click', () => qs('#userProfileDialog').close());
  qs('#messageForm').addEventListener('submit', async (e) => { e.preventDefault(); const message = new FormData(e.target).get('message'); const r = await api('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: state.selectedUser, message }) }); qs('#messageStatus').textContent = r.autoReply; e.target.reset(); });

  qs('#resultChatForm').addEventListener('submit', async (e) => { e.preventDefault(); const message = new FormData(e.target).get('message'); const log = qs('#resultChatLog'); log.innerHTML += `<div><strong>You:</strong> ${message}</div>`; const r = await api('/api/analysis/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) }); log.innerHTML += `<div><strong>AI:</strong> ${r.reply}</div>`; e.target.reset(); log.scrollTop = log.scrollHeight; });

  const latest = await api('/api/upload/latest'); if (latest.imageUrl) renderPreview(latest.imageUrl);
  const meta = await api('/api/discussion/meta'); qs('#contributors').innerHTML = meta.topContributors.map((u) => `<p>${u.name} — ${u.points} points</p>`).join(''); qs('#topics').innerHTML = meta.popularTopics.map((t) => `<span class="chip">${t}</span>`).join('');
  loadPosts();
}

init().catch((e) => alert(e.message));
