/* ============================================================
   再观 Rijksstudio — 主应用
   复刻 Rijksmuseum Rijksstudio 三大支柱:
   收藏作品(♥) · 裁剪细节(✂) · 用藏品再创作(Make)
   + 馆藏浏览与颜色筛选(Rijksmuseum 式)
   ============================================================ */

const STORE_KEY = "zaiguan.rs.v1";
const REPO_URL = "https://github.com/KINGKAZMAX/zaiguan";

let S = loadState();
const ui = { tab: "collection", q: "", cat: "全部", hue: "全部" };
let editTmp = null;   // 裁剪/笔记上下文
let cr = null;        // 再创作编辑器状态

/* ---------------- 数据模型 ----------------
   S = {
     likes: [artworkId],
     custom: { id: {id, photo, exifAt, name, artist, era, medium, category, collection, source, hue, createdAt} },
     meta: { id: {crops:[{id,dataUrl,note}], note, rating} },
     sets: [{id,title,note,ids,createdAt}],
     creations: [{id,dataUrl,title,note,createdAt}],
   } ---------------------------------------- */
function blankState() { return { likes: [], custom: {}, meta: {}, sets: [], creations: [] }; }
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const s = JSON.parse(raw); return Object.assign(blankState(), s); }
  } catch (e) {}
  const s = seedState();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); return true; }
  catch (e) { toast("⚠️ 本地存储已满,请导出或删减照片与创作"); return false; }
}

/* ---------------- 藏品解析 ---------------- */
function getArt(id) {
  if (id.startsWith("kb:")) {
    const k = KB[+id.slice(3)];
    if (!k) return null;
    return { id, isKb: true, name: k.name, artist: k.artist, era: k.era, medium: k.medium,
             category: k.category, collection: k.collection, hue: k.hue, photo: null };
  }
  return S.custom[id] || null;
}
function artSrc(aw) {
  return aw.photo ? aw.photo : posterSrc(aw.id, aw.name, aw.hue);
}
function metaOf(id) {
  if (!S.meta[id]) S.meta[id] = { crops: [], note: "", rating: 0 };
  return S.meta[id];
}
function allArtworks() {
  const customs = Object.values(S.custom).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return [...customs, ...KB.map(k => getArt(k.id))];
}

/* ---------------- 骨架 ---------------- */
const view = document.getElementById("view");
function render(scrollTop) {
  const pages = { collection: pageCollection, studio: pageStudio, make: pageMake, settings: pageSettings };
  view.innerHTML = pages[ui.tab]();
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === ui.tab));
  if (scrollTop !== false) view.scrollTop = 0;
}

/* ================= 馆藏 Collection ================= */
function pageCollection() {
  let list = allArtworks();
  if (ui.cat !== "全部") list = list.filter(a => a.category === ui.cat);
  if (ui.hue !== "全部") list = list.filter(a => a.hue === ui.hue);
  if (ui.q) {
    const q = ui.q.toLowerCase();
    list = list.filter(a => [a.name, a.artist, a.era, a.collection, a.medium].join(" ").toLowerCase().includes(q));
  }

  const hueChips = `<button class="hchip ${ui.hue === "全部" ? "on" : ""}" onclick="App.setFilter('hue','全部')">全部</button>` +
    Object.entries(HUES).map(([k, v]) =>
      `<button class="hchip ${ui.hue === k ? "on" : ""}" onclick="App.setFilter('hue','${k}')" title="${v.name}">
        <i style="background:${v.dot}"></i>${v.name}
      </button>`).join("");
  const catChips = ["全部", ...CATEGORIES].map(c =>
    `<button class="fchip ${ui.cat === c ? "on" : ""}" onclick="App.setFilter('cat','${c}')">${c}</button>`).join("");

  const cards = list.map(a => {
    const liked = S.likes.includes(a.id);
    return `<figure class="m-card" onclick="App.openArt('${a.id}')">
      <div class="m-img"><img src="${artSrc(a)}" alt="${esc(a.name)}" loading="lazy">
        <button class="heart ${liked ? "on" : ""}" onclick="event.stopPropagation();App.toggleLike('${a.id}')" aria-label="收藏">♥</button>
        ${a.isKb ? "" : `<span class="mine">我的照片</span>`}
      </div>
      <figcaption>
        <b>${esc(a.name || "未识别展品")}</b>
        <span>${esc(a.artist || "—")}${a.era ? " · " + esc(a.era) : ""}</span>
        <em><i class="dot" style="background:${HUES[a.hue].dot}"></i>${HUES[a.hue].name} · ${esc(a.collection || "我的记录")}</em>
      </figcaption>
    </figure>`;
  }).join("");

  return `<div class="page">
    <header class="masthead">
      <h1>再观 <em>Rijksstudio</em></h1>
      <p class="tagline">观展后个人文化记忆 · 馆藏式收藏 / 裁剪细节 / 再创作</p>
    </header>
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input placeholder="搜索藏品、艺术家、馆藏…" value="${esc(ui.q)}" oninput="App.setFilter('q', this.value)">
    </div>
    <div class="filter-scroll hues">${hueChips}</div>
    <div class="filter-scroll">${catChips}</div>
    <button class="btn btn-primary btn-block" onclick="document.getElementById('up-photos').click()">＋ 上传观展照片</button>
    <input type="file" id="up-photos" accept="image/*" multiple class="hidden" onchange="App.uploadPhotos(this)">
    <div class="label-row"><span class="sec-label">馆藏 Collection</span><span class="sec-count">${list.length} 件</span></div>
    ${list.length ? `<div class="masonry">${cards}</div>` : `<div class="empty"><h3>没有匹配的藏品</h3><p>换个筛选条件试试。</p></div>`}
    <div class="footer-cred">再观 ZAIGUAN · RIJKSSTUDIO</div>
  </div>`;
}

