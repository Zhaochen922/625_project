const state = {
  uploadedImageUrl: null,
  currentSort: 'latest',
  currentSearch: '',
  currentAnalysis: null,
  selectedProfile: null,
  messageThread: [],
  localPosts: [],
  likedPosts: JSON.parse(localStorage.getItem('likedPosts') || '{}')
};

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];

function switchTab(tab) {
  qsa('.tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  qsa('.page').forEach((page) => page.classList.toggle('active', page.id === tab));
  if (tab === 'discussion') {
    state.currentSearch = '';
    const search = qs('#searchInput');
    if (search) search.value = '';
    loadPosts();
  }
  if (tab === 'profile') loadProfile();
}

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const raw = await res.text();
  let json;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`API returned non-JSON response for ${url}`);
  }
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}


function localProfile(name) {
  return { name, role: 'Community Member', email: `${(name || 'user').toLowerCase().replace(/\s+/g, '.')}@mockmail.dev`, postsCount: 1, bio: 'Active in UI/UX discussions.' };
}

function localChatAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('low color contrast') || q.includes('contrast')) return 'Low color contrast reduces readability and accessibility. Increase text/background contrast, verify WCAG AA ratios, and prioritize CTA and body text first.';
  return 'Based on your analysis, prioritize the highest-severity issues first, then test improvements with quick usability checks.';
}

async function uploadFile(file) {
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const data = await api('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageDataUrl }) });
  state.uploadedImageUrl = data.imageUrl;
  renderPreview(data.imageUrl);
}

function renderPreview(url) { const img = qs('#previewImage'); const placeholder = qs('#previewPlaceholder'); if (!url) { img.style.display = 'none'; placeholder.style.display = 'block'; return; } img.src = url; img.style.display = 'block'; placeholder.style.display = 'none'; }
function createIssueCard(issue) { return `<article class="card item-card"><div class="icon-box danger">⚠</div><div><div class="row-between"><h3>${issue.title}</h3><span class="chip danger">${issue.principle}</span></div><p class="muted">${issue.description}</p></div></article>`; }
function createSuggestionCard(suggestion) { return `<article class="card item-card"><div class="icon-box success">✓</div><div><h3>${suggestion.text}</h3><span class="chip success">Impact: ${suggestion.impact}</span></div></article>`; }

function setResultCounts(data) {
  const issueCount = data?.issues?.length ?? qs('#issuesList').children.length;
  const suggestionCount = data?.suggestions?.length ?? qs('#suggestionsList').children.length;
  qs('#issueCount').textContent = `${issueCount} Issues Found`;
  qs('#suggestionCount').textContent = `${suggestionCount} Suggestions`;
}

function appendChatBubble(container, text, role) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function runAnalysis() {
  const data = await api('/api/analysis/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: state.uploadedImageUrl }) });
  state.currentAnalysis = data;
  qs('#issuesList').innerHTML = data.issues.map(createIssueCard).join('');
  qs('#suggestionsList').innerHTML = data.suggestions.map(createSuggestionCard).join('');
  setResultCounts(data);
  const chatBox = qs('#analysisChatMessages');
  chatBox.innerHTML = '';
  appendChatBubble(chatBox, 'Analysis complete. Ask me follow-up UX questions about these results.', 'ai');
  switchTab('results');
}


function postCard(post) {
  const comments = post.comments?.map((c) => `<div class="muted small">${c.user}: ${c.text}</div>`).join('') || '';
  const safeImage = post.imageUrl || '';
  const postImage = safeImage ? `<div class="post-image-wrap"><img src="${safeImage}" alt="Post upload" class="post-thumb" data-image-preview="${safeImage}" /></div>` : '';
  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0);
  const liked = !!state.likedPosts[post.id];
  return `<article class="card post-card"><h3>${post.title}</h3>${postImage}<p class="muted">${post.preview}</p><div class="post-meta"><strong class="author-link" data-author="${post.author}">${post.author}</strong> • ${post.time} <span class="chip">${post.topic}</span></div><div class="post-actions">💬 ${commentCount} <button type="button" class="like-btn ${liked ? 'liked' : ''}" data-id="${post.id}">👍 <span>${post.likes}</span></button></div><div class="stack" style="margin-top:10px">${comments}</div><form class="comment-form" data-id="${post.id}" style="margin-top:12px;display:flex;gap:8px;"><input name="user" placeholder="Your name" required /><input name="text" placeholder="Add a comment..." required style="flex:1" /><button class="btn secondary" type="submit">Reply</button></form></article>`;
}

async function loadPosts() {
  let posts = [];
  try {
    posts = await api(`/api/posts?sort=${state.currentSort}&q=${encodeURIComponent(state.currentSearch)}`);
  } catch (err) {
    console.error(err);
  }
  if (!Array.isArray(posts)) posts = [];
  const mergedPosts = [...state.localPosts, ...posts.filter((p) => !state.localPosts.some((lp) => lp.id === p.id))];
  qs('#postFeed').innerHTML = mergedPosts.map(postCard).join('');
  qsa('.comment-form').forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = Number(form.dataset.id);
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.user || !payload.text) return;
    try {
      await api(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      form.reset();
      await loadPosts();
    } catch (err) {
      const localPost = state.localPosts.find((p) => p.id === postId);
      if (localPost) {
        if (!Array.isArray(localPost.comments)) localPost.comments = [];
        localPost.comments.push({ id: Date.now(), user: payload.user, text: payload.text });
        localPost.commentsCount = localPost.comments.length;
        form.reset();
        await loadPosts();
      } else {
        alert(err.message);
      }
    }
  }));
  qsa('[data-image-preview]').forEach((img) => img.addEventListener('click', () => { qs('#imagePreviewLarge').src = img.dataset.imagePreview; qs('#imagePreviewDialog').showModal(); }));

  qsa('.like-btn').forEach((btn) => btn.addEventListener('click', async () => {
    const postId = Number(btn.dataset.id);
    const nextLiked = !state.likedPosts[postId];
    try {
      const data = await api(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nextLiked })
      });
      state.likedPosts[postId] = nextLiked;
      localStorage.setItem('likedPosts', JSON.stringify(state.likedPosts));
      btn.classList.toggle('liked', nextLiked);
      const countEl = btn.querySelector('span');
      if (countEl) countEl.textContent = data.likes;
    } catch (err) {
      alert(err.message);
    }
  }));

  qsa('.author-link').forEach((el) => el.addEventListener('click', async () => {
    let profile;
    try {
      profile = await api(`/api/users/profile?name=${encodeURIComponent(el.dataset.author || '')}`);
    } catch {
      profile = localProfile(el.dataset.author || 'Community Member');
    }
    state.selectedProfile = profile;
    qs('#userProfileBody').innerHTML = `<p><strong>Name:</strong> ${profile.name}</p><p><strong>Role:</strong> ${profile.role}</p><p><strong>Email:</strong> ${profile.email}</p><p><strong>Posts:</strong> ${profile.postsCount}</p><p><strong>Bio:</strong> ${profile.bio}</p>`;
    qs('#userProfileDialog').showModal();
  }));
}

