/* ============================================================
   再观 Zaiguan — 应用主逻辑(Rijksstudio 式重构)
   信息架构:收藏集(Collections) · 全部作品 · 裁剪细节 · 个人经验
   ============================================================ */

const STORE_KEY = "zaiguan.v2";
const REPO_URL = "https://github.com/KINGKAZMAX/zaiguan";

let S = loadState();
const ui = { tab: "records", archive: { cat: "全部", tag: "", q: "", fav: false } };
let editTmp = null; // 展品卡编辑上下文(标签/评分/裁剪)

/* ---------------- 状态与持久化 ---------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Array.isArray(s.books)) { normalize(s); return s; }
    }
  } catch (e) {}
  const seeded = { books: seedBooks(), v: 2 };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(seeded)); } catch (e) {}
  return seeded;
}
function normalize(s) {
  for (const b of s.books || []) {
    if (!Array.isArray(b.items)) b.items = [];
    for (const it of b.items) {
      it.crops = Array.isArray(it.crops) ? it.crops : [];
      it.experience = it.experience || {};
      it.experience.favorite = !!it.experience.favorite;
    }
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); return true; }
  catch (e) { toast("⚠️ 浏览器本地存储已满,请导出数据或删减照片"); return false; }
}
function allItems() {
  const arr = [];
  for (const b of S.books) for (const it of b.items) arr.push({ book: b, item: it });
  return arr;
}
function findBook(id) { return S.books.find(b => b.id === id); }

/* ---------------- 渲染骨架 ---------------- */
const view = document.getElementById("view");
function render(scrollTop) {
  const pages = { records: pageRecords, archive: pageArchive, insights: pageInsights, settings: pageSettings };
  view.innerHTML = pages[ui.tab]();
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === ui.tab));
  if (scrollTop !== false) view.scrollTop = 0;
}

/* ================= 收藏集(Collections)================= */
function pageRecords() {
  const books = [...S.books].sort((a, b) => (b.visitDate || "").localeCompare(a.visitDate || ""));
  const items = allItems();
  const feelings = items.reduce((n, x) => n + (x.item.experience.feeling || "").length, 0);
  const favs = items.filter(x => x.item.experience.favorite).length;

  let html = `<div class="page">
    <header class="masthead">
      <h1>再观</h1>
      <p class="tagline">让观看发生第二次 — 观展后个人文化记忆系统</p>
      <div class="mast-stats">
        <span><b>${books.length}</b> 收藏集</span><i>·</i>
        <span><b>${items.length}</b> 件作品</span><i>·</i>
        <span><b>${favs}</b> 最爱</span><i>·</i>
        <span><b>${feelings}</b> 字感受</span>
      </div>
    </header>`;

  if (!books.length) {
    html += `<div class="empty">
      <div class="empty-mark">观</div>
      <h3>从一次观展开始</h3>
      <p>观展结束后,从相册选取本次拍摄的照片,<br>整理你的第一册收藏集。</p>
      <button class="btn btn-primary btn-block" style="margin-top:18px" onclick="App.openCreate()">新建收藏集</button>
    </div>`;
  } else {
    html += `<div class="label-row"><span class="sec-label">收藏集</span><span class="sec-count">${books.length} Sets</span></div>
    <div class="col-grid">`;
    for (const b of books) {
      const first = b.items[0];
      const favCount = b.items.filter(i => i.experience.favorite).length;
      const cover = first
        ? (first.photo ? `<img src="${first.photo}" alt="">` : posterHTML(first.knowledge.name || "未识别", first.knowledge.category))
        : `<div class="cover-blank">空</div>`;
      html += `<article class="set-card" onclick="App.openBook('${b.id}')">
        <div class="set-cover">${cover}
          <span class="set-count">${b.items.length}</span>
          ${favCount ? `<span class="set-fav">♥ ${favCount}</span>` : ""}
        </div>
        <h3>${esc(b.exhibition)}</h3>
        <p>${esc(b.venue)}</p>
        <time>${fmtDate(b.visitDate)}</time>
      </article>`;
    }
    html += `<button class="set-card set-new" onclick="App.openCreate()">
      <div class="set-cover"><span class="plus">＋</span></div>
      <h3 style="color:var(--ink-3)">新建收藏集</h3>
      <p>&nbsp;</p><time>&nbsp;</time>
    </button></div>`;
  }
  html += `
    <div class="privacy-note">照片与记录仅保存在你的浏览器本地,不会上传到任何服务器。</div>
    <div class="footer-cred">再观 ZAIGUAN — Collections of Seeing Again</div>
  </div>`;
  return html;
}