/* ================= 我的 Rijksstudio ================= */
function pageStudio() {
  const liked = S.likes.map(getArt).filter(Boolean);
  const customs = Object.values(S.custom).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const allCrops = [];
  for (const [id, m] of Object.entries(S.meta)) for (const c of m.crops) allCrops.push({ id, crop: c, art: getArt(id) });
  allCrops.reverse();

  const likedCards = liked.map(a => `<figure class="m-card" onclick="App.openArt('${a.id}')">
      <div class="m-img"><img src="${artSrc(a)}" alt="" loading="lazy">
        <button class="heart on" onclick="event.stopPropagation();App.toggleLike('${a.id}')">♥</button></div>
      <figcaption><b>${esc(a.name)}</b><span>${esc(a.artist || "")}</span></figcaption></figure>`).join("");

  const setCards = S.sets.map(s => {
    const first = s.ids.map(getArt).find(Boolean);
    return `<article class="set-card" onclick="App.openSet('${s.id}')">
      <div class="set-cover">${first ? `<img src="${artSrc(first)}" alt="">` : `<div class="cover-blank">空</div>`}
        <span class="set-count">${s.ids.length}</span></div>
      <h3>${esc(s.title)}</h3><time>${(s.createdAt || "").slice(0, 10)}</time>
    </article>`;
  }).join("");

  const cropCards = allCrops.slice(0, 12).map(x => `<figure class="crop-cell" onclick="App.viewCrop('${x.id}','${x.crop.id}')">
      <img src="${x.crop.dataUrl}" alt="" loading="lazy">
      ${x.crop.note ? `<figcaption>${esc(x.crop.note)}</figcaption>` : `<figcaption>《${esc(x.art ? x.art.name : "?")}》细节</figcaption>`}
    </figure>`).join("");

  return `<div class="page">
    <header class="masthead slim"><h1>我的 <em>Rijksstudio</em></h1>
      <p class="tagline">${S.likes.length} 件收藏 · ${allCrops.length} 处细节 · ${S.creations.length} 件创作</p></header>

    <div class="label-row"><span class="sec-label">收藏的作品</span><span class="sec-count">${S.likes.length}</span></div>
    ${liked.length ? `<div class="masonry">${likedCards}</div>`
      : `<p class="empty-line">在馆藏中点按 ♥,喜欢的作品会收进这里。</p>`}

    <div class="label-row"><span class="sec-label">我的观展照片</span><span class="sec-count">${customs.length}</span></div>
    ${customs.length ? `<div class="masonry">${customs.map(a => `<figure class="m-card" onclick="App.openArt('${a.id}')">
        <div class="m-img"><img src="${a.photo}" alt=""><span class="mine">我的照片</span></div>
        <figcaption><b>${esc(a.name || "未识别")}</b><span>${esc(a.artist || "")}</span></figcaption></figure>`).join("")}</div>`
      : `<p class="empty-line">去「馆藏」页上传本次观展拍摄的照片。</p>`}

    <div class="label-row"><span class="sec-label">收藏集 Sets</span><span class="sec-count">${S.sets.length}</span></div>
    <div class="col-grid">${setCards}
      <button class="set-card set-new" onclick="App.newSet()">
        <div class="set-cover"><span class="plus">＋</span></div>
        <h3 style="color:var(--ink-3)">新建收藏集</h3><time>&nbsp;</time></button>
    </div>

    <div class="label-row"><span class="sec-label">我的细节 Details</span><span class="sec-count">${allCrops.length}</span></div>
    ${allCrops.length ? `<div class="crop-wall">${cropCards}</div>`
      : `<p class="empty-line">在作品页点「✂ 裁剪细节」,留住打动你的局部。</p>`}

    <div class="footer-cred">YOUR COLLECTION OF SEEING AGAIN</div>
  </div>`;
}

/* ================= 创作 Make ================= */
function pageMake() {
  const cards = S.creations.map(c => `<figure class="m-card" onclick="App.viewCreation('${c.id}')">
      <div class="m-img"><img src="${c.dataUrl}" alt=""></div>
      <figcaption><b>${esc(c.title || "无题")}</b><span>${esc(c.note || "")}</span><em>${(c.createdAt || "").slice(0, 10)}</em></figcaption>
    </figure>`).join("");
  return `<div class="page">
    <header class="masthead slim"><h1>再创作 <em>Make</em></h1>
      <p class="tagline">用收藏与细节,拼贴你的个人数字策展</p></header>
    <button class="btn btn-primary btn-block" onclick="App.openCreator()">＋ 开始一次再创作</button>
    <div class="hint-box">从「我的细节」和「收藏的作品」中选取素材,在画布上自由拼贴——像 Rijksstudio 一样,让藏品成为你自己的作品。</div>
    <div class="label-row"><span class="sec-label">我的创作</span><span class="sec-count">${S.creations.length}</span></div>
    ${S.creations.length ? `<div class="masonry">${cards}</div>`
      : `<div class="empty"><div class="empty-mark">作</div><h3>还没有创作</h3><p>裁几处细节,收几件作品,<br>然后开始你的第一次拼贴。</p></div>`}
    <div class="footer-cred">MAKE YOUR OWN MASTERPIECE</div>
  </div>`;
}

