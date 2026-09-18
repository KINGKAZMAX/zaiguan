/* ============================================================
   再观 Zaiguan — 应用主逻辑
   上传照片 → 识别线索 → 记录感受 → 形成档案
   ============================================================ */

const STORE_KEY = "zaiguan.v1";
const REPO_URL = "https://github.com/KINGKAZMAX/zaiguan";
const SITE_URL = "https://kingkazmax.github.io/zaiguan/";

let S = loadState();
const ui = { tab: "records", archive: { cat: "全部", tag: "", q: "" } };
let editTmp = null; // 展品卡编辑中的临时标签/评分

/* ---------------- 状态与持久化 ---------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const s = JSON.parse(raw); if (Array.isArray(s.books)) return s; }
  } catch (e) {}
  const seeded = { books: seedBooks(), v: 1 };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(seeded)); } catch (e) {}
  return seeded;
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

/* ================= 记录 · 首页 ================= */
function pageRecords() {
  const books = [...S.books].sort((a, b) => (b.visitDate || "").localeCompare(a.visitDate || ""));
  const items = allItems();
  const feelings = items.reduce((n, x) => n + (x.item.experience.feeling || "").length, 0);

  let html = `<div class="page">
    <div class="hero">
      <h1>再观</h1>
      <p>让观看发生第二次</p>
      <div class="hero-flow">
        <span>上传照片</span><i>→</i><span>识别线索</span><i>→</i><span>记录感受</span><i>→</i><span>形成档案</span>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-cell"><b>${books.length}</b><span>观展记录册</span></div>
      <div class="stat-cell"><b>${items.length}</b><span>展品记录卡</span></div>
      <div class="stat-cell"><b>${feelings}</b><span>感受字数</span></div>
    </div>`;

  if (!books.length) {
    html += `<div class="empty">
      <div class="seal">观</div>
      <h3>还没有观展记录</h3>
      <p>观展结束后,从相册选取本次拍摄的照片,<br>开始整理你的第一册观展记录。</p>
    </div>`;
  } else {
    html += `<div class="section-title">观展记录库<span class="more" onclick="App.openCreate()">＋ 新建</span></div>`;
    for (const b of books) {
      const confirmed = b.items.filter(i => i.status === "confirmed" || i.status === "modified").length;
      const pct = b.items.length ? Math.round(confirmed / b.items.length * 100) : 0;
      const first = b.items[0];
      const cat = first ? (first.knowledge.category || "其他") : "其他";
      const pal = CAT_PALETTE[cat] || CAT_PALETTE["其他"];
      html += `<div class="card book" onclick="App.openBook('${b.id}')">
        <div class="book-cover" style="--c1:${pal[0]};--c2:${pal[1]}">
          <span class="glyph">${esc(b.exhibition).replace(/[^\u4e00-\u9fa5]/g, "").slice(0, 1) || "展"}</span>
        </div>
        <div class="book-body">
          <h3>${esc(b.exhibition)}</h3>
          <div class="book-meta">${esc(b.venue)} · ${fmtDate(b.visitDate)}</div>
          <div class="book-foot">
            <span class="chip">${b.items.length} 件展品</span>
            <div class="progress"><i style="width:${pct}%"></i></div>
            <span class="chip st-${confirmed === b.items.length && b.items.length ? "confirmed" : "pending"}">${pct}%</span>
          </div>
        </div>
      </div>`;
    }
  }
  html += `
    <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="App.openCreate()">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      新建观展记录
    </button>
    <div class="hint-box" style="margin-top:12px">照片与记录仅保存在<b>你的浏览器本地</b>,不会上传到任何服务器。</div>
    <div class="footer-cred">再观 Zaiguan · 观展后个人文化记忆系统</div>
  </div>`;
  return html;
}