/* ================= 全部作品(Artworks)================= */
function pageArchive() {
  const F = ui.archive;
  let items = allItems();
  const tags = [...new Set(items.flatMap(x => x.item.experience.tags || []))].slice(0, 12);

  if (F.cat !== "全部") items = items.filter(x => (x.item.knowledge.category || "其他") === F.cat);
  if (F.tag) items = items.filter(x => (x.item.experience.tags || []).includes(F.tag));
  if (F.fav) items = items.filter(x => x.item.experience.favorite);
  if (F.q) {
    const q = F.q.toLowerCase();
    items = items.filter(x =>
      [x.item.knowledge.name, x.item.knowledge.artist, x.item.knowledge.era,
       x.book.venue, x.book.exhibition, x.item.experience.feeling]
      .join(" ").toLowerCase().includes(q));
  }
  items.sort((a, b) => (b.book.visitDate || "").localeCompare(a.book.visitDate || ""));

  const catChips = ["全部", ...CATEGORIES].map(c =>
    `<button class="fchip ${!F.fav && F.cat === c ? "on" : ""}" onclick="App.setFilter('cat','${c}')">${c}</button>`).join("");
  const favChip = `<button class="fchip fav ${F.fav ? "on" : ""}" onclick="App.toggleFavFilter()">♥ 最爱</button>`;
  const tagChips = (F.tag || tags.length) ? `<div class="filter-scroll">
    ${F.tag ? `<button class="fchip on" onclick="App.setFilter('tag','')">${esc(F.tag)} ✕</button>` : ""}
    ${tags.filter(t => t !== F.tag).slice(0, 10).map(t => `<button class="fchip" onclick="App.setFilter('tag','${esc(t)}')">#${esc(t)}</button>`).join("")}
  </div>` : "";

  const cards = items.map(({ book, item }) => {
    const name = item.knowledge.name || "未识别展品";
    const fav = item.experience.favorite;
    const img = item.photo
      ? `<img src="${item.photo}" alt="${esc(name)}" loading="lazy">`
      : posterHTML(name, item.knowledge.category);
    return `<figure class="m-card" onclick="App.openItem('${book.id}','${item.id}')">
      <div class="m-img">${img}
        <button class="heart ${fav ? "on" : ""}" onclick="event.stopPropagation();App.toggleFav('${book.id}','${item.id}')" aria-label="最爱">♥</button>
      </div>
      <figcaption>
        <b>${esc(name)}</b>
        <span>${esc(item.knowledge.artist || "")}${item.knowledge.era ? " · " + esc(item.knowledge.era) : ""}</span>
        <em>${esc(book.venue)}</em>
        <i class="st st-${item.status}">${STATUS[item.status].label}${item.crops.length ? " · " + item.crops.length + " 细节" : ""}</i>
      </figcaption>
    </figure>`;
  }).join("");

  return `<div class="page">
    <header class="masthead slim">
      <h1>全部作品</h1>
      <p class="tagline">跨越展览的个人收藏 · ${allItems().length} 件</p>
    </header>
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input placeholder="搜索作品、艺术家、展览、感受…" value="${esc(F.q)}" oninput="App.setFilter('q', this.value)">
    </div>
    <div class="filter-scroll">${favChip}${catChips}</div>
    ${tagChips}
    ${items.length ? `<div class="masonry">${cards}</div>` : `<div class="empty" style="padding-top:40px">
      <h3>没有匹配的作品</h3><p>换个筛选条件,或先去「收藏集」新建一册。</p></div>`}
    <div class="footer-cred">Every visit, a growing collection</div>
  </div>`;
}

/* ================= 兴趣线索 ================= */
function computeInsights() {
  const items = allItems();
  const tagCount = {}, tagBooks = {}, catCount = {}, eraCount = {}, artistCount = {};
  let feelingChars = 0, rated = [], pubCount = 0, cropCount = 0;
  for (const { book, item } of items) {
    feelingChars += (item.experience.feeling || "").length;
    if (item.experience.rating) rated.push(item);
    if (item.experience.isPublic) pubCount++;
    cropCount += (item.crops || []).length;
    for (const t of (item.experience.tags || [])) {
      tagCount[t] = (tagCount[t] || 0) + 1;
      (tagBooks[t] = tagBooks[t] || new Set()).add(book.id);
    }
    const c = item.knowledge.category || "其他";
    catCount[c] = (catCount[c] || 0) + 1;
    const eb = eraBucket(item.knowledge.era);
    if (eb) eraCount[eb] = (eraCount[eb] || 0) + 1;
    const a = item.knowledge.artist;
    if (a && !/佚名|失记载/.test(a)) artistCount[a] = (artistCount[a] || 0) + 1;
  }
  return { items, tagCount, tagBooks, catCount, eraCount, artistCount, feelingChars, rated, pubCount, cropCount };
}
const topEntries = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

function pageInsights() {
  const I = computeInsights();
  if (!I.items.length) {
    return `<div class="page"><header class="masthead slim"><h1>线索</h1></header>
      <div class="empty"><div class="empty-mark">索</div><h3>线索将在积累中浮现</h3>
      <p>完成两册以上的观展记录后,<br>这里会呈现你的兴趣谱系。</p></div></div>`;
  }
  const avg = I.rated.length ? (I.rated.reduce((s, x) => s + x.item.experience.rating, 0) / I.rated.length).toFixed(1) : "—";
  const bars = (entries) => {
    const max = Math.max(1, ...entries.map(e => e[1]));
    return entries.map(([k, v]) => `<div class="hbar">
      <div class="lab"><b>${esc(k)}</b><span>${v}</span></div>
      <div class="track"><i style="width:${Math.round(v / max * 100)}%"></i></div></div>`).join("");
  };
  const tagTop = topEntries(I.tagCount, 8), catTop = topEntries(I.catCount, 6), eraTop = topEntries(I.eraCount, 6), artTop = topEntries(I.artistCount, 5);

  const notes = [];
  const cross = Object.entries(I.tagBooks).filter(([t, s]) => s.size >= 2).sort((a, b) => b[1].size - a[1].size);
  for (const [t, s] of cross.slice(0, 2))
    notes.push(`「<b>#${esc(t)}</b>」出现在你 ${s.size} 册收藏集中——值得持续追踪的兴趣线索。`);
  if (tagTop[0] && !cross.some(c => c[0] === tagTop[0][0]))
    notes.push(`你最常标注的标签是「<b>#${esc(tagTop[0][0])}</b>」(${tagTop[0][1]} 次)。`);
  if (catTop[0]) notes.push(`在 ${I.items.length} 件作品中,「<b>${esc(catTop[0][0])}</b>」占比最高(${Math.round(catTop[0][1] / I.items.length * 100)}%)。`);
  if (eraTop[0]) notes.push(`年代偏好上,你与「<b>${esc(eraTop[0][0])}</b>」相遇最多(${eraTop[0][1]} 次)。`);
  if (I.cropCount) notes.push(`你裁下了 <b>${I.cropCount}</b> 处细节——细节即是你目光停留的证据。`);
  const full = I.rated.filter(x => x.item.experience.rating === 5).slice(0, 2);
  if (full.length) notes.push(`你为 ${full.map(x => `《${esc(x.item.knowledge.name)}》`).join("、")} 打过满分。`);

  return `<div class="page">
    <header class="masthead slim"><h1>线索</h1>
      <p class="tagline">多次观展之后,你反复关注什么</p></header>
    <div class="stat-strip">
      <div><b>${S.books.length}</b><span>收藏集</span></div>
      <div><b>${I.items.length}</b><span>作品</span></div>
      <div><b>${I.cropCount}</b><span>细节裁剪</span></div>
      <div><b>${Object.keys(I.tagCount).length}</b><span>标签</span></div>
      <div><b>${avg}</b><span>平均评分</span></div>
    </div>

    ${notes.length ? `<div class="label-row"><span class="sec-label">跨收藏集洞察</span></div>
    <div class="insight-note">${notes.map(n => `<p>· ${n}</p>`).join("")}</div>` : ""}

    ${tagTop.length ? `<div class="label-row"><span class="sec-label">高频标签</span></div><div class="panel">${bars(tagTop)}</div>` : ""}
    ${catTop.length ? `<div class="label-row"><span class="sec-label">媒介与类别</span></div><div class="panel">${bars(catTop)}</div>` : ""}
    ${eraTop.length ? `<div class="label-row"><span class="sec-label">年代分布</span></div><div class="panel">${bars(eraTop)}</div>` : ""}
    ${artTop.length ? `<div class="label-row"><span class="sec-label">常相遇的创作者</span></div><div class="panel rank">
      ${artTop.map(([a, n], i) => `<div class="rank-row"><span class="n ${i === 0 ? "top" : ""}">${i + 1}</span><b>${esc(a)}</b><span>${n} 件</span></div>`).join("")}
    </div>` : ""}
    <div class="privacy-note">兴趣线索完全由你自己的记录生成。评价、感受和意义,始终由你表达和决定。</div>
    <div class="footer-cred">From seeing, to remembering, to understanding</div>
  </div>`;
}