/* ================= 设置 ================= */
function pageSettings() {
  return `<div class="page">
    <header class="masthead slim"><h1>设置</h1></header>
    <div class="brand-card"><div class="brand-mark">观</div>
      <div><h2>再观 Rijksstudio</h2><p>观展后个人文化记忆系统 · v3.0</p></div></div>

    <div class="label-row"><span class="sec-label">数据</span></div>
    <div class="panel list">
      <button class="list-row" onclick="App.exportData()"><span class="tx">导出全部数据<small>JSON · ${S.likes.length} 收藏 / ${Object.keys(S.custom).length} 照片 / ${S.creations.length} 创作</small></span><span class="arrow">→</span></button>
      <button class="list-row" onclick="document.getElementById('import-file').click()"><span class="tx">导入数据<small>从导出的 JSON 恢复</small></span><span class="arrow">→</span></button>
      <button class="list-row" onclick="App.reseed()"><span class="tx">恢复示例数据<small>体验完整功能</small></span><span class="arrow">→</span></button>
      <button class="list-row" onclick="App.clearAll()"><span class="tx danger">清空所有数据<small>删除本浏览器中的全部记录</small></span><span class="arrow">→</span></button>
    </div>
    <input type="file" id="import-file" accept="application/json" class="hidden" onchange="App.importData(this)">

    <div class="label-row"><span class="sec-label">隐私与人机边界</span></div>
    <div class="panel prose">
      <p><b>数据归属</b> — 照片、细节、创作与笔记仅存于你的浏览器本地,不上传任何服务器,可随时导出或删除。</p>
      <p><b>人机边界</b> — 识别建议仅供参考;收藏、裁剪与再创作,全部由你决定。</p>
    </div>
    <div class="label-row"><span class="sec-label">关于</span></div>
    <div class="panel prose">
      <p>「再观」面向"智艺未来:人工智能时代的艺术生产"论坛主题。产品形态复刻 Rijksmuseum Rijksstudio:馆藏浏览、颜色筛选、收藏、裁剪细节与个人再创作——探索个人数字策展。</p>
      <p class="small">配色逐色提取自 rijksmuseum.nl 生产 CSS。<a href="${REPO_URL}" target="_blank" rel="noopener">github.com/KINGKAZMAX/zaiguan</a></p>
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
    <div class="sheet-head"><button class="x" onclick="App.closeTop()">✕</button>
    <div class="t">${title}</div><div style="width:30px"></div></div>
    <div class="sheet-body">${body}</div>`;
}