/* ================= 档案 ================= */
function pageArchive() {
  const F = ui.archive;
  let items = allItems();
  const tags = [...new Set(items.flatMap(x => x.item.experience.tags || []))].slice(0, 14);

  if (F.cat !== "全部") items = items.filter(x => (x.item.knowledge.category || "其他") === F.cat);
  if (F.tag) items = items.filter(x => (x.item.experience.tags || []).includes(F.tag));
  if (F.q) {
    const q = F.q.toLowerCase();
    items = items.filter(x =>
      [x.item.knowledge.name, x.item.knowledge.artist, x.item.knowledge.era,
       x.book.venue, x.book.exhibition, x.item.experience.feeling]
      .join(" ").toLowerCase().includes(q));
  }
  items.sort((a, b) => (b.book.visitDate || "").localeCompare(a.book.visitDate || ""));

  const catChips = ["全部", ...CATEGORIES].map(c =>
    `<button class="fchip ${F.cat === c ? "on" : ""}" onclick="App.setFilter('cat','${c}')">${c}</button>`).join("");
  const tagChips = F.tag || tags.length ? `<div style="margin:2px 0 4px;font-size:11px;color:var(--ink-3)">按标签</div>
    <div class="filter-scroll">${F.tag ? `<button class="fchip on" onclick="App.setFilter('tag','')">${esc(F.tag)} ✕</button>` : ""}
    ${tags.filter(t => t !== F.tag).map(t => `<button class="fchip" onclick="App.setFilter('tag','${esc(t)}')">#${esc(t)}</button>`).join("")}</div>` : "";

  let groups = "";
  let lastKey = "";
  for (const { book, item } of items) {
    const key = (book.visitDate || "未知日期").slice(0, 7);
    if (key !== lastKey) {
      lastKey = key;
      groups += `<div class="timeline-date">${key.replace("-", " 年 ")} 月</div>`;
    }
    const name = item.knowledge.name || "未识别展品";
    const cat = item.knowledge.category || "其他";
    const stars = item.experience.rating ? `<span class="mini-stars">${"★".repeat(item.experience.rating)}</span>` : "";
    const tagn = (item.experience.tags || []).length ? `<span class="chip">#${esc(item.experience.tags[0])}</span>` : "";
    groups += `<div class="card arch-item" onclick="App.openItem('${book.id}','${item.id}')">
      <div class="arch-thumb">${item.photo ? `<img src="${item.photo}" alt="">` : posterHTML(name, cat, true)}</div>
      <div class="arch-body">
        <h4>${esc(name)}</h4>
        <div class="sub">${esc(book.venue)} · ${esc(book.exhibition)}</div>
        <div class="meta"><span class="chip st-${item.status}">${STATUS[item.status].label}</span>${stars}${tagn}</div>
      </div>
    </div>`;
  }

  return `<div class="page">
    <div class="large-title">个人文化档案</div>
    <div class="page-sub">跨越展览的个人观看史 · ${allItems().length} 条展品记录</div>
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input placeholder="搜索展品、艺术家、展览、感受…" value="${esc(F.q)}" oninput="App.setFilter('q', this.value)">
    </div>
    <div class="filter-scroll">${catChips}</div>
    ${tagChips}
    ${items.length ? `<div class="timeline-group">${groups}</div>` : `<div class="empty" style="padding-top:36px">
      <h3>没有匹配的记录</h3><p>换个筛选条件,或先去「记录」新建一册观展记录。</p></div>`}
    <div class="footer-cred">每一次记录,都在让档案生长</div>
  </div>`;
}