/* ================= 设置 ================= */
function pageSettings() {
  const I = computeInsights();
  return `<div class="page">
    <header class="masthead slim"><h1>设置</h1></header>
    <div class="brand-card">
      <div class="brand-mark">观</div>
      <div><h2>再观</h2><p>观展后个人文化记忆系统 · v2.0</p></div>
    </div>

    <div class="label-row"><span class="sec-label">数据</span></div>
    <div class="panel list">
      <button class="list-row" onclick="App.exportData()">
        <span class="tx">导出全部数据<small>JSON · ${S.books.length} 册收藏集 / ${I.items.length} 件作品 / ${I.cropCount} 处细节</small></span><span class="arrow">→</span>
      </button>
      <button class="list-row" onclick="document.getElementById('import-file').click()">
        <span class="tx">导入数据<small>从导出的 JSON 恢复</small></span><span class="arrow">→</span>
      </button>
      <button class="list-row" onclick="App.reseed()">
        <span class="tx">恢复示例数据<small>用于体验完整功能</small></span><span class="arrow">→</span>
      </button>
      <button class="list-row" onclick="App.clearAll()">
        <span class="tx danger">清空所有数据<small>删除本浏览器中的全部记录</small></span><span class="arrow">→</span>
      </button>
    </div>
    <input type="file" id="import-file" accept="application/json" class="hidden" onchange="App.importData(this)">

    <div class="label-row"><span class="sec-label">隐私与人机边界</span></div>
    <div class="panel prose">
      <p><b>数据归属</b> — 所有照片、细节裁剪、感受与记录仅存储于你的浏览器本地,不经过任何服务器。可随时导出或彻底删除。</p>
      <p><b>人机边界</b> — AI 仅提供有来源、可修正的整理建议(展品匹配、拍摄时间解析);评价、感受与意义,始终由你本人表达和决定。</p>
      <p><b>公开与分享</b> — 每件作品可单独设置是否愿意公开,默认为私密。</p>
    </div>

    <div class="label-row"><span class="sec-label">关于</span></div>
    <div class="panel prose">
      <p>「再观」面向"智艺未来:人工智能时代的艺术生产"论坛主题,探索 AI 如何连接博物馆馆藏知识与公众个体经验。产品形态参考 Rijksmuseum Rijksstudio 的个人收藏集与细节裁剪理念。</p>
      <p style="color:var(--ink)">From seeing, to remembering, to understanding.</p>
      <p class="small">源码:<a href="${REPO_URL}" target="_blank" rel="noopener">github.com/KINGKAZMAX/zaiguan</a><br>在 iOS Safari 中通过「分享 → 添加到主屏幕」即可像原生 App 一样使用。</p>
    </div>
    <div class="footer-cred">再观 ZAIGUAN</div>
  </div>`;
}