/* ================= 藏品页(Artwork) ================= */
function openArt(id) {
  const a = getArt(id);
  if (!a) return;
  const m = metaOf(id);
  editTmp = { id, cropping: false, cropRect: null, rating: m.rating };
  const liked = S.likes.includes(id);
  const rows = [
    ["艺术家", a.artist || "—"],
    ["年代", a.era || "—"],
    ["媒介", a.medium || "—"],
    ["类别", a.category || "—"],
    ["色系", `<i class="dot" style="background:${HUES[a.hue].dot}"></i> ${HUES[a.hue].name}`],
    ["馆藏来源", a.collection || "我的记录"],
  ];
  if (!a.isKb) {
    rows.push(["拍摄时间", a.exifAt ? "📷 " + a.exifAt : "未读取到"]);
    if (a.source) rows.push(["信息来源", a.source]);
  } else {
    rows.push(["信息来源", "再观内置馆藏(示例)"]);
  }
  const crops = m.crops.map(c => `<figure class="crop-card" onclick="App.viewCrop('${id}','${c.id}')">
      <img src="${c.dataUrl}" alt="">${c.note ? `<figcaption>${esc(c.note)}</figcaption>` : ""}</figure>`).join("");

  openSheet(sheetShell("藏品", `
    <button class="btn btn-ghost btn-block back-btn" onclick="App.closeTop()">‹ 返回</button>
    <div class="art-stage" id="art-stage">${artHeroHtml(a, id)}</div>

    <div class="art-title">
      <h2>${esc(a.name || "未识别展品")}</h2>
      <p>${esc(a.artist || "")}${a.era ? " · " + esc(a.era) : ""}</p>
      <div class="art-actions">
        <button class="btn btn-primary btn-sm" onclick="App.startCrop()">✂ 裁剪细节</button>
        <button class="btn ${liked ? "btn-heart-on" : "btn-outline"} btn-sm" onclick="App.toggleLike('${id}',true)">♥ ${liked ? "已收藏" : "收藏"}</button>
        <button class="btn btn-outline btn-sm" onclick="App.setPicker('${id}')">加入收藏集</button>
        <button class="btn btn-outline btn-sm" onclick="App.openCreator('${id}')">用它再创作</button>
      </div>
    </div>

    <div class="panel kv-list">${rows.map(r => `<div class="kv"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join("")}</div>

    <div class="label-row"><span class="sec-label">细节 · Details</span><span class="sec-count">${m.crops.length}</span></div>
    <div class="crops-strip">${crops}
      <button class="crop-card add" onclick="App.startCrop()"><span class="plus">＋</span><figcaption>裁剪新细节</figcaption></button>
    </div>

    <div class="label-row"><span class="sec-label">我的笔记</span></div>
    <div class="stars" id="stars">${[1,2,3,4,5].map(n => `<button class="${n <= m.rating ? "on" : ""}" onclick="App.rate(${n})">★</button>`).join("")}</div>
    <div class="field" style="margin-top:8px">
      <textarea class="textarea" id="art-note" placeholder="它为什么让你停下来?…" onchange="App.saveNote('${id}')">${esc(m.note)}</textarea>
    </div>

    ${a.isKb ? "" : `
    <div class="label-row"><span class="sec-label">修正信息</span></div>
    <div class="row-2">
      <div class="field"><label>作品名称</label><input class="input" id="aw-name" value="${esc(a.name)}"></div>
      <div class="field"><label>作者</label><input class="input" id="aw-artist" value="${esc(a.artist)}"></div>
    </div>
    <button class="btn btn-outline btn-sm" onclick="App.fixCustom('${id}')">保存修正</button>`}
  `), { backdropClose: false });
}
function artHeroHtml(a, id) {
  if (editTmp.cropping) {
    return `<div class="crop-stage" id="crop-stage"
        onpointerdown="App.cropDown(event)" onpointermove="App.cropMove(event)" onpointerup="App.cropUp(event)">
      <img id="crop-img" src="${artSrc(a)}" alt="" draggable="false">
      <div class="crop-box" id="crop-box"></div>
      <div class="crop-hint" id="crop-hint">在图像上拖动,框选你想留住的细节</div>
    </div>
    <div class="crop-bar">
      <button class="btn btn-ghost btn-sm" onclick="App.cancelCrop()">取消</button>
      <button class="btn btn-primary btn-sm" id="crop-save" disabled onclick="App.saveCrop()">保存细节</button>
    </div>`;
  }
  return `<img src="${artSrc(a)}" alt="">
    ${a.exifAt ? `<span class="exif">📷 ${esc(a.exifAt)}</span>` : ""}`;
}

/* ---------------- 裁剪细节(Crop details) ---------------- */
function startCrop() {
  editTmp.cropping = true; editTmp.cropRect = null;
  const a = getArt(editTmp.id);
  const stage = document.getElementById("art-stage");
  if (stage) stage.innerHTML = artHeroHtml(a, editTmp.id);
}
function cancelCrop() {
  editTmp.cropping = false; editTmp.cropRect = null;
  const a = getArt(editTmp.id);
  const stage = document.getElementById("art-stage");
  if (stage) stage.innerHTML = artHeroHtml(a, editTmp.id);
}
function cropDown(ev) {
  const stage = document.getElementById("crop-stage");
  if (!stage) return;
  stage.setPointerCapture(ev.pointerId);
  const r = stage.getBoundingClientRect();
  editTmp.cropStart = { x: clampN(ev.clientX - r.left, 0, r.width), y: clampN(ev.clientY - r.top, 0, r.height) };
  editTmp.cropRect = { x: editTmp.cropStart.x, y: editTmp.cropStart.y, w: 0, h: 0 };
  drawCropBox();
  const hint = document.getElementById("crop-hint");
  if (hint) hint.style.display = "none";
}
function cropMove(ev) {
  if (!editTmp.cropRect || !editTmp.cropStart) return;
  const r = document.getElementById("crop-stage").getBoundingClientRect();
  const x2 = clampN(ev.clientX - r.left, 0, r.width);
  const y2 = clampN(ev.clientY - r.top, 0, r.height);
  editTmp.cropRect = {
    x: Math.min(editTmp.cropStart.x, x2), y: Math.min(editTmp.cropStart.y, y2),
    w: Math.abs(x2 - editTmp.cropStart.x), h: Math.abs(y2 - editTmp.cropStart.y),
  };
  drawCropBox();
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
function saveCrop() {
  const a = getArt(editTmp.id);
  const stageRect = document.getElementById("crop-stage").getBoundingClientRect();
  const r = editTmp.cropRect;
  if (!a || !r || r.w < 10 || r.h < 10) { toast("请先拖动框选一个区域"); return; }
  const img = new Image();
  img.onload = () => {
    const scale = img.naturalWidth / stageRect.width;
    const dataUrl = cropCanvasDataUrl(img, r.x * scale, r.y * scale, r.w * scale, r.h * scale);
    const note = prompt("为这个细节写一句话(可留空)", "") || "";
    metaOf(editTmp.id).crops.push({ id: uid(), dataUrl, note: note.trim() });
    save();
    toast("✓ 细节已保存");
    editTmp.cropping = false; editTmp.cropRect = null;
    closeAllSheets(); openArt(editTmp.id);
  };
  img.onerror = () => toast("⚠️ 图像读取失败");
  img.src = artSrc(a);
}
function viewCrop(artId, cropId) {
  const m = metaOf(artId);
  const c = m.crops.find(x => x.id === cropId);
  const a = getArt(artId);
  if (!c) return;
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="crop-view-box">
    <img src="${c.dataUrl}" alt="">
    ${c.note ? `<p>${esc(c.note)}</p>` : ""}
    <p class="small" style="padding:6px 14px 0">《${esc(a ? a.name : "?")}》细节</p>
    <div class="cb-actions">
      <button data-a="close">关闭</button>
      <button data-a="note">写一句注</button>
      <button data-a="del" class="danger">删除</button>
    </div></div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { ov.remove(); return; }
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    const act = b.dataset.a;
    ov.remove();
    if (act === "note") {
      const note = prompt("为这个细节写一句话", c.note || "") || "";
      c.note = note.trim(); save();
      closeAllSheets(); openArt(artId);
    } else if (act === "del") {
      m.crops = m.crops.filter(x => x.id !== cropId); save();
      toast("已删除细节");
      closeAllSheets(); openArt(artId);
    }
  });
  overlayRoot.appendChild(ov);
}

/* ---------------- 收藏 / 收藏集 ---------------- */
function toggleLike(id, reopen) {
  const i = S.likes.indexOf(id);
  if (i >= 0) S.likes.splice(i, 1); else S.likes.push(id);
  save();
  if (reopen) { closeAllSheets(); openArt(id); } else render(false);
  toast(i >= 0 ? "已取消收藏" : "♥ 已收藏");
}
function newSet(artId) {
  const t = prompt("收藏集名称(如:青绿与山河)");
  if (!t) return;
  const s = { id: uid(), title: t.trim().slice(0, 24), note: "", ids: [], createdAt: todayStr() };
  if (artId) s.ids.push(artId);
  S.sets.push(s); save();
  toast("✓ 收藏集已创建");
  render(false);
  return s;
}
function setPicker(artId) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  const rows = S.sets.map(s => `<button class="list-row" data-set="${s.id}">
      <span class="tx">${esc(s.title)}<small>${s.ids.length} 件 · ${s.ids.includes(artId) ? "已包含此作品" : "点按加入/移出"}</small></span>
      <span class="arrow">${s.ids.includes(artId) ? "✓" : "＋"}</span></button>`).join("");
  ov.innerHTML = `<div class="confirm-box wide">
    <div class="cb-body"><h4>加入收藏集</h4><p>选择一个收藏集</p></div>
    <div style="max-height:44vh;overflow:auto">${rows || `<p class="small" style="padding:14px">还没有收藏集</p>`}</div>
    <div class="cb-actions">
      <button data-a="close">取消</button>
      <button data-a="new">＋ 新建</button>
    </div></div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { ov.remove(); return; }
    const row = e.target.closest("button[data-set]");
    if (row) {
      const s = S.sets.find(x => x.id === row.dataset.set);
      const i = s.ids.indexOf(artId);
      if (i >= 0) s.ids.splice(i, 1); else s.ids.push(artId);
      save(); ov.remove();
      toast(i >= 0 ? "已移出" : "✓ 已加入「" + s.title + "」");
      closeAllSheets(); openArt(artId);
      return;
    }
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    ov.remove();
    if (b.dataset.a === "new") newSet(artId);
  });
  overlayRoot.appendChild(ov);
}
function openSet(setId) {
  const s = S.sets.find(x => x.id === setId);
  if (!s) return;
  const cards = s.ids.map(getArt).filter(Boolean).map(a => `<figure class="m-card" onclick="App.openArtInSet('${setId}','${a.id}')">
      <div class="m-img"><img src="${artSrc(a)}" alt=""></div>
      <figcaption><b>${esc(a.name)}</b><span>${esc(a.artist || "")}</span></figcaption></figure>`).join("");
  openSheet(sheetShell("收藏集", `
    <button class="btn btn-ghost btn-block back-btn" onclick="App.closeTop()">‹ 返回</button>
    <div class="set-head"><h2>${esc(s.title)}</h2>
      <p class="meta">${s.ids.length} 件作品 · ${(s.createdAt || "").slice(0, 10)}</p></div>
    ${cards ? `<div class="masonry">${cards}</div>` : `<p class="empty-line">空收藏集——去作品页点「加入收藏集」。</p>`}
    <button class="btn btn-outline-danger btn-sm btn-block" style="margin-top:8px" onclick="App.deleteSet('${setId}')">删除收藏集</button>
  `));
}
const openArtInSet = (setId, artId) => openArt(artId);
function deleteSet(setId) {
  const s = S.sets.find(x => x.id === setId);
  confirmBox("删除收藏集", `「${s.title}」将被删除(其中的作品不受影响)。`, [
    { label: "取消" },
    { label: "删除", danger: true, fn: () => { S.sets = S.sets.filter(x => x.id !== setId); save(); closeAllSheets(); render(); } },
  ]);
}