async function loadMeta() { const data = await api('/api/discussion/meta'); qs('#contributors').innerHTML = data.topContributors.map((u) => `<p>${u.name} — ${u.points} points</p>`).join(''); qs('#topics').innerHTML = data.popularTopics.map((t) => `<span class="chip">${t}</span>`).join(''); }
async function loadProfile() { const profile = await api('/api/profile'); qs('#profileSummary').innerHTML = `<div class="row-between"><div><h2>${profile.fullName}</h2><p class="muted">${profile.email}</p><span class="chip">${profile.role}</span></div></div><div class="stat-grid"><div class="stat"><div class="muted small">Analyses Run</div><strong>${profile.stats.analysesRun}</strong></div><div class="stat"><div class="muted small">Discussions</div><strong>${profile.stats.discussions}</strong></div><div class="stat"><div class="muted small">Helpful Votes</div><strong>${profile.stats.helpfulVotes}</strong></div><div class="stat"><div class="muted small">Member Since</div><strong>${profile.stats.memberSince}</strong></div></div>`; const form = qs('#profileForm'); form.fullName.value = profile.fullName; form.email.value = profile.email; form.bio.value = profile.bio; }

async function init() {
  qsa('.tab').forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  const avatarBtn = qs('#avatarBtn'); const avatarMenu = qs('#avatarMenu'); avatarBtn.addEventListener('click', () => avatarMenu.classList.toggle('hidden')); document.addEventListener('click', (e) => { if (!e.target.closest('.avatar-wrap')) avatarMenu.classList.add('hidden'); });
  const fileInput = qs('#fileInput'); const dropZone = qs('#dropZone'); const changeFileBtn = qs('#changeFileBtn');
  dropZone.addEventListener('dragover', (e) => e.preventDefault()); dropZone.addEventListener('drop', async (e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) await uploadFile(file).catch((err) => alert(err.message)); }); dropZone.addEventListener('click', () => fileInput.click()); changeFileBtn.addEventListener('click', () => fileInput.click()); fileInput.addEventListener('change', async (e) => { const file = e.target.files[0]; if (file) await uploadFile(file).catch((err) => alert(err.message)); });
  qs('#runAnalysisBtn').addEventListener('click', () => runAnalysis().catch((err) => alert(err.message)));
  qsa('.filter').forEach((btn) => btn.addEventListener('click', () => { qsa('.filter').forEach((b) => b.classList.remove('active')); btn.classList.add('active'); state.currentSort = btn.dataset.sort; loadPosts(); }));
  qs('#searchInput').addEventListener('input', (e) => { state.currentSearch = e.target.value; loadPosts(); });

  qs('#analysisChatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = qs('#analysisChatInput');
    const question = input.value.trim();
    if (!question) return;
    appendChatBubble(qs('#analysisChatMessages'), question, 'user');
    input.value = '';
    try {
      const chat = await api('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, analysis: state.currentAnalysis || {} })
      });
      appendChatBubble(qs('#analysisChatMessages'), chat.answer || 'Here is a follow-up recommendation based on your analysis results.', 'ai');
    } catch (err) {
      appendChatBubble(qs('#analysisChatMessages'), localChatAnswer(question), 'ai');
    }
  });

  const dialog = qs('#postDialog');
  qs('#createPostBtn').addEventListener('click', () => dialog.showModal()); qs('#cancelPostBtn').addEventListener('click', () => dialog.close());
  qs('#createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault(); const formData = new FormData(e.target); const imageFile = formData.get('postImage');
    let imageUrl = '';
    const fileFromInput = qs('#postImageInput')?.files?.[0];
    const selectedImage = (imageFile && imageFile.size) ? imageFile : fileFromInput;
    if (selectedImage && selectedImage.size) {
      imageUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(selectedImage); });
    }
    try {
      const created = await api('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formData.get('title'), preview: formData.get('preview'), author: formData.get('author'), topic: formData.get('topic'), imageUrl }) });
      state.localPosts = [{ ...created, imageUrl: created.imageUrl || imageUrl }, ...state.localPosts.filter((p) => p.id !== created.id)];
      dialog.close();
      e.target.reset();
      await loadPosts();
    } catch (err) {
      alert(err.message);
    }
  });

  qs('#closeImagePreview').addEventListener('click', () => qs('#imagePreviewDialog').close());
  qs('#closeProfileDialog').addEventListener('click', () => qs('#userProfileDialog').close());
  qs('#closeMessageDialog').addEventListener('click', () => qs('#messageDialog').close());
  qs('#messageUserBtn').addEventListener('click', () => { qs('#userProfileDialog').close(); state.messageThread = []; qs('#messageThread').innerHTML = ''; qs('#messageDialog').showModal(); });
  qs('#messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = qs('#messageInput'); const text = input.value.trim(); if (!text) return; input.value = '';
    appendChatBubble(qs('#messageThread'), text, 'user');
    const response = await api('/api/users/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: state.selectedProfile?.name, text }) });
    appendChatBubble(qs('#messageThread'), response.reply, 'ai');
  });

  qs('#profileForm').addEventListener('submit', async (e) => { e.preventDefault(); const formData = new FormData(e.target); await api('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) }).then(() => alert('Profile updated')).catch((err) => alert(err.message)); loadProfile(); });
  qs('#passwordForm').addEventListener('submit', async (e) => { e.preventDefault(); const formData = new FormData(e.target); await api('/api/profile/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) }).then(() => { alert('Password updated'); e.target.reset(); }).catch((err) => alert(err.message)); });

  const latestUpload = await api('/api/upload/latest'); if (latestUpload.imageUrl) { state.uploadedImageUrl = latestUpload.imageUrl; renderPreview(latestUpload.imageUrl); }
  await Promise.all([loadMeta(), loadPosts(), loadProfile()]);
}

init().catch((err) => { console.error(err); alert(err.message); });