/* ---------------- 弹层 ---------------- */
const overlayRoot = document.getElementById("overlay-root");
function openSheet(inner, opts = {}) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="sheet">${inner}</div>`;
  if (opts.backdropClose !== false) ov.addEventListener("click", e => { if (e.target === ov) closeSheet(ov); });
  overlayRoot.appendChild(ov);
  return ov;
}
function closeSheet(ov) {
  ov = ov || overlayRoot.lastElementChild;
  if (!ov) return;
  ov.classList.add("closing");
  setTimeout(() => ov.remove(), 210);
}
function closeAllSheets() { [...overlayRoot.children].forEach(closeSheet); }

function sheetShell(title, body) {
  return `<div class="sheet-grab"><i></i></div>
    <div class="sheet-head">
      <button class="x" onclick="App.closeTop()">✕</button>
      <div class="t">${title}</div>
      <div style="width:30px"></div>
    </div>
    <div class="sheet-body">${body}</div>`;
}

/* ================= 收藏集详情(Rijksstudio Set) ================= */
function sheetBook(bookId) {
  const b = findBook(bookId);
  if (!b) return;
  const confirmed = b.items.filter(i => i.status === "confirmed" || i.status === "modified").length;
  const grid = b.items.map(it => {
    const name = it.knowledge.name || "未识别";
    const img = it.photo ? `<img src="${it.photo}" alt="">` : posterHTML(name, it.knowledge.category);
    return `<figure class="set-item" onclick="App.openItem('${b.id}','${it.id}')">
      <div class="m-img">${img}
        <button class="heart ${it.experience.favorite ? "on" : ""}" onclick="event.stopPropagation();App.toggleFav('${b.id}','${it.id}')">♥</button>
      </div>
      <figcaption><b>${esc(name)}</b><i class="st st-${it.status}">${STATUS[it.status].label}${it.crops.length ? " · " + it.crops.length + " 细节" : ""}</i></figcaption>
    </figure>`;
  }).join("");

  openSheet(sheetShell("收藏集", `
    <button class="btn btn-ghost btn-block back-btn" onclick="App.closeTop()">‹ 返回收藏集</button>
    <div class="set-head">
      <h2>${esc(b.exhibition)}</h2>
      <p class="meta">${esc(b.venue)}</p>
      <p class="meta">${fmtDate(b.visitDate)} — ${b.items.length} 件作品 · ${confirmed} 件已确认 · ${b.items.reduce((n, i) => n + i.crops.length, 0)} 处细节</p>
    </div>
    <div class="label-row"><span class="sec-label">作品</span></div>
    <div class="masonry">${grid}
      <button class="m-card add-work" onclick="App.addBlankItem('${b.id}')">
        <div class="m-img"><span class="plus">＋</span></div>
        <figcaption><b style="color:var(--ink-3)">添加展品</b><span>&nbsp;</span></figcaption>
      </button>
    </div>
    <div class="row-2" style="margin-top:8px">
      <button class="btn btn-ghost btn-sm" onclick="App.exportBook('${b.id}')">导出本册</button>
      <button class="btn btn-outline-danger btn-sm" onclick="App.deleteBook('${b.id}')">删除收藏集</button>
    </div>
  `));
}

/* ================= 作品详情(Rijksstudio Artwork) ================= */
function sheetItem(bookId, itemId) {
  const b = findBook(bookId);
  const it = b && b.items.find(x => x.id === itemId);
  if (!it) return;
  editTmp = { tags: [...(it.experience.tags || [])], rating: it.experience.rating, bookId, itemId, cropping: false, cropRect: null };
  const k = it.knowledge, e = it.experience;

  /* 拍摄时间 + 状态行 */
  const kv = [
    ["作者 / 时代", `${k.artist || "—"}${k.era ? " · " + k.era : ""}`],
    ["媒介", k.medium || "—"],
    ["类别", k.category || "—"],
    ["馆藏来源", k.collection || "—"],
    ["收藏集", `${b.venue} · ${b.exhibition}`],
    ["参观 / 拍摄", `${fmtDate(b.visitDate)}${it.photoTakenAt ? " · 📷 " + it.photoTakenAt : ""}`],
  ];
  if (k.source) kv.push(["信息来源", k.source]);

  const crops = (it.crops || []).map(c => `
    <figure class="crop-card" onclick="App.viewCrop('${c.id}')">
      <img src="${c.dataUrl}" alt="">
      ${c.note ? `<figcaption>${esc(c.note)}</figcaption>` : ""}
    </figure>`).join("");

  openSheet(sheetShell("作品", `
    <button class="btn btn-ghost btn-block back-btn" onclick="App.closeTop()">‹ 返回</button>
    <div class="art-stage" id="art-stage">${itemHeroHtml(it, bookId, itemId)}</div>

    <div class="art-title">
      <h2>${esc(k.name || "未识别展品")}</h2>
      <p>${esc(k.artist || "")}${k.era ? " · " + esc(k.era) : ""}${k.medium ? " · " + esc(k.medium) : ""}</p>
      <div class="art-badges">
        <span class="st st-${it.status}">${STATUS[it.status].label} — ${STATUS[it.status].desc}</span>
      </div>
      <div class="art-actions">
        <button class="btn btn-primary btn-sm" ${it.photo ? "" : "disabled"} onclick="App.startCrop()">${it.photo ? "✂ 裁剪细节" : "✂ 裁剪细节(需照片)"}</button>
        <button class="btn ${e.favorite ? "btn-heart-on" : "btn-outline"} btn-sm" onclick="App.toggleFav('${bookId}','${it.id}',true)">♥ ${e.favorite ? "已是最爱" : "设为最爱"}</button>
      </div>
    </div>

    <div class="label-row"><span class="sec-label">细节 · Details</span><span class="sec-count">${(it.crops || []).length}</span></div>
    <div class="crops-strip">${crops}
      ${it.photo ? `<button class="crop-card add" onclick="App.startCrop()"><span class="plus">＋</span><figcaption>裁剪新细节</figcaption></button>` : `<p class="small" style="grid-column:1/-1">为此卡上传照片后,即可像 Rijksstudio 一样裁取并保存打动你的局部。</p>`}
    </div>

    <div class="label-row"><span class="sec-label">作品信息 · 可修正</span></div>
    <div class="field"><label>作品名称</label><input class="input" id="it-name" value="${esc(k.name)}" placeholder="例如:千里江山图"></div>
    <div class="row-2">
      <div class="field"><label>作者 / 时代</label><input class="input" id="it-artist" value="${esc(k.artist)}" placeholder="王希孟"></div>
      <div class="field"><label>年代</label><input class="input" id="it-era" value="${esc(k.era)}" placeholder="北宋"></div>
    </div>
    <div class="row-2">
      <div class="field"><label>媒介</label><input class="input" id="it-medium" value="${esc(k.medium)}" placeholder="绢本设色"></div>
      <div class="field"><label>类别</label>
        <select class="select" id="it-cat">${CATEGORIES.map(c => `<option ${k.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      </div>
    </div>
    <div class="field"><label>馆藏来源</label><input class="input" id="it-col" value="${esc(k.collection)}" placeholder="故宫博物院"></div>

    <div class="label-row"><span class="sec-label">我的观看经验</span></div>
    <div class="field"><label>感受</label><textarea class="textarea" id="it-feeling" placeholder="它为什么让你停下来?此刻的记忆、联想与疑问都值得留下…">${esc(e.feeling)}</textarea></div>
    <div class="field"><label>评价</label><div class="stars" id="stars">${[1,2,3,4,5].map(n => `<button class="${n <= e.rating ? "on" : ""}" onclick="App.rate(${n})">★</button>`).join("")}</div></div>
    <div class="field"><label>留下的问题</label><input class="input" id="it-question" value="${esc(e.question)}" placeholder="待解答的疑惑,日后回看时可补"></div>
    <div class="field"><label>标签</label>
      <div class="tags" id="tags">${editTmp.tags.map(t => tagChipHtml(t)).join("")}
        <button class="tag-add" onclick="App.addTag()">＋ 标签</button>
      </div>
    </div>
    <div class="switch-row">
      <div class="lab"><b>愿意公开</b><span>仅影响未来分享功能,当前数据不会离开你的设备</span></div>
      <label class="switch"><input type="checkbox" id="it-public" ${e.isPublic ? "checked" : ""}><span class="track"></span></label>
    </div>
    <div class="status-picker">
      ${Object.entries(STATUS).map(([key, st]) => `<button class="${it.status === key ? "on" : ""}" onclick="App.setStatus('${key}')">${st.label}</button>`).join("")}
    </div>

    <button class="btn btn-primary btn-block" onclick="App.saveItem()">保存作品卡</button>
    <button class="btn btn-outline-danger btn-block" style="margin-top:10px" onclick="App.deleteItem('${bookId}','${itemId}')">删除作品卡</button>
  `), { backdropClose: false });
}