/* ---------------- 笔记 / 修正 ---------------- */
function rate(n) {
  editTmp.rating = n;
  metaOf(editTmp.id).rating = n;
  save();
  const box = document.getElementById("stars");
  if (box) [...box.children].forEach((b, i) => b.classList.toggle("on", i < n));
}
function saveNote(id) {
  const el = document.getElementById("art-note");
  if (!el) return;
  metaOf(id).note = el.value.trim();
  save();
}
function fixCustom(id) {
  const a = S.custom[id];
  if (!a) return;
  a.name = (document.getElementById("aw-name").value || "").trim();
  a.artist = (document.getElementById("aw-artist").value || "").trim();
  save(); toast("✓ 已保存");
  closeAllSheets(); openArt(id);
}

/* ---------------- 上传观展照片 + 识别建议 ---------------- */
let uploadDraft = null;
async function uploadPhotos(input) {
  const files = [...input.files];
  input.value = "";
  if (!files.length) return;
  toast(`正在处理 ${files.length} 张照片…`);
  uploadDraft = [];
  for (const f of files) {
    const { dataUrl, rawBuf } = await compressImage(f);
    const hue = await classifyFamily(dataUrl);
    uploadDraft.push({ id: uid(), dataUrl, exifAt: parseExifDate(rawBuf), hue, pick: null });
  }
  renderUploadSheet();
}
function renderUploadSheet() {
  closeAllSheets();
  const rng = mulberry32(hashStr("upload" + uploadDraft.map(p => p.id).join("")));
  /* 每张照片给 3 个确定性候选 + 未识别选项(候选存到照片对象上,pick 时记录) */
  const rows = uploadDraft.map((p, i) => {
    const used = new Set();
    const cands = [];
    while (cands.length < 3) {
      const k = KB[Math.floor(rng() * KB.length)];
      if (used.has(k.id)) continue;
      used.add(k.id);
      cands.push({ k, conf: Math.round(62 + rng() * 35) });
    }
    p.cands = cands;
    const chips = cands.map((c, ci) => `
      <button class="sug ${p.pick === ci ? "on" : ""}" onclick="App.pickSug(${i},${ci})">
        <b>${esc(c.k.name)}</b><span>${esc(c.k.artist)} · ${c.conf}%</span></button>`).join("");
    return `<div class="panel rec-card">
      <div class="rec-thumb"><img src="${p.dataUrl}" alt=""></div>
      <div class="rec-body">
        <b>照片 ${i + 1}${p.exifAt ? ` · 📷 ${p.exifAt}` : ""}</b>
        <span>识别建议(模拟馆藏匹配,仅供参考)</span>
        <div class="sug-row">
          ${chips}
          <button class="sug ${p.pick === -1 ? "on" : ""}" onclick="App.pickSug(${i},-1)"><b>未识别</b><span>稍后自行补充</span></button>
        </div>
      </div></div>`;
  }).join("");
  openSheet(sheetShell("上传观展照片", `
    <div class="hint-box">为每张照片选择一个识别建议(或「未识别」),将作为你的<b>个人藏品</b>加入馆藏页——之后可裁剪细节、加入收藏集、用于再创作。</div>
    ${rows}
    <button class="btn btn-primary btn-block" onclick="App.confirmUpload()">加入我的馆藏(${uploadDraft.length} 件)</button>
  `), { backdropClose: false });
}
const pickSug = (i, ci) => {
  uploadDraft[i].pick = ci;
  uploadDraft[i].pickKb = ci >= 0 ? uploadDraft[i].cands[ci].k : null;
  renderUploadSheet();
};
function confirmUpload() {
  for (const p of uploadDraft) {
    if (p.pick === null || p.pick === undefined) { toast("还有照片未选择识别结果"); return; }
    S.custom[p.id] = {
      id: p.id, photo: p.dataUrl, exifAt: p.exifAt, hue: p.hue,
      name: p.pickKb ? p.pickKb.name : "", artist: p.pickKb ? p.pickKb.artist : "",
      era: p.pickKb ? p.pickKb.era : "", medium: p.pickKb ? p.pickKb.medium : "",
      category: p.pickKb ? p.pickKb.category : "其他", collection: p.pickKb ? p.pickKb.collection : "",
      source: p.pickKb ? "识别建议(模拟)· 可修正" : "自行上传 · 未识别",
      createdAt: todayStr(),
    };
  }
  save();
  const n = uploadDraft.length;
  uploadDraft = null;
  closeAllSheets();
  ui.tab = "collection"; render();
  toast(`✓ ${n} 件已加入我的馆藏`);
}