/* ================= 兴趣线索 ================= */
function computeInsights() {
  const items = allItems();
  const tagCount = {}, tagBooks = {}, catCount = {}, eraCount = {}, artistCount = {};
  let feelingChars = 0, rated = [], pubCount = 0;
  for (const { book, item } of items) {
    feelingChars += (item.experience.feeling || "").length;
    if (item.experience.rating) rated.push(item);
    if (item.experience.isPublic) pubCount++;
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
  return { items, tagCount, tagBooks, catCount, eraCount, artistCount, feelingChars, rated, pubCount };
}
const topEntries = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

function pageInsights() {
  const I = computeInsights();
  if (!I.items.length) {
    return `<div class="page"><div class="large-title">兴趣线索</div>
      <div class="empty"><div class="seal">索</div><h3>线索将在积累中浮现</h3>
      <p>完成两册以上的观展记录后,<br>这里会呈现你的兴趣谱系与跨展览关联。</p></div></div>`;
  }
  const avg = I.rated.length ? (I.rated.reduce((s, x) => s + x.item.experience.rating, 0) / I.rated.length).toFixed(1) : "—";
  const bars = (entries, alt) => {
    const max = Math.max(1, ...entries.map(e => e[1]));
    return entries.map(([k, v]) => `<div class="hbar ${alt || ""}">
      <div class="lab"><b>${esc(k)}</b><span>${v} 次</span></div>
      <div class="track"><i style="width:${Math.round(v / max * 100)}%"></i></div></div>`).join("");
  };
  const tagTop = topEntries(I.tagCount, 8), catTop = topEntries(I.catCount, 6), eraTop = topEntries(I.eraCount, 6), artTop = topEntries(I.artistCount, 5);

  /* 洞察句生成 */
  const notes = [];
  const cross = Object.entries(I.tagBooks).filter(([t, s]) => s.size >= 2).sort((a, b) => b[1].size - a[1].size);
  for (const [t, s] of cross.slice(0, 2))
    notes.push(`「<b>#${esc(t)}</b>」出现在你 ${s.size} 次观展记录中——这可能是一条值得持续追踪的兴趣线索。`);
  if (tagTop[0] && !cross.some(c => c[0] === tagTop[0][0]))
    notes.push(`你最常标注的标签是「<b>#${esc(tagTop[0][0])}</b>」(${tagTop[0][1]} 次)。`);
  if (catTop[0]) notes.push(`在 ${I.items.length} 件展品记录中,「<b>${esc(catTop[0][0])}</b>」占比最高(${Math.round(catTop[0][1] / I.items.length * 100)}%)。`);
  if (eraTop[0]) notes.push(`年代偏好上,你与「<b>${esc(eraTop[0][0])}</b>」相遇最多(${eraTop[0][1]} 次)。`);
  const full = I.rated.filter(x => x.item.experience.rating === 5).slice(0, 2);
  if (full.length) notes.push(`你为 ${full.map(x => `《${esc(x.item.knowledge.name)}》`).join("、")} 打过满分。`);

  return `<div class="page">
    <div class="large-title">兴趣线索</div>
    <div class="page-sub">多次观展之后,你反复关注什么</div>
    <div class="insight-cards">
      <div class="stat-cell"><b>${S.books.length}</b><span>观展次数</span></div>
      <div class="stat-cell"><b>${I.items.length}</b><span>展品记录</span></div>
      <div class="stat-cell"><b>${Object.keys(I.tagCount).length}</b><span>不同标签</span></div>
      <div class="stat-cell"><b>${avg}</b><span>平均评分</span></div>
    </div>

    ${notes.length ? `<div class="section-title">跨展览洞察</div>
    <div class="insight-note"><h4><span class="dot"></span>你的兴趣谱系</h4>${notes.map(n => `<p>· ${n}</p>`).join("")}</div>` : ""}

    ${tagTop.length ? `<div class="section-title">高频标签</div><div class="card hbar-list">${bars(tagTop)}</div>` : ""}
    ${catTop.length ? `<div class="section-title">媒介与类别分布</div><div class="card hbar-list">${bars(catTop, "alt")}</div>` : ""}
    ${eraTop.length ? `<div class="section-title">年代分布</div><div class="card hbar-list">${bars(eraTop, "gold")}</div>` : ""}
    ${artTop.length ? `<div class="section-title">常相遇的创作者</div><div class="card rank-list">
      ${artTop.map(([a, n], i) => `<div class="rank"><span class="n ${i === 0 ? "top" : ""}">${i + 1}</span><b>${esc(a)}</b><span>${n} 件</span></div>`).join("")}
    </div>` : ""}
    <div class="hint-box">兴趣线索完全由你自己的记录生成。<b>评价、感受和意义,始终由你表达和决定</b>——AI 只做整理建议。</div>
    <div class="footer-cred">从看见,到记住,再到理解</div>
  </div>`;
}

/* ================= 设置 ================= */
function pageSettings() {
  const I = computeInsights();
  return `<div class="page">
    <div class="seal-card">
      <div class="logo">观</div>
      <div><h2>再观</h2><p>观展后个人文化记忆系统 · v1.0</p></div>
    </div>

    <div class="section-title">数据管理</div>
    <div class="card list-card">
      <button class="list-row" onclick="App.exportData()">
        <span class="ic" style="background:#eaf0f4;color:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg></span>
        <span class="tx">导出全部数据<small>JSON 文件 · 含 ${S.books.length} 册记录 / ${I.items.length} 件展品</small></span><span class="arrow">›</span>
      </button>
      <button class="list-row" onclick="document.getElementById('import-file').click()">
        <span class="ic" style="background:#f3ecdd;color:var(--gold)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span>
        <span class="tx">导入数据<small>从导出的 JSON 恢复</small></span><span class="arrow">›</span>
      </button>
      <button class="list-row" onclick="App.reseed()">
        <span class="ic" style="background:var(--accent-soft);color:var(--accent)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></span>
        <span class="tx">恢复示例数据<small>用于体验完整功能</small></span><span class="arrow">›</span>
      </button>
      <button class="list-row" onclick="App.clearAll()">
        <span class="ic" style="background:#f7e5e1;color:#9c3b2b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></span>
        <span class="tx" style="color:#9c3b2b">清空所有数据<small>删除本浏览器中的全部记录</small></span><span class="arrow">›</span>
      </button>
    </div>
    <input type="file" id="import-file" accept="application/json" class="hidden" onchange="App.importData(this)">

    <div class="section-title">隐私与人机边界</div>
    <div class="card about-text" style="padding:16px">
      <p><b>数据归属:</b>所有照片、感受与记录仅存储于你的浏览器本地(localStorage),不经过任何服务器。你可以随时导出或彻底删除。</p>
      <p><b>人机边界:</b>AI 仅提供有来源、可修正的整理建议(展品匹配、拍摄时间解析);评价、感受与意义,始终由你本人表达和决定。</p>
      <p><b>公开与分享:</b>每张展品卡可单独设置是否愿意公开,默认为私密。</p>
    </div>

    <div class="section-title">关于</div>
    <div class="card about-text" style="padding:16px">
      <p>「再观」面向"智艺未来:人工智能时代的艺术生产"论坛主题,探索 AI 如何连接博物馆馆藏知识与公众个体经验——让零散的观展照片,转化为可回顾、可理解、可持续积累的个人文化档案。</p>
      <p style="color:var(--accent);font-weight:600">从看见,到记住,再到理解。</p>
      <p style="font-size:11.5px;color:var(--ink-3)">源码与部署:<a href="${REPO_URL}" target="_blank" rel="noopener" style="color:var(--teal)">${REPO_URL.replace("https://", "")}</a><br>
      在 iOS Safari 中可通过「分享 → 添加到主屏幕」像原生 App 一样使用。</p>
    </div>
    <div class="footer-cred">再观 Zaiguan · 让观看发生第二次</div>
  </div>`;
}

/* ---------------- 底部弹层 ---------------- */
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

function sheetShell(title, body, extraHead = "") {
  return `<div class="sheet-grab"><i></i></div>
    <div class="sheet-head">
      <button class="x" onclick="App.closeTop()">✕</button>
      <div class="t">${title}</div>
      <div style="width:30px">${extraHead}</div>
    </div>
    <div class="sheet-body">${body}</div>`;
}

/* ================= 记录册详情 ================= */
function sheetBook(bookId) {
  const b = findBook(bookId);
  if (!b) return;
  const confirmed = b.items.filter(i => i.status === "confirmed" || i.status === "modified").length;
  const pct = b.items.length ? Math.round(confirmed / b.items.length * 100) : 0;
  const grid = b.items.map(it => {
    const name = it.knowledge.name || "未识别";
    return `<div class="photo-cell" onclick="App.openItem('${b.id}','${it.id}')">
      ${it.photo ? `<img src="${it.photo}" alt="">` : posterHTML(it.knowledge.name, it.knowledge.category)}
      <span class="badge">${esc(name)} · ${STATUS[it.status].label}</span>
    </div>`;
  }).join("");

  openSheet(sheetShell("观展记录册", `
    <button class="btn btn-ghost btn-block" style="margin:2px 0 12px" onclick="App.closeTop()">‹ 返回记录库</button>
    <div class="book-head">
      <h2>${esc(b.exhibition)}</h2>
      <div class="meta">${esc(b.venue)} · ${fmtDate(b.visitDate)}</div>
      <div class="book-stats">
        <div><b>${b.items.length}</b><span>展品记录</span></div>
        <div><b>${confirmed}</b><span>已确认</span></div>
        <div><b>${pct}%</b><span>完成度</span></div>
      </div>
    </div>
    <div class="section-title">展品记录卡</div>
    <div class="photo-grid">${grid}
      <button class="add-photo" onclick="App.addBlankItem('${b.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        添加展品
      </button>
    </div>
    <div class="hint-box">点按展品卡可补充<b>作品信息、感受、评分与标签</b>;没有照片也可以先记录感受。</div>
    <div class="row-2" style="margin-top:6px">
      <button class="btn btn-ghost btn-sm" onclick="App.exportBook('${b.id}')">导出本册</button>
      <button class="btn btn-danger btn-sm" onclick="App.deleteBook('${b.id}')">删除记录册</button>
    </div>
  `));
}

/* ================= 展品记录卡 ================= */
function sheetItem(bookId, itemId) {
  const b = findBook(bookId);
  const it = b && b.items.find(x => x.id === itemId);
  if (!it) return;
  editTmp = { tags: [...(it.experience.tags || [])], rating: it.experience.rating, bookId, itemId };
  const k = it.knowledge, e = it.experience;
  const stars = [1, 2, 3, 4, 5].map(n =>
    `<button class="${n <= e.rating ? "on" : ""}" onclick="App.rate(${n})">★</button>`).join("");

  openSheet(sheetShell("展品记录卡", `
    <button class="btn btn-ghost btn-block" style="margin:2px 0 12px" onclick="App.closeTop()">‹ 返回</button>
    <div class="item-hero" ${it.photo ? "" : `onclick="App.uploadPhoto('${bookId}','${itemId}')" title="点按上传照片"`}>
      ${it.photo ? `<img src="${it.photo}" alt="">` : posterHTML(k.name || "未识别", k.category)}
      ${it.photoTakenAt ? `<span class="exif">📷 ${esc(it.photoTakenAt)}</span>` : ""}
      ${it.photo ? `<button class="rm" style="top:10px;right:10px;width:26px;height:26px;font-size:13px" onclick="event.stopPropagation();App.removePhoto('${bookId}','${itemId}')">✕</button>` : ""}
    </div>
    ${it.photo ? "" : `<div style="text-align:center;margin-top:-8px;margin-bottom:10px"><button class="btn btn-secondary btn-sm" onclick="App.uploadPhoto('${bookId}','${itemId}')">为这张卡上传照片</button></div>`}

    <div class="card kv-list">
      <div class="kv"><span class="k">观展语境</span><span class="v">${esc(b.venue)} · ${esc(b.exhibition)} · ${fmtDate(b.visitDate)}</span></div>
      <div class="kv"><span class="k">拍摄时间</span><span class="v ${it.photoTakenAt ? "" : "empty-v"}">${it.photoTakenAt ? "📷 " + esc(it.photoTakenAt) : "未从照片中读取到"}</span></div>
    </div>

    <div class="section-title">匹配状态</div>
    <div class="card status-picker">
      ${Object.entries(STATUS).map(([key, st]) =>
        `<button class="${it.status === key ? "on" : ""}" onclick="App.setStatus('${key}')">${st.label}</button>`).join("")}
      <div style="width:100%;font-size:11px;color:var(--ink-3);margin-top:6px">${STATUS[it.status].desc}</div>
    </div>

    <div class="section-title">展品知识<span style="font-weight:400;color:var(--ink-3)">可修正 · AI 建议仅供参考</span></div>
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
    <div class="field"><label>馆藏来源</label><input class="input" id="it-col" value="${esc(k.collection)}" placeholder="故宫博物院">
      ${k.source ? `<small style="font-size:11px;color:var(--ink-3);display:block;margin-top:5px">信息来源:${esc(k.source)}</small>` : ""}
    </div>

    <div class="section-title">个人经验</div>
    <div class="field"><label>感受</label><textarea class="textarea" id="it-feeling" placeholder="它为什么让你停下来?此刻的记忆、联想与疑问都值得留下…">${esc(e.feeling)}</textarea></div>
    <div class="field"><label>评价</label><div class="stars" id="stars">${stars}</div></div>
    <div class="field"><label>留下的问题</label><input class="input" id="it-question" value="${esc(e.question)}" placeholder="待解答的疑惑,日后回看时可补"></div>
    <div class="field"><label>自定义标签</label>
      <div class="tags" id="tags">${editTmp.tags.map(t => tagChipHtml(t)).join("")}
        <button class="tag-add" onclick="App.addTag()">＋ 标签</button>
      </div>
    </div>
    <div class="switch-row">
      <div class="lab"><b>愿意公开</b><span>仅影响未来分享功能,当前数据不会离开你的设备</span></div>
      <label class="switch"><input type="checkbox" id="it-public" ${e.isPublic ? "checked" : ""}><span class="track"></span></label>
    </div>

    <button class="btn btn-primary btn-block" onclick="App.saveItem()">保存这张展品卡</button>
    <button class="btn btn-danger btn-block" style="margin-top:10px" onclick="App.deleteItem('${bookId}','${itemId}')">删除展品卡</button>
  `), { backdropClose: false });
}
const tagChipHtml = t => `<span class="tag" onclick="App.removeTag('${esc(t)}')">${esc(t)}<span class="x">✕</span></span>`;

/* ================= 新建观展记录(四步流程) ================= */
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
        <button class="add-photo" onclick="document.getElementById('cr-photos').click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          添加照片
        </button>
        <button class="add-photo" onclick="App.addDraftBlank()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          空白展品卡
        </button>
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
      <div class="hint-box">第 4 步 · 即将生成观展记录册</div>
      <div class="card kv-list">
        <div class="kv"><span class="k">展览</span><span class="v">${esc(draft.venue)} · ${esc(draft.exhibition)}</span></div>
        <div class="kv"><span class="k">日期</span><span class="v">${draft.date}</span></div>
        <div class="kv"><span class="k">展品</span><span class="v">${draft.photos.length} 张记录卡(${sug} 个识别建议,${unrec} 张未识别)</span></div>
        <div class="kv"><span class="k">已确认</span><span class="v">${ok} 张</span></div>
        ${t0 ? `<div class="kv"><span class="k">最早拍摄</span><span class="v">📷 ${t0}</span></div>` : ""}
      </div>
      <button class="btn btn-primary btn-block" onclick="App.finishCreate()">生成记录册</button>
      <p style="font-size:11.5px;color:var(--ink-3);text-align:center;margin-top:12px">识别建议仅供参考,生成后你仍可逐张确认、修改或补充。</p>`;
  }
  openSheet(sheetShell("新建观展记录", steps + (body || "")), { backdropClose: false });
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
    const thumb = r.photo.dataUrl
      ? `<img src="${r.photo.dataUrl}" alt="">`
      : posterHTML("空白", "其他", true);
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
    const actions = r.photo.blank ? `<span class="chip st-pending">待补充</span>` :
      r.suggestion ? `
      <button class="btn ${r.decision === "accept" ? "btn-primary" : "btn-secondary"}" onclick="App.decide(${idx},'accept')">${r.decision === "accept" ? "✓ 已确认" : "确认"}</button>
      <button class="btn ${r.decision === "later" ? "btn-ghost" : "btn-ghost"}" style="opacity:${r.decision === "later" ? 1 : .6}" onclick="App.decide(${idx},'later')">稍后</button>` :
      `<span class="chip st-unrecognized">未识别</span>`;
    return `<div class="card rec-card">
      <div class="rec-thumb">${thumb}</div>
      <div class="rec-body">${main}</div>
      <div class="rec-actions">${actions}</div>
    </div>`;
  }).join("");
  document.getElementById("scan-area").innerHTML = `
    <div class="hint-box">第 3 步 · 识别线索(模拟多模态识别 + 馆藏匹配):<b>AI 建议仅供参考</b>,最终由你确认。</div>
    ${cards}
    <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="App.createStep3()">下一步 · 生成记录册</button>`;
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
      experience: { feeling: "", rating: 0, question: "", tags: [], isPublic: false },
      status,
    });
  }
  S.books.unshift(book);
  save();
  draft = null;
  closeAllSheets();
  ui.tab = "records"; render();
  toast("✓ 记录册已生成,去补充感受吧");
  openSheetBook(book.id);
}
const openSheetBook = id => sheetBook(id);

/* ---------------- 展品卡操作 ---------------- */
function setStatus(st) { editTmp.pendingStatus = st; document.querySelectorAll(".status-picker button").forEach(b => b.classList.toggle("on", b.textContent === STATUS[st].label)); }
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
  closeSheet();
  refreshUnderSheets(b.id, it.id);
}
const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };

function refreshUnderSheets(bookId, itemId) {
  /* 关闭后刷新底下的记录册弹层 */
  const hadBook = [...overlayRoot.querySelectorAll(".sheet")].length;
  closeAllSheets();
  if (hadBook && findBook(bookId)) sheetBook(bookId);
  render(false);
}

function addBlankItem(bookId) {
  const b = findBook(bookId);
  if (!b) return;
  const it = {
    id: uid(), photo: null, photoTakenAt: null,
    knowledge: { name: "", artist: "", era: "", medium: "", category: "其他", collection: "", source: "", sourceType: "none" },
    experience: { feeling: "", rating: 0, question: "", tags: [], isPublic: false },
    status: "pending",
  };
  b.items.push(it);
  save();
  closeAllSheets();
  sheetBook(bookId);
  setTimeout(() => openItem(bookId, it.id), 60);
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
    save(); toast("✓ 照片已添加");
    closeAllSheets(); sheetBook(bookId);
    setTimeout(() => openItem(bookId, itemId), 60);
  };
  inp.click();
}
function removePhoto(bookId, itemId) {
  confirmBox("移除照片", "只移除照片,展品卡与感受会保留(显示为占位图)。", [
    { label: "取消" },
    { label: "移除", danger: true, fn: () => {
      const it = findBook(bookId).items.find(x => x.id === itemId);
      it.photo = null; save();
      closeAllSheets(); sheetBook(bookId);
      setTimeout(() => openItem(bookId, itemId), 60);
    } },
  ]);
}
function deleteItem(bookId, itemId) {
  confirmBox("删除展品卡", "这张展品卡及其感受记录将被删除,无法恢复。", [
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
  confirmBox("删除记录册", `「${b.exhibition}」及其中 ${b.items.length} 张展品卡将被删除。建议先导出备份。`, [
    { label: "取消" },
    { label: "删除", danger: true, fn: () => {
      S.books = S.books.filter(x => x.id !== bookId);
      save(); closeAllSheets(); render();
    } },
  ]);
}

/* ---------------- 数据导入导出 ---------------- */
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const exportData = () => { downloadJSON({ app: "zaiguan", version: 1, exportedAt: new Date().toISOString(), books: S.books }, `zaiguan-${todayStr()}.json`); toast("✓ 已导出全部数据"); };
const exportBook = id => { const b = findBook(id); downloadJSON({ app: "zaiguan", version: 1, book: b }, `zaiguan-${b.exhibition}-${todayStr()}.json`); toast("✓ 已导出本册"); };

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
      confirmBox("导入数据", `将导入 ${books.length} 册记录,并<b>覆盖</b>当前全部数据。`, [
        { label: "取消" },
        { label: "导入", fn: () => {
          S.books = books.filter(b => b && b.id && Array.isArray(b.items));
          save(); render(); toast("✓ 导入完成");
        } },
      ]);
    } catch (e) { toast("⚠️ 文件格式无法识别"); }
  };
  reader.readAsText(f);
}
function reseed() {
  confirmBox("恢复示例数据", "将用 3 册示例记录覆盖当前数据。", [
    { label: "取消" },
    { label: "恢复", fn: () => { S.books = seedBooks(); save(); render(); toast("✓ 已恢复示例数据"); } },
  ]);
}
function clearAll() {
  confirmBox("清空所有数据", "本浏览器中的全部观展记录、照片与感受将被彻底删除。", [
    { label: "取消" },
    { label: "全部删除", danger: true, fn: () => { S.books = []; save(); render(); toast("已清空"); } },
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

/* ---------------- 对外 API(inline onclick) ---------------- */
window.App = {
  closeTop: () => closeSheet(),
  openCreate, openBook: sheetBook, openItem: (b, i) => { closeAllSheets(); sheetBook(b); setTimeout(() => openItemSheet(b, i), 40); },
  setFilter: (k, v) => { ui.archive[k] = v; render(false); },
  addBlankItem, uploadPhoto, removePhoto, deleteItem, deleteBook,
  setStatus, rate, addTag, removeTag, saveItem,
  createStep1, addDraftPhotos, addDraftBlank, removeDraftPhoto, createStep2, decide, createStep3, finishCreate,
  exportData, exportBook, importData, reseed, clearAll,
};
const openItemSheet = (b, i) => sheetItem(b, i);

/* ---------------- 启动 ---------------- */
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => { ui.tab = t.dataset.tab; render(); }));
render();