function itemHeroHtml(it, bookId, itemId) {
  if (editTmp.cropping) {
    return `<div class="crop-stage" id="crop-stage"
        onpointerdown="App.cropDown(event)" onpointermove="App.cropMove(event)" onpointerup="App.cropUp(event)">
      <img id="crop-img" src="${it.photo}" alt="" draggable="false">
      <div class="crop-box" id="crop-box"></div>
      <div class="crop-hint" id="crop-hint">在照片上拖动,框选你想留住的细节</div>
    </div>
    <div class="crop-bar">
      <button class="btn btn-ghost btn-sm" onclick="App.cancelCrop()">取消</button>
      <button class="btn btn-primary btn-sm" id="crop-save" disabled onclick="App.saveCrop('${bookId}','${itemId}')">保存细节</button>
    </div>`;
  }
  const hero = it.photo
    ? `<img src="${it.photo}" alt="">`
    : posterHTML(it.knowledge.name || "未识别", it.knowledge.category);
  return `${hero}
    ${it.photoTakenAt ? `<span class="exif">📷 ${esc(it.photoTakenAt)}</span>` : ""}
    ${it.photo ? `<button class="hero-x" onclick="App.removePhoto('${bookId}','${itemId}')">✕</button>` : ""}
    ${it.photo ? "" : `<div class="hero-upload"><button class="btn btn-outline btn-sm" onclick="App.uploadPhoto('${bookId}','${itemId}')">为此卡上传照片</button></div>`}`;
}
const tagChipHtml = t => `<span class="tag" onclick="App.removeTag('${esc(t)}')">${esc(t)}<span class="x">✕</span></span>`;