/* ================= 再创作编辑器(Make) ================= */
const CR_W = 340, CR_H = 453;
function openCreator(seedArtId) {
  cr = { bg: "#FFFFFF", els: [], sel: null, title: "", note: "" };
  if (seedArtId) {
    const a = getArt(seedArtId);
    if (a) cr.els.push({ id: uid(), src: artSrc(a), x: 40, y: 40, w: 260 });
  }
  renderCreator();
}
function renderCreator() {
  closeAllSheets();
  /* 素材库:我的细节 + 收藏 + 我的照片 */
  const mats = [];
  for (const [id, m] of Object.entries(S.meta)) {
    const a = getArt(id);
    m.crops.forEach(c => mats.push({ src: c.dataUrl, label: (a ? a.name : "") + " 细节" }));
  }
  S.likes.forEach(id => { const a = getArt(id); if (a) mats.push({ src: artSrc(a), label: a.name }); });
  Object.values(S.custom).forEach(a => mats.push({ src: a.photo, label: a.name || "我的照片" }));
  const matThumbs = mats.slice(0, 30).map((m, i) =>
    `<button class="mat" onclick="App.addEl(${i})"><img src="${m.src}" alt=""></button>`).join("");

  const elsHtml = cr.els.map((el, i) => {
    const scale = crScale();
    const img = crImgCache[el.id];
    const h = el.w * (img && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1);
    return `<img class="cr-el ${cr.sel === el.id ? "sel" : ""}" src="${el.src}" data-i="${i}" draggable="false"
      style="left:${el.x * scale}px;top:${el.y * scale}px;width:${el.w * scale}px;height:${h * scale}px"
      onpointerdown="App.elDown(event,${i})">`;
  }).join("");

  const bgs = ["#FFFFFF", "#202327", ...Object.values(HUES).map(h => h.dot)];
  const selEl = cr.els.find(e => e.id === cr.sel);

  openSheet(sheetShell("再创作 · Make", `
    <div class="cr-wrap">
      <div class="cr-canvas" id="cr-canvas" style="background:${cr.bg}">${elsHtml}</div>
      <div class="cr-tools">
        ${selEl ? `
          <button class="tool" onclick="App.elScale(0.86)">−</button>
          <button class="tool" onclick="App.elScale(1.16)">＋</button>
          <button class="tool" onclick="App.elLayer(1)">⤒</button>
          <button class="tool" onclick="App.elLayer(-1)">⤓</button>
          <button class="tool del" onclick="App.elDel()">✕</button>
          <span class="tool-hint">选中素材:拖动移动</span>` : `<span class="tool-hint">点按素材选中,拖动移动</span>`}
      </div>
      <div class="cr-palette">${bgs.map(c => `<button class="pdot ${cr.bg === c ? "on" : ""}" style="background:${c}" onclick="App.setBg('${c}')"></button>`).join("")}</div>
      <div class="label-row"><span class="sec-label">素材 · 我的细节与收藏</span></div>
      <div class="mat-strip">${matThumbs || `<p class="small">先去收藏几件作品、裁几处细节,素材会出现在这里。</p>`}</div>
      <div class="field"><label>创作标题</label><input class="input" id="cr-title" value="${esc(cr.title)}" placeholder="如:山河的两种呼吸"></div>
      <div class="field"><label>一句话说明</label><input class="input" id="cr-note" value="${esc(cr.note)}" placeholder="为什么把它们放在一起"></div>
      <button class="btn btn-primary btn-block" ${cr.els.length ? "" : "disabled"} onclick="App.saveCreation()">${cr.els.length ? "保存创作" : "请先添加素材"}</button>
    </div>
  `), { backdropClose: false });
  /* 预载图片以取宽高比 */
  cr.els.forEach((el, i) => {
    if (!crImgCache[el.id]) {
      const im = new Image();
      im.onload = () => { const c = document.getElementById("cr-canvas"); if (c) renderCreator(); };
      im.src = el.src;
      crImgCache[el.id] = im;
    }
  });
}
const crImgCache = {};
function crScale() {
  const c = document.getElementById("cr-canvas");
  return c ? c.clientWidth / CR_W : 1;
}
const addEl = (i) => {
  const mats = matList();
  const m = mats[i];
  if (!m) return;
  const id = uid();
  crImgCache[id] = null;
  const im = new Image();
  im.onload = () => { crImgCache[id] = im; renderCreator(); };
  im.src = m.src;
  crImgCache[id] = im;
  cr.els.push({ id, src: m.src, x: 30 + (cr.els.length % 4) * 24, y: 24 + (cr.els.length % 4) * 22, w: 170 });
  cr.sel = id;
  renderCreator();
};
function matList() {
  const mats = [];
  for (const [id, m] of Object.entries(S.meta)) {
    const a = getArt(id);
    m.crops.forEach(c => mats.push({ src: c.dataUrl, label: (a ? a.name : "") + " 细节" }));
  }
  S.likes.forEach(id => { const a = getArt(id); if (a) mats.push({ src: artSrc(a), label: a.name }); });
  Object.values(S.custom).forEach(a => mats.push({ src: a.photo, label: a.name || "我的照片" }));
  return mats;
}
function elDown(ev, i) {
  const el = cr.els[i];
  cr.sel = el.id;
  const canvas = document.getElementById("cr-canvas");
  const scale = crScale();
  const startX = ev.clientX, startY = ev.clientY;
  const ox = el.x, oy = el.y;
  ev.target.setPointerCapture(ev.pointerId);
  const move = e => {
    el.x = clampN(ox + (e.clientX - startX) / scale, -el.w * 0.7, CR_W - el.w * 0.3);
    el.y = clampN(oy + (e.clientY - startY) / scale, -elH(el) * 0.7, CR_H - 20);
    const node = ev.target;
    node.style.left = el.x * scale + "px";
    node.style.top = el.y * scale + "px";
  };
  const up = () => {
    ev.target.removeEventListener("pointermove", move);
    ev.target.removeEventListener("pointerup", up);
    renderCreator();
  };
  ev.target.addEventListener("pointermove", move);
  ev.target.addEventListener("pointerup", up);
  /* 选中态刷新 */
  document.querySelectorAll(".cr-el").forEach(n => n.classList.toggle("sel", n.dataset.i == i));
  const tools = document.querySelector(".cr-tools");
  if (tools) tools.innerHTML = `
    <button class="tool" onclick="App.elScale(0.86)">−</button>
    <button class="tool" onclick="App.elScale(1.16)">＋</button>
    <button class="tool" onclick="App.elLayer(1)">⤒</button>
    <button class="tool" onclick="App.elLayer(-1)">⤓</button>
    <button class="tool del" onclick="App.elDel()">✕</button>
    <span class="tool-hint">选中素材:拖动移动</span>`;
}
function elH(el) {
  const img = crImgCache[el.id];
  return el.w * (img && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1);
}
const elScale = k => {
  const el = cr.els.find(e => e.id === cr.sel);
  if (!el) return;
  el.w = clampN(el.w * k, 40, 520);
  el.x = clampN(el.x, -el.w * 0.7, CR_W - el.w * 0.3);
  el.y = clampN(el.y, -elH(el) * 0.7, CR_H - 20);
  renderCreator();
};
const elLayer = dir => {
  const i = cr.els.findIndex(e => e.id === cr.sel);
  if (i < 0) return;
  const j = clampN(i + dir, 0, cr.els.length - 1);
  if (i === j) return;
  const [el] = cr.els.splice(i, 1);
  cr.els.splice(j, 0, el);
  renderCreator();
};
const elDel = () => {
  cr.els = cr.els.filter(e => e.id !== cr.sel);
  cr.sel = null;
  renderCreator();
};
const setBg = c => { cr.bg = c; renderCreator(); };

