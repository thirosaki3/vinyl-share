/**
 * Vinyl Share フロントエンド
 *
 * API_BASE_URL を実際のWorker URLに変更してください
 * 例: 'https://vinyl-share-api.yourname.workers.dev'
 */
const API_BASE_URL = "https://vinyl-share-api.pichichi.workers.dev";

// ─── 初期化 ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadRecords);

// ─── レコード一覧読み込み ─────────────────────────────────────────
async function loadRecords() {
  showState('loading');
  try {
    const res = await fetch(`${API_BASE_URL}/api/records`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const records = data.records || [];

    if (records.length === 0) {
      showState('empty');
      return;
    }

    showState('grid');
    document.getElementById('record-count').textContent =
      `${records.length} 枚のレコード`;
    document.getElementById('stats').style.display = 'block';
    renderGrid(records);
  } catch (e) {
    console.error(e);
    showState('error');
  }
}

// ─── グリッドレンダリング ──────────────────────────────────────────
function renderGrid(records) {
  const grid = document.getElementById('records-grid');
  grid.innerHTML = '';
  records.forEach((rec, i) => {
    const card = createCard(rec, i);
    grid.appendChild(card);
  });
}

function createCard(rec, index) {
  const card = document.createElement('div');
  card.className = 'record-card';
  card.addEventListener('click', () => openModal(rec.id));

  // 表ジャケット画像（またはプレースホルダー）
  const imageHtml = rec.frontImage
    ? `<img src="${API_BASE_URL}${rec.frontImage}" alt="${rec.album} 表" loading="lazy">
       <span class="side-badge">表</span>`
    : `<div class="no-image">🎵</div>`;

  card.innerHTML = `
    <div class="card-image-wrap">${imageHtml}</div>
    <div class="card-info">
      <div class="card-artist">${escHtml(rec.artist || '不明')}</div>
      <div class="card-album">${escHtml(rec.album || '（タイトル未設定）')}</div>
      <div class="card-id">#${String(index + 1).padStart(3, '0')}</div>
    </div>
  `;
  return card;
}

// ─── 詳細モーダル ──────────────────────────────────────────────────
async function openModal(id) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`${API_BASE_URL}/api/records/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rec = await res.json();
    renderModal(rec);
  } catch (e) {
    content.innerHTML = '<p style="color:#ff7f7f;padding:2rem">読み込みエラー</p>';
  }
}

function renderModal(rec) {
  const content = document.getElementById('modal-content');

  const frontHtml = rec.frontImage
    ? `<img src="${API_BASE_URL}${rec.frontImage}" alt="表ジャケット" onclick="openImage('${API_BASE_URL}${rec.frontImage}')">`
    : `<div class="no-image" style="height:200px">🎵</div>`;

  const backHtml = rec.backImage
    ? `<img src="${API_BASE_URL}${rec.backImage}" alt="裏ジャケット" onclick="openImage('${API_BASE_URL}${rec.backImage}')">`
    : `<div class="no-image" style="height:200px">🎵</div>`;

  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-artist">${escHtml(rec.artist || '不明アーティスト')}</div>
      <div class="modal-album">${escHtml(rec.album || '（タイトル未設定）')}</div>
    </div>
    <div class="modal-images">
      <div class="modal-img-wrap">
        ${frontHtml}
        <span class="modal-img-label">表（Front）</span>
      </div>
      <div class="modal-img-wrap">
        ${backHtml}
        <span class="modal-img-label">裏（Back）</span>
      </div>
    </div>
  `;
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── 画像フルスクリーン表示 ────────────────────────────────────────
function openImage(url) {
  window.open(url, '_blank');
}

// ─── 状態切り替え ──────────────────────────────────────────────────
function showState(state) {
  document.getElementById('loading').style.display = state === 'loading' ? 'block' : 'none';
  document.getElementById('error').style.display   = state === 'error'   ? 'block' : 'none';
  document.getElementById('empty').style.display   = state === 'empty'   ? 'block' : 'none';
  document.getElementById('records-grid').style.display = state === 'grid' ? 'grid' : 'none';
}

// ─── ユーティリティ ────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