/* ---------------- 裁剪细节(Rijksstudio Crop) ---------------- */
function startCrop() {
  const it = currentItem();
  if (!it || !it.photo) { toast("此卡还没有照片,请先上传"); return; }
  editTmp.cropping = true; editTmp.cropRect = null;
  const stage = document.getElementById("art-stage");
  if (stage) stage.innerHTML = itemHeroHtml(it, editTmp.bookId, editTmp.itemId);
}
function cancelCrop() {
  editTmp.cropping = false; editTmp.cropRect = null;
  const it = currentItem();
  const stage = document.getElementById("art-stage");
  if (stage && it) stage.innerHTML = itemHeroHtml(it, editTmp.bookId, editTmp.itemId);
}
function cropDown(ev) {
  const stage = document.getElementById("crop-stage");
  if (!stage) return;
  stage.setPointerCapture(ev.pointerId);
  const r = stage.getBoundingClientRect();
  editTmp.cropStart = { x: clamp(ev.clientX - r.left, 0, r.width), y: clamp(ev.clientY - r.top, 0, r.height) };
  editTmp.cropRect = { x: editTmp.cropStart.x, y: editTmp.cropStart.y, w: 0, h: 0 };
  drawCropBox(r);
  const hint = document.getElementById("crop-hint");
  if (hint) hint.style.display = "none";
}
function cropMove(ev) {
  if (!editTmp.cropRect || !editTmp.cropStart) return;
  const stage = document.getElementById("crop-stage");
  const r = stage.getBoundingClientRect();
  const x2 = clamp(ev.clientX - r.left, 0, r.width);
  const y2 = clamp(ev.clientY - r.top, 0, r.height);
  editTmp.cropRect = {
    x: Math.min(editTmp.cropStart.x, x2), y: Math.min(editTmp.cropStart.y, y2),
    w: Math.abs(x2 - editTmp.cropStart.x), h: Math.abs(y2 - editTmp.cropStart.y),
  };
  drawCropBox(r);
}
function cropUp() {
  const r = editTmp.cropRect;
  const btn = document.getElementById("crop-save");
  if (btn) btn.disabled = !(r && r.w > 18 && r.h > 18);
  editTmp.cropStart = null;
}
function drawCropBox() {
  const box = document.getElementById("crop-box");
  const r = editTmp.cropRect;
  if (box && r) {
    box.style.display = "block";
    box.style.left = r.x + "px"; box.style.top = r.y + "px";
    box.style.width = r.w + "px"; box.style.height = r.h + "px";
  }
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function saveCrop(bookId, itemId) {
  const it = currentItem();
  const stageRect = document.getElementById("crop-stage").getBoundingClientRect();
  const r = editTmp.cropRect;
  if (!it || !r || r.w < 10 || r.h < 10) { toast("请先拖动框选一个区域"); return; }
  const img = new Image();
  img.onload = () => {
    const scale = img.naturalWidth / stageRect.width;
    const sx = r.x * scale, sy = r.y * scale, sw = r.w * scale, sh = r.h * scale;
    const out = document.createElement("canvas");
    const oscale = Math.min(1, 900 / Math.max(sw, sh));
    out.width = Math.round(sw * oscale); out.height = Math.round(sh * oscale);
    out.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height);
    const note = prompt("为这个细节写一句话(可留空)", "") || "";
    it.crops.push({ id: uid(), dataUrl: out.toDataURL("image/jpeg", 0.85), note: note.trim() });
    save();
    toast("✓ 细节已保存");
    editTmp.cropping = false; editTmp.cropRect = null;
    closeAllSheets();
    sheetItem(bookId, itemId);
  };
  img.onerror = () => toast("⚠️ 照片读取失败");
  img.src = it.photo;
}
function viewCrop(cropId) {
  const it = currentItem();
  const c = it && it.crops.find(x => x.id === cropId);
  if (!c) return;
  const ov = document.createElement("div");
  ov.className = "overlay crop-view";
  ov.innerHTML = `<div class="crop-view-box">
    <img src="${c.dataUrl}" alt="">
    ${c.note ? `<p>${esc(c.note)}</p>` : ""}
    <div class="cb-actions">
      <button data-a="close">关闭</button>
      <button data-a="note">写一句注</button>
      <button data-a="del" class="danger">删除</button>
    </div>
  </div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { ov.remove(); return; }
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    ov.remove();
    if (a === "note") {
      const note = prompt("为这个细节写一句话", c.note || "") || "";
      c.note = note.trim(); save();
      closeAllSheets(); sheetItem(editTmp.bookId, editTmp.itemId);
    } else if (a === "del") {
      it.crops = it.crops.filter(x => x.id !== cropId); save();
      toast("已删除细节");
      closeAllSheets(); sheetItem(editTmp.bookId, editTmp.itemId);
    }
  });
  overlayRoot.appendChild(ov);
}
function currentItem() {
  const b = findBook(editTmp.bookId);
  return b && b.items.find(x => x.id === editTmp.itemId);
}

/* ================= 新建收藏集(四步) ================= */
let draft = null;
function openCreate() {
  draft = { step: 1, venue: "", exhibition: "", date: todayStr(), photos: [], results: null, scanDone: false };
  renderCreateSheet();
}
function renderCreateSheet(extra) {
  closeAllSheets();
  const steps = `<div class="steps">${[1, 2, 3, 4].map(n => `<span class="${n <= draft.step ? "on" : ""}"></span>`).join("")}</div>`;
  let body = "";

  if (draft.step === 1) {
    body = `
      <div class="hint-box">第 1 步 · 观展语境:这一次去了哪里?</div>
      <div class="field"><label>场馆 *</label><input class="input" id="cr-venue" value="${esc(draft.venue)}" placeholder="故宫博物院"></div>
      <div class="field"><label>展览名称 *</label><input class="input" id="cr-exh" value="${esc(draft.exhibition)}" placeholder="千里江山——历代青绿山水画特展"></div>
      <div class="field"><label>参观日期</label><input type="date" class="input" id="cr-date" value="${draft.date}"></div>
      <button class="btn btn-primary btn-block" onclick="App.createStep1()">下一步 · 添加照片</button>`;
  } else if (draft.step === 2) {
    const cells = draft.photos.map(p => `
      <div class="photo-cell">
        ${p.dataUrl ? `<img src="${p.dataUrl}" alt="">` : posterHTML("空白卡", "其他", true)}
        ${p.takenAt ? `<span class="badge">📷 ${p.takenAt.slice(5, 16)}</span>` : ""}
        <button class="rm" onclick="App.removeDraftPhoto(${draft.photos.indexOf(p)})">✕</button>
      </div>`).join("");
    body = `
      <div class="hint-box">第 2 步 · 从相册选取本次拍摄的展品照片(系统将读取<b>可用的拍摄时间</b>)。</div>
      <div class="photo-grid">${cells}
        <button class="add-photo" onclick="document.getElementById('cr-photos').click()">添加照片</button>
        <button class="add-photo" onclick="App.addDraftBlank()">空白展品卡</button>
      </div>
      <input type="file" id="cr-photos" accept="image/*" multiple class="hidden" onchange="App.addDraftPhotos(this)">
      <button class="btn btn-primary btn-block" style="margin-top:16px" ${draft.photos.length ? "" : "disabled"} onclick="App.createStep2()">${draft.photos.length ? `开始识别 ${draft.photos.length} 张照片的线索` : "请先添加照片"}</button>`;
  } else if (draft.step === 3) {
    if (!draft.scanDone) { runScan(); }
    body = `<div id="scan-area">
      <div class="scanning"><div class="ring"></div>
        <p>正在为「${esc(draft.exhibition)}」识别线索…</p>
        <p class="log" id="scan-log">正在提取视觉特征…</p>
      </div></div>`;
  } else if (draft.step === 4) {
    const ok = draft.results.filter(r => r.decision === "accept").length;
    const sug = draft.results.filter(r => r.suggestion).length;
    const unrec = draft.results.filter(r => !r.suggestion).length;
    const t0 = draft.photos.map(p => p.takenAt).filter(Boolean).sort()[0];
    body = `
      <div class="hint-box">第 4 步 · 即将生成收藏集</div>
      <div class="panel kv-list">
        <div class="kv"><span class="k">展览</span><span class="v">${esc(draft.venue)} · ${esc(draft.exhibition)}</span></div>
        <div class="kv"><span class="k">日期</span><span class="v">${draft.date}</span></div>
        <div class="kv"><span class="k">作品</span><span class="v">${draft.photos.length} 件(${sug} 个识别建议,${unrec} 件未识别)</span></div>
        <div class="kv"><span class="k">已确认</span><span class="v">${ok} 件</span></div>
        ${t0 ? `<div class="kv"><span class="k">最早拍摄</span><span class="v">📷 ${t0}</span></div>` : ""}
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="App.finishCreate()">生成收藏集</button>
      <p class="small" style="text-align:center;margin-top:12px;color:var(--ink-3)">识别建议仅供参考,生成后你仍可逐张确认、修改、裁剪细节。</p>`;
  }
  openSheet(sheetShell("新建收藏集", steps + (body || "")), { backdropClose: false });
  if (draft && draft.step === 3 && draft.scanDone) renderResults();
}

function createStep1() {
  draft.venue = document.getElementById("cr-venue").value.trim();
  draft.exhibition = document.getElementById("cr-exh").value.trim();
  draft.date = document.getElementById("cr-date").value || todayStr();
  if (!draft.venue || !draft.exhibition) { toast("请填写场馆与展览名称"); return; }
  draft.step = 2; renderCreateSheet();
}
async function addDraftPhotos(input) {
  const files = [...input.files];
  input.value = "";
  if (!files.length) return;
  toast(`正在处理 ${files.length} 张照片…`);
  for (const f of files) {
    const { dataUrl, rawBuf } = await compressImage(f);
    const takenAt = rawBuf ? parseExifDate(rawBuf) : null;
    draft.photos.push({ id: uid(), dataUrl, takenAt, blank: false });
  }
  renderCreateSheet();
}
const addDraftBlank = () => { draft.photos.push({ id: uid(), dataUrl: null, takenAt: null, blank: true }); renderCreateSheet(); };
const removeDraftPhoto = i => { draft.photos.splice(i, 1); renderCreateSheet(); };

function createStep2() { draft.step = 3; draft.scanDone = false; draft.results = null; renderCreateSheet(); }

async function runScan() {
  const logs = ["正在提取视觉特征…", "正在匹配馆藏数据库…", "正在解析拍摄时间信息…", "正在汇总识别线索…"];
  const seed = hashStr(draft.venue + draft.exhibition + draft.date);
  const rng = mulberry32(seed);
  for (let i = 0; i < logs.length; i++) {
    const el = document.getElementById("scan-log");
    if (el) el.textContent = logs[i];
    await new Promise(r => setTimeout(r, 480));
  }
  const used = new Set();
  draft.results = draft.photos.map(p => {
    let suggestion = null, confidence = 0;
    if (p.blank) { return { photo: p, suggestion: null, confidence: 0, decision: "pending" }; }
    if (rng() < 0.72) {
      const pool = KB.filter(x => !used.has(x.name));
      if (pool.length) {
        const pick = pool[Math.floor(rng() * pool.length)];
        used.add(pick.name);
        suggestion = pick;
        confidence = Math.round(72 + rng() * 26);
      }
    }
    return { photo: p, suggestion, confidence, decision: suggestion ? "later" : "none" };
  });
  draft.scanDone = true;
  renderCreateSheet();
}

function renderResults() {
  const cards = draft.results.map((r, idx) => {
    const thumb = r.photo.dataUrl ? `<img src="${r.photo.dataUrl}" alt="">` : posterHTML("空白", "其他", true);
    let main;
    if (r.photo.blank) {
      main = `<b>空白展品卡</b><span>无照片 · 待你手动补充作品信息</span>`;
    } else if (r.suggestion) {
      main = `<b>${esc(r.suggestion.name)}</b>
        <span>${esc(r.suggestion.artist)} · ${esc(r.suggestion.era)} · ${esc(r.suggestion.medium)}</span>
        <span style="color:var(--ink-3)">${esc(r.suggestion.collection)}</span>
        <div class="conf"><div class="bar"><i style="width:${r.confidence}%"></i></div><em>${r.confidence}% 匹配</em></div>`;
    } else {
      main = `<b>未识别</b><span>暂未匹配到馆藏信息</span><span style="color:var(--ink-3)">可先保留观看感受,日后再补充</span>`;
    }
    const actions = r.photo.blank ? `<span class="st st-pending">待补充</span>` :
      r.suggestion ? `
      <button class="btn ${r.decision === "accept" ? "btn-primary" : "btn-outline"} btn-sm" onclick="App.decide(${idx},'accept')">${r.decision === "accept" ? "✓ 已确认" : "确认"}</button>
      <button class="btn btn-ghost btn-sm" style="opacity:${r.decision === "later" ? 1 : .55}" onclick="App.decide(${idx},'later')">稍后</button>` :
      `<span class="st st-unrecognized">未识别</span>`;
    return `<div class="panel rec-card">
      <div class="rec-thumb">${thumb}</div>
      <div class="rec-body">${main}</div>
      <div class="rec-actions">${actions}</div>
    </div>`;
  }).join("");
  document.getElementById("scan-area").innerHTML = `
    <div class="hint-box">第 3 步 · 识别线索(模拟多模态识别 + 馆藏匹配):<b>AI 建议仅供参考</b>,最终由你确认。</div>
    ${cards}
    <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="App.createStep3()">下一步 · 生成收藏集</button>`;
}
const decide = (i, d) => { draft.results[i].decision = d; renderResults(); };
const createStep3 = () => { draft.step = 4; renderCreateSheet(); };

function finishCreate() {
  const book = {
    id: uid(), venue: draft.venue, exhibition: draft.exhibition,
    visitDate: draft.date, createdAt: todayStr(), items: [],
  };
  for (const r of draft.results) {
    const sug = r.suggestion;
    const status = r.photo.blank ? "pending"
      : sug ? (r.decision === "accept" ? "confirmed" : "suggested")
      : "unrecognized";
    book.items.push({
      id: uid(),
      photo: r.photo.dataUrl,
      photoTakenAt: r.photo.takenAt,
      knowledge: sug ? {
        name: sug.name, artist: sug.artist, era: sug.era, medium: sug.medium,
        category: sug.category, collection: sug.collection,
        source: `馆藏数据匹配 · 置信度 ${r.confidence}%`, sourceType: "museum",
      } : { name: "", artist: "", era: "", medium: "", category: "其他", collection: "", source: "", sourceType: "none" },
      experience: { feeling: "", rating: 0, question: "", tags: [], isPublic: false, favorite: false },
      crops: [],
      status,
    });
  }
  S.books.unshift(book);
  save();
  draft = null;
  closeAllSheets();
  ui.tab = "records"; render();
  toast("✓ 收藏集已生成,去补充感受与细节吧");
  sheetBook(book.id);
}

/* ---------------- 作品卡操作 ---------------- */
function toggleFav(bookId, itemId, reopen) {
  const it = findBook(bookId).items.find(x => x.id === itemId);
  it.experience.favorite = !it.experience.favorite;
  save();
  if (reopen) { closeAllSheets(); sheetItem(bookId, itemId); }
  else render(false);
  toast(it.experience.favorite ? "♥ 已设为最爱" : "已取消最爱");
}
const toggleFavFilter = () => { ui.archive.fav = !ui.archive.fav; render(false); };

function setStatus(st) {
  editTmp.pendingStatus = st;
  document.querySelectorAll(".status-picker button").forEach(b => b.classList.toggle("on", b.textContent.startsWith(STATUS[st].label)));
}
function rate(n) {
  editTmp.rating = n;
  const box = document.getElementById("stars");
  if (box) [...box.children].forEach((b, i) => b.classList.toggle("on", i < n));
}
function addTag() {
  const t = prompt("输入标签(如:青绿山水 / 色彩 / 纹样)");
  if (!t) return;
  const v = t.trim().slice(0, 12);
  if (v && !editTmp.tags.includes(v)) editTmp.tags.push(v);
  document.getElementById("tags").innerHTML = editTmp.tags.map(tagChipHtml).join("") + `<button class="tag-add" onclick="App.addTag()">＋ 标签</button>`;
}
function removeTag(t) {
  editTmp.tags = editTmp.tags.filter(x => x !== t);
  document.getElementById("tags").innerHTML = editTmp.tags.map(tagChipHtml).join("") + `<button class="tag-add" onclick="App.addTag()">＋ 标签</button>`;
}
const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
function saveItem() {
  const b = findBook(editTmp.bookId);
  const it = b && b.items.find(x => x.id === editTmp.itemId);
  if (!it) return;
  const before = JSON.stringify([it.knowledge.name, it.knowledge.artist, it.knowledge.era, it.knowledge.medium, it.knowledge.category, it.knowledge.collection]);
  it.knowledge.name = val("it-name"); it.knowledge.artist = val("it-artist");
  it.knowledge.era = val("it-era"); it.knowledge.medium = val("it-medium");
  it.knowledge.category = val("it-cat"); it.knowledge.collection = val("it-col");
  it.experience.feeling = val("it-feeling"); it.experience.question = val("it-question");
  it.experience.rating = editTmp.rating; it.experience.tags = [...editTmp.tags];
  it.experience.isPublic = document.getElementById("it-public").checked;
  if (editTmp.pendingStatus) it.status = editTmp.pendingStatus;
  const after = JSON.stringify([it.knowledge.name, it.knowledge.artist, it.knowledge.era, it.knowledge.medium, it.knowledge.category, it.knowledge.collection]);
  if (before !== after && (it.status === "suggested" || it.status === "confirmed")) it.status = "modified";
  if (it.knowledge.sourceType === "museum" && before !== after) it.knowledge.source = "用户修正 · 原建议来自馆藏数据匹配";
  save();
  toast("✓ 已保存");
  closeAllSheets();
  if (findBook(b.id)) sheetBook(b.id);
  render(false);
}

function addBlankItem(bookId) {
  const b = findBook(bookId);
  if (!b) return;
  const it = {
    id: uid(), photo: null, photoTakenAt: null, crops: [],
    knowledge: { name: "", artist: "", era: "", medium: "", category: "其他", collection: "", source: "", sourceType: "none" },
    experience: { feeling: "", rating: 0, question: "", tags: [], isPublic: false, favorite: false },
    status: "pending",
  };
  b.items.push(it);
  save();
  closeAllSheets();
  sheetBook(bookId);
  setTimeout(() => { closeAllSheets(); sheetItem(bookId, it.id); }, 60);
}
function uploadPhoto(bookId, itemId) {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = async () => {
    if (!inp.files.length) return;
    const { dataUrl, rawBuf } = await compressImage(inp.files[0]);
    const it = findBook(bookId).items.find(x => x.id === itemId);
    it.photo = dataUrl;
    it.photoTakenAt = parseExifDate(rawBuf);
    save(); toast("✓ 照片已添加,现在可以裁剪细节了");
    closeAllSheets(); sheetItem(bookId, itemId);
  };
  inp.click();
}
function removePhoto(bookId, itemId) {
  confirmBox("移除照片", "只移除照片,作品卡、细节与感受会保留。", [
    { label: "取消" },
    { label: "移除", danger: true, fn: () => {
      const it = findBook(bookId).items.find(x => x.id === itemId);
      it.photo = null; save();
      closeAllSheets(); sheetItem(bookId, itemId);
    } },
  ]);
}
function deleteItem(bookId, itemId) {
  confirmBox("删除作品卡", "这张作品卡及其细节裁剪、感受记录将被删除,无法恢复。", [
    { label: "取消" },
    { label: "删除", danger: true, fn: () => {
      const b = findBook(bookId);
      b.items = b.items.filter(x => x.id !== itemId);
      save(); closeAllSheets(); sheetBook(bookId); render(false);
    } },
  ]);
}
function deleteBook(bookId) {
  const b = findBook(bookId);
  confirmBox("删除收藏集", `「${b.exhibition}」及其中 ${b.items.length} 件作品将被删除。建议先导出备份。`, [
    { label: "取消" },
    { label: "删除", danger: true, fn: () => {
      S.books = S.books.filter(x => x.id !== bookId);
      save(); closeAllSheets(); render();
    } },
  ]);
}

/* ---------------- 导入导出 ---------------- */
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const exportData = () => { downloadJSON({ app: "zaiguan", version: 2, exportedAt: new Date().toISOString(), books: S.books }, `zaiguan-${todayStr()}.json`); toast("✓ 已导出全部数据"); };
const exportBook = id => { const b = findBook(id); downloadJSON({ app: "zaiguan", version: 2, book: b }, `zaiguan-${b.exhibition}-${todayStr()}.json`); toast("✓ 已导出本册"); };

function importData(input) {
  const f = input.files[0];
  input.value = "";
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const books = Array.isArray(data) ? data : data.books || (data.book ? [data.book] : null);
      if (!books) throw new Error();
      confirmBox("导入数据", `将导入 ${books.length} 册收藏集,并<b>覆盖</b>当前全部数据。`, [
        { label: "取消" },
        { label: "导入", fn: () => {
          S = { books: books.filter(b => b && b.id && Array.isArray(b.items)), v: 2 };
          normalize(S);
          save(); render(); toast("✓ 导入完成");
        } },
      ]);
    } catch (e) { toast("⚠️ 文件格式无法识别"); }
  };
  reader.readAsText(f);
}
function reseed() {
  confirmBox("恢复示例数据", "将用 3 册示例收藏集覆盖当前数据。", [
    { label: "取消" },
    { label: "恢复", fn: () => { S = { books: seedBooks(), v: 2 }; save(); render(); toast("✓ 已恢复示例数据"); } },
  ]);
}
function clearAll() {
  confirmBox("清空所有数据", "本浏览器中的全部收藏集、照片、细节与感受将被彻底删除。", [
    { label: "取消" },
    { label: "全部删除", danger: true, fn: () => { S = { books: [], v: 2 }; save(); render(); toast("已清空"); } },
  ]);
}

/* ---------------- toast / confirm ---------------- */
function toast(msg) {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = msg;
  root.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 2200);
}
function confirmBox(title, msg, buttons) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="confirm-box">
    <div class="cb-body"><h4>${title}</h4><p>${msg}</p></div>
    <div class="cb-actions">${buttons.map((b, i) => `<button data-i="${i}" class="${b.danger ? "danger" : ""}">${b.label}</button>`).join("")}</div>
  </div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { ov.remove(); return; }
    const btn = e.target.closest("button[data-i]");
    if (!btn) return;
    const b = buttons[+btn.dataset.i];
    ov.remove();
    if (b.fn) b.fn();
  });
  overlayRoot.appendChild(ov);
}

/* ---------------- 对外 API ---------------- */
window.App = {
  closeTop: () => closeSheet(),
  openCreate, openBook: sheetBook,
  openItem: (b, i) => { closeAllSheets(); sheetBook(b); setTimeout(() => sheetItem(b, i), 40); },
  setFilter: (k, v) => { ui.archive[k] = v; if (k === "cat") ui.archive.fav = false; render(false); },
  toggleFavFilter, toggleFav,
  addBlankItem, uploadPhoto, removePhoto, deleteItem, deleteBook,
  setStatus, rate, addTag, removeTag, saveItem,
  startCrop, cancelCrop, cropDown, cropMove, cropUp, saveCrop, viewCrop,
  createStep1, addDraftPhotos, addDraftBlank, removeDraftPhoto, createStep2, decide, createStep3, finishCreate,
  exportData, exportBook, importData, reseed, clearAll,
};

/* ---------------- 启动 ---------------- */
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => { ui.tab = t.dataset.tab; render(); }));
render();