function saveCreation() {
  cr.title = (document.getElementById("cr-title").value || "").trim();
  cr.note = (document.getElementById("cr-note").value || "").trim();
  if (!cr.els.length) return;
  const jobs = cr.els.map(el => new Promise(res => {
    const im = crImgCache[el.id];
    if (im && im.complete && im.naturalWidth) return res(im);
    const i2 = new Image();
    i2.onload = () => res(i2);
    i2.onerror = () => res(null);
    i2.src = el.src;
  }));
  Promise.all(jobs).then(imgs => {
    const k = 2; /* 2x 输出 */
    const cv = document.createElement("canvas");
    cv.width = CR_W * k; cv.height = CR_H * k;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = cr.bg;
    ctx.fillRect(0, 0, cv.width, cv.height);
    cr.els.forEach((el, i) => {
      const im = imgs[i];
      if (!im) return;
      const h = el.w * (im.naturalHeight / im.naturalWidth || 1);
      ctx.drawImage(im, el.x * k, el.y * k, el.w * k, h * k);
    });
    S.creations.unshift({ id: uid(), dataUrl: cv.toDataURL("image/jpeg", 0.88), title: cr.title, note: cr.note, createdAt: todayStr() });
    save();
    cr = null;
    closeAllSheets();
    ui.tab = "make"; render();
    toast("✓ 创作已保存");
  });
}
function viewCreation(id) {
  const c = S.creations.find(x => x.id === id);
  if (!c) return;
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="crop-view-box">
    <img src="${c.dataUrl}" alt="">
    <p style="padding-top:10px"><b>${esc(c.title || "无题")}</b></p>
    ${c.note ? `<p>${esc(c.note)}</p>` : ""}
    <div class="cb-actions">
      <button data-a="close">关闭</button>
      <button data-a="dl">保存图片</button>
      <button data-a="del" class="danger">删除</button>
    </div></div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { ov.remove(); return; }
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    const act = b.dataset.a;
    ov.remove();
    if (act === "dl") {
      const a = document.createElement("a");
      a.href = c.dataUrl;
      a.download = `zaiguan-make-${(c.title || "creation").slice(0, 12)}.jpg`;
      a.click();
    } else if (act === "del") {
      confirmBox("删除创作", "这件创作将被删除(素材不受影响)。", [
        { label: "取消" },
        { label: "删除", danger: true, fn: () => { S.creations = S.creations.filter(x => x.id !== id); save(); render(false); } },
      ]);
    }
  });
  overlayRoot.appendChild(ov);
}

/* ---------------- 数据管理 ---------------- */
function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const exportData = () => { downloadJSON({ app: "zaiguan-rijksstudio", version: 3, exportedAt: new Date().toISOString(), data: S }, `zaiguan-rs-${todayStr()}.json`); toast("✓ 已导出全部数据"); };
function importData(input) {
  const f = input.files[0];
  input.value = "";
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const d = data.data || data;
      if (typeof d !== "object" || !Array.isArray(d.likes)) throw new Error();
      confirmBox("导入数据", "将覆盖当前全部数据。", [
        { label: "取消" },
        { label: "导入", fn: () => { S = Object.assign(blankState(), d); save(); render(); toast("✓ 导入完成"); } },
      ]);
    } catch (e) { toast("⚠️ 文件格式无法识别"); }
  };
  reader.readAsText(f);
}
function reseed() {
  confirmBox("恢复示例数据", "将覆盖当前数据。", [
    { label: "取消" },
    { label: "恢复", fn: () => { S = seedState(); save(); render(); toast("✓ 已恢复示例数据"); } },
  ]);
}
function clearAll() {
  confirmBox("清空所有数据", "收藏、照片、细节与创作将被彻底删除。", [
    { label: "取消" },
    { label: "全部删除", danger: true, fn: () => { S = blankState(); save(); render(); toast("已清空"); } },
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

/* ---------------- 示例数据 ---------------- */
function seedState() {
  const s = blankState();
  s.likes = ["kb:0", "kb:14", "kb:20", "kb:21"];
  s.sets.push({ id: uid(), title: "青绿与山河", note: "", ids: ["kb:0", "kb:3", "kb:19"], createdAt: "2026-09-01" });
  const m0 = metaSeed(s, "kb:0");
  const c0 = posterCanvas("千里江山图", "qing", 520);
  m0.crops.push({ id: uid(), dataUrl: cropCanvasDataUrl(c0, 26, 26, 218, 218), note: "石青山头——最浓的一组青绿" });
  m0.crops.push({ id: uid(), dataUrl: cropCanvasDataUrl(c0, 260, 260, 218, 218), note: "局部笔触,近看只是点与线" });
  m0.note = "在展厅里站了将近二十分钟。石青石绿层层叠开,近看只是笔触,退后一步才是山河。";
  m0.rating = 5;
  const m14 = metaSeed(s, "kb:14");
  const c14 = posterCanvas("青铜大立人像", "zhe", 520);
  m14.crops.push({ id: uid(), dataUrl: cropCanvasDataUrl(c14, 156, 26, 200, 200), note: "中空的手——握住的与缺席的" });
  m14.note = "环绕大立人走了三圈。那双手握成中空的环,握着的东西永远不在了。";
  m14.rating = 5;
  const m20 = metaSeed(s, "kb:20");
  const c20 = posterCanvas("睡莲", "qing", 520);
  m20.crops.push({ id: uid(), dataUrl: cropCanvasDataUrl(c20, 52, 234, 234, 182), note: "水面:没有轮廓的笔触" });
  m20.note = "没有轮廓,只有水的呼吸。";
  m20.rating = 5;
  /* 示例创作:千里江山 × 大立人的手 × 睡莲 */
  const k = 2;
  const cv = document.createElement("canvas");
  cv.width = CR_W * k; cv.height = CR_H * k;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#F4F1EC";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(c0, 36 * k, 30 * k, 268 * k, 268 * k);
  ctx.drawImage(c14, 60 * k, 250 * k, 210 * k, 210 * k);
  ctx.drawImage(c20, 130 * k, 300 * k, 170 * k, 132 * k);
  s.creations.push({ id: uid(), dataUrl: cv.toDataURL("image/jpeg", 0.88), title: "山河、手与水面", note: "三种让我停下来的东西", createdAt: "2026-09-10" });
  return s;
}
function metaSeed(s, id) {
  if (!s.meta[id]) s.meta[id] = { crops: [], note: "", rating: 0 };
  return s.meta[id];
}

/* ---------------- 对外 API ---------------- */
window.App = {
  closeTop: () => closeSheet(),
  setFilter: (k, v) => { ui[k] = v; render(false); },
  openArt, openSet, openArtInSet, newSet, setPicker, deleteSet,
  toggleLike,
  startCrop, cancelCrop, cropDown, cropMove, cropUp, saveCrop, viewCrop,
  rate, saveNote, fixCustom,
  uploadPhotos, pickSug, confirmUpload,
  openCreator, addEl, elDown, elScale, elLayer, elDel, setBg, saveCreation, viewCreation,
  exportData, importData, reseed, clearAll,
};

/* ---------------- 启动 ---------------- */
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => { ui.tab = t.dataset.tab; render(); }));
render();
