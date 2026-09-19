/* ============================================================
   再观 Arena v5 — 应用主体
   Are.na 式个人知识档案:块(block)流 / 频道(channel)/ 连接(connect)
   路由:#/ 探索 · #/channels · #/channel/:id · #/block/:id
        #/me 我的档案 · #/make 创作 · #/settings 设置
   ============================================================ */

"use strict";

/* ---------- 图标 ---------- */
const I = {
  heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8.5-5.9-8.5-11.5C3.5 6.2 5.7 4 8.4 4c1.5 0 2.9.7 3.6 1.9C12.7 4.7 14.1 4 15.6 4c2.7 0 4.9 2.2 4.9 5.5C20.5 15.1 12 21 12 21z"/></svg>',
  heartO: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.5S3.5 14.8 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.6-8.5 11.3-8.5 11.3z"/></svg>',
  conn: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  down: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></svg>',
  crop: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
  zin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M21 21l-4.3-4.3"/></svg>',
  zout: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-4.3-4.3"/></svg>',
  fit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>',
  check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/></svg>',
  edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  layers: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l10 5.5L12 13 2 7.5zM2 12.5L12 18l10-5.5M2 17.5L12 23l10-5.5"/></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
};

const view = document.getElementById("view");
const overlayRoot = document.getElementById("overlay-root");
const toastRoot = document.getElementById("toast-root");

/* ============================================================
   通用 UI
   ============================================================ */
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = msg;
  toastRoot.appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .25s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 280); }, 2100);
}
function openModal(html) {
  closeModal();
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="modal">${html}</div>`;
  ov.addEventListener("pointerdown", e => { if (e.target === ov) closeModal(); });
  overlayRoot.appendChild(ov);
  return ov;
}
function closeModal() { overlayRoot.innerHTML = ""; }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* 远程图加载失败 → 程序化兜底(kb 专属) */
document.addEventListener("error", e => {
  const t = e.target;
  if (!t || t.tagName !== "IMG" || !t.dataset.fb) return;
  const w = workById(t.dataset.fb);
  t.removeAttribute("data-fb");
  if (!w || w.kind === "photo") return;
  t.src = fallbackImage(w);
}, true);

/* ============================================================
   块(block)模型 —— 一切内容皆块
   ============================================================ */
function allBlocks() {
  const list = [];
  KB.forEach(w => list.push({ kind: "kb", id: w.id, w, title: w.name, sub: `${w.artist} · ${w.era}`, img: () => workImage(w, 480), ar: w.ar }));
  state.photos.forEach(w => list.push({ kind: "photo", id: w.id, w, title: w.name, sub: String(w.era), img: () => workImage(w, 480), ar: w.ar }));
  state.crops.forEach(c => {
    const src = workById(c.work);
    list.push({ kind: "crop", id: c.id, c, title: c.note || "未注解的细节", sub: src ? `细节 · ${src.name}` : "细节", img: () => c.data, ar: c.ar || 1 });
  });
  state.texts.forEach(t => list.push({ kind: "text", id: t.id, t, title: "文字碎片", sub: "碎片" }));
  state.creations.forEach(cr => list.push({ kind: "creation", id: cr.id, cr, title: cr.title, sub: "我的创作", img: () => cr.data, ar: 680 / 906 }));
  return list;
}
function blockById(id) { return allBlocks().find(b => b.id === id); }
function isLiked(id) { return state.likes.includes(id); }
function toggleLike(id) {
  const i = state.likes.indexOf(id);
  if (i >= 0) state.likes.splice(i, 1); else state.likes.push(id);
  saveState();
  return i < 0;
}

/* ---------- 块卡片(masonry 内) ---------- */
function blockCard(b) {
  if (b.kind === "text") {
    return `<a class="tblk" href="#/block/${encodeURIComponent(b.id)}">
      <div class="tblk__body">${esc(b.t.text.slice(0, 220))}${b.t.text.length > 220 ? "…" : ""}</div>
      <div class="tblk__m">文字碎片 · ${fmtDate(b.t.created)}</div>
    </a>`;
  }
  const liked = isLiked(b.id);
  return `<a class="blk" href="#/block/${encodeURIComponent(b.id)}">
    <div class="blk__imgwrap">
      ${b.kind === "photo" ? '<span class="blk__badge">我的照片</span>' : ""}
      ${b.kind === "creation" ? '<span class="blk__badge">创作</span>' : ""}
      ${b.kind === "crop" ? '<span class="blk__badge">细节</span>' : ""}
      <div class="blk__acts">
        <button class="bact ${liked ? "is-on" : ""}" data-like="${b.id}" title="收藏">${liked ? I.heart : I.heartO}</button>
        <button class="bact" data-conn="${b.id}" title="连接到频道">${I.conn}</button>
      </div>
      <img src="${b.img()}" ${b.kind === "kb" ? `data-fb="${esc(b.id)}"` : ""} alt="${esc(b.title)}" loading="lazy"
           ${b.ar ? `style="aspect-ratio:${b.ar}"` : ""}>
    </div>
    <div class="blk__cap">
      <div class="blk__t">${esc(b.title)}</div>
      <div class="blk__m">${esc(b.sub)}</div>
    </div>
  </a>`;
}

/* 全局:卡片上的 ♥ 与 ＋ 连接(事件委托) */
document.addEventListener("click", e => {
  const lk = e.target.closest("[data-like]");
  if (lk) {
    e.preventDefault(); e.stopPropagation();
    const on = toggleLike(lk.dataset.like);
    lk.classList.toggle("is-on", on);
    lk.innerHTML = on ? I.heart : I.heartO;
    toast(on ? "已收藏" : "已取消收藏");
    return;
  }
  const cn = e.target.closest("[data-conn]");
  if (cn) {
    e.preventDefault(); e.stopPropagation();
    connectModal(cn.dataset.conn);
  }
});

/* ============================================================
   路由
   ============================================================ */
function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  return { seg: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
}
let current = parseHash();
window.addEventListener("hashchange", () => { current = parseHash(); render(); window.scrollTo(0, 0); });
document.addEventListener("zaiguan:photo-ready", () => { const y = window.scrollY; render(); window.scrollTo(0, y); });

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const v = document.getElementById("search-input").value.trim();
  location.hash = "#/" + (v ? "?q=" + encodeURIComponent(v) : "");
});
document.getElementById("add-btn").addEventListener("click", addModal);

function setActiveNav(key) {
  document.querySelectorAll(".topnav a").forEach(a => a.classList.toggle("is-active", a.dataset.nav === key));
}
function render() {
  const [root, a] = current.seg;
  closeModal();
  document.body.dataset.route = root || "home";
  if (!root) return viewHome();
  if (root === "channels") return viewChannels();
  if (root === "channel" && a) return viewChannel(decodeURIComponent(a));
  if (root === "block" && a) return viewBlock(decodeURIComponent(a));
  if (root === "me") return viewMe();
  if (root === "make") return viewMake();
  if (root === "settings") return viewSettings();
  viewHome();
}

/* ============================================================
   探索(全部块流)
   ============================================================ */
function streamHref(over) {
  const p = new URLSearchParams();
  const merged = { q: current.q.get("q"), cat: current.q.get("cat"), hue: current.q.get("hue"), ...over };
  Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return "#/" + (s ? "?" + s : "");
}

function filterBlocks(list) {
  const q = current.q.get("q") || "";
  const cat = current.q.get("cat") || "";
  const hue = current.q.get("hue") || "";
  let out = list;
  if (cat === "我的照片") out = out.filter(b => b.kind === "photo");
  else if (cat === "碎片") out = out.filter(b => b.kind === "text");
  else if (cat === "细节") out = out.filter(b => b.kind === "crop");
  else if (cat === "创作") out = out.filter(b => b.kind === "creation");
  else if (cat) out = out.filter(b => b.kind === "kb" && b.w.category === cat);
  if (hue) out = out.filter(b => (b.kind === "kb" || b.kind === "photo") && b.w.hue === hue);
  if (q) {
    const k = q.toLowerCase();
    out = out.filter(b => [b.title, b.sub, b.kind === "kb" ? [b.w.medium, b.w.collection, b.w.desc].join(" ") : ""].join(" ").toLowerCase().includes(k));
  }
  return out;
}

function viewHome() {
  setActiveNav("home");
  const q = current.q.get("q") || "";
  const cat = current.q.get("cat") || "";
  const hue = current.q.get("hue") || "";
  if (q) document.getElementById("search-input").value = q;
  const cats = [...CATEGORIES, "我的照片", "碎片", "细节", "创作"];
  const list = filterBlocks(allBlocks());

  view.innerHTML = `
  <div class="container page">
    <div class="pagehead">
      <h1>${q ? `“${esc(q)}”` : "探索"}</h1>
      <span class="sub">${q ? "的搜索结果 · " : "全部块 · "}把碎片收进频道,让观看留下痕迹</span>
    </div>
    <div class="toolrow">
      <div class="chips">
        <a class="chip ${!cat ? "is-on" : ""}" href="${streamHref({ cat: "", hue: "" })}">全部</a>
        ${cats.map(c => `<a class="chip ${cat === c ? "is-on" : ""}" href="${streamHref({ cat: c, hue: "" })}">${c}</a>`).join("")}
      </div>
      <div class="dots">
        <span class="hint" style="font-size:var(--fs1)">色系</span>
        <a class="dot ${!hue ? "is-on" : ""}" style="background:conic-gradient(#cc4c28,#aaa04d,#52755c,#436178,#202327,#cc4c28)" href="${streamHref({ hue: "" })}"></a>
        ${HUE_IDS.map(id => `<a class="dot ${hue === id ? "is-on" : ""}" style="background:${HUES[id].dot}" href="${streamHref({ hue: id })}" title="${HUES[id].name}"></a>`).join("")}
      </div>
      <span class="count">${list.length} 块</span>
    </div>
    ${list.length ? `<div class="masonry">${list.map(blockCard).join("")}</div>`
      : `<div class="empty"><h3>没有匹配的块</h3><p>换个关键词,或清除筛选。</p><a class="lnk" href="#/">浏览全部</a></div>`}
    <footer class="foot" style="margin-top:45px">
      <span>再观 · 观展后的个人知识档案</span>
      <span>形态参考 are.na · 真实影像来自 Wikimedia Commons · 数据仅存本机</span>
    </footer>
  </div>`;
}

/* ============================================================
   块详情(图像 → 观看台;文字 → 衬线页)
   ============================================================ */
function viewBlock(id) {
  setActiveNav("");
  const b = blockById(id);
  if (!b) { view.innerHTML = `<div class="container page empty"><h3>块不存在</h3><a class="lnk" href="#/">返回探索</a></div>`; return; }
  const liked = isLiked(id);
  const inChannels = state.channels.filter(c => c.items.includes(id));

  if (b.kind === "text") {
    view.innerHTML = `
    <div class="container page">
      <div class="bdetail">
        <div><div class="btext">${esc(b.t.text)}</div></div>
        <aside>
          <div class="bside__t">文字碎片</div>
          <div class="bside__m">${fmtDate(b.t.created)} · ${inChannels.length ? inChannels.map(c => esc(c.name)).join(" / ") : "未连接频道"}</div>
          <div class="acts">
            <button class="act" id="a-conn">${I.conn} 连接到频道</button>
            <button class="act" id="a-make">${I.edit} 拿去创作</button>
            <button class="act act--danger" id="a-del">${I.trash} 删除碎片</button>
          </div>
          <p class="hint">文字会以衬线体进入创作画布。</p>
        </aside>
      </div>
    </div>`;
    document.getElementById("a-conn").addEventListener("click", () => connectModal(id));
    document.getElementById("a-make").addEventListener("click", () => {
      makeStashText = b.t.text.slice(0, 60);
      location.hash = "#/make";
    });
    document.getElementById("a-del").addEventListener("click", () => {
      if (confirm("删除这条碎片?")) {
        state.texts = state.texts.filter(t => t.id !== id);
        state.channels.forEach(c => c.items = c.items.filter(x => x !== id));
        saveState(); toast("碎片已删除");
        location.hash = "#/";
      }
    });
    return;
  }

  /* 图像块 */
  const bigSrc = b.kind === "kb" || b.kind === "photo" ? workImage(b.w, 1080) : b.img();
  const canCrop = b.kind === "kb" || b.kind === "photo";
  const isOwn = b.kind !== "kb";
  view.innerHTML = `
  <div class="container page">
    <div class="bdetail">
      <div>
        <div class="bstage" id="stage">
          <div class="bstage__inner" id="vstage">
            <img class="bstage__img" id="vimg" alt="${esc(b.title)}" src="${bigSrc}"
                 ${canCrop ? 'crossorigin="anonymous"' : ""} ${b.kind === "kb" ? `data-fb="${esc(b.id)}"` : ""}
                 draggable="false">
          </div>
          <div class="bstage__bar" id="vbar">
            <button class="sbtn" id="v-zin" title="放大">${I.zin}</button>
            <button class="sbtn" id="v-zout" title="缩小">${I.zout}</button>
            <button class="sbtn" id="v-fit" title="适配">${I.fit}</button>
            <span style="flex:1"></span>
            ${canCrop ? `<button class="sbtn sbtn--wide" id="v-crop">${I.crop} 裁剪细节</button>` : ""}
          </div>
        </div>
        ${b.kind === "kb" && relatedOf(b).length ? `
        <div class="pagehead" style="margin-top:35px"><h1 style="font-size:var(--fs4)">同色系</h1><span class="sub">继续看</span></div>
        <div class="masonry" style="columns:4 200px">${relatedOf(b).map(blockCard).join("")}</div>` : ""}
      </div>

      <aside>
        <div class="bside__t">${esc(b.title)}</div>
        <div class="bside__m">${esc(b.sub)}</div>
        <div class="acts">
          <button class="act ${liked ? "is-on" : ""}" id="a-like">${liked ? I.heart + " 已收藏" : I.heartO + " 收藏"}</button>
          <button class="act" id="a-conn">${I.conn} 连接到频道${inChannels.length ? ` · ${inChannels.length}` : ""}</button>
          ${canCrop ? `<button class="act" id="a-crop2">${I.crop} 裁剪细节</button>` : ""}
          <button class="act" id="a-make">${I.edit} 拿去创作</button>
          <button class="act" id="a-dl">${I.down} 下载图片</button>
          ${isOwn ? `<button class="act act--danger" id="a-del">${I.trash} 删除这个${b.kind === "photo" ? "照片" : b.kind === "crop" ? "细节" : "创作"}</button>` : ""}
        </div>
        <table class="meta">${b.kind === "kb" ? kbMeta(b.w) : ownMeta(b)}</table>
        ${b.kind === "kb" ? noteBox(b.w.id) : ""}
      </aside>
    </div>
  </div>`;

  initViewer(b);
  document.getElementById("a-like").addEventListener("click", () => { toggleLike(id); viewBlock(id); });
  document.getElementById("a-conn").addEventListener("click", () => connectModal(id));
  document.getElementById("a-crop2")?.addEventListener("click", () => document.getElementById("v-crop")?.click());
  document.getElementById("a-dl").addEventListener("click", () => {
    fetch(bigSrc).then(r => r.blob())
      .then(bl => downloadDataUrl(URL.createObjectURL(bl), `${b.title}-再观.jpg`))
      .catch(() => downloadDataUrl(bigSrc, `${b.title}-再观.jpg`));
  });
  document.getElementById("a-make").addEventListener("click", () => {
    makeStash = [{ src: b.kind === "kb" ? workImage(b.w, 480) : b.img(), ar: b.ar || 1 }];
    location.hash = "#/make";
  });
  document.getElementById("a-del")?.addEventListener("click", () => {
    if (!confirm("确定删除?")) return;
    if (b.kind === "photo") state.photos = state.photos.filter(p => p.id !== id);
    if (b.kind === "crop") state.crops = state.crops.filter(c => c.id !== id);
    if (b.kind === "creation") state.creations = state.creations.filter(c => c.id !== id);
    state.channels.forEach(c => c.items = c.items.filter(x => x !== id));
    state.likes = state.likes.filter(x => x !== id);
    saveState(); toast("已删除");
    location.hash = "#/";
  });

  const noteInput = document.getElementById("note-input");
  if (noteInput) {
    let deb = null;
    noteInput.addEventListener("input", () => {
      clearTimeout(deb);
      deb = setTimeout(() => {
        state.notes[id] = { ...(state.notes[id] || {}), text: noteInput.value };
        saveState();
      }, 500);
    });
  }
}

function kbMeta(w) {
  const hue = HUES[w.hue] || HUES.yuebai;
  return `
    <tr><th>作者</th><td>${esc(w.artist)}</td></tr>
    <tr><th>年代</th><td>${esc(w.era)}</td></tr>
    <tr><th>媒介</th><td>${esc(w.medium)}</td></tr>
    <tr><th>类别</th><td>${esc(w.category)}</td></tr>
    <tr><th>色系</th><td>${hue.name}</td></tr>
    <tr><th>馆藏</th><td>${esc(w.collection)}</td></tr>
    ${w.src ? `<tr><th>来源</th><td><a class="uline" href="https://commons.wikimedia.org/wiki/${encodeURIComponent(w.src)}" target="_blank" rel="noopener">Wikimedia Commons</a></td></tr>` : ""}
    ${w.desc ? `<tr><th>简介</th><td style="line-height:1.7">${esc(w.desc)}</td></tr>` : ""}`;
}
function ownMeta(b) {
  const rows = [];
  if (b.kind === "photo") rows.push(["拍摄", b.w.era], ["色系", (HUES[b.w.hue] || {}).name || ""], ["归类", "我的照片"]);
  if (b.kind === "crop") { const s = workById(b.c.work); rows.push(["来自", s ? s.name : "已删除"], ["加入", fmtDate(b.c.created)]); }
  if (b.kind === "creation") rows.push(["导出于", fmtDate(b.cr.created)], ["尺寸", "680 × 906"]);
  rows.push(["所在频道", state.channels.filter(c => c.items.includes(b.id)).map(c => c.name).join("、") || "未连接"]);
  return rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join("");
}
function relatedOf(b) {
  return allBlocks().filter(x => x.kind === "kb" && x.w.hue === b.w.hue && x.id !== b.id).slice(0, 4);
}
function noteBox(wid) {
  const n = state.notes[wid] || {};
  return `
  <div class="field">
    <label>观展笔记(只存在本机)</label>
    <textarea class="textin" id="note-input" placeholder="为什么在这件作品前停下来?">${esc(n.text || "")}</textarea>
  </div>`;
}

/* ---------- 观看台(缩放/平移/裁剪) ---------- */
function initViewer(b) {
  const stage = document.getElementById("vstage");
  const img = document.getElementById("vimg");
  let s = 1, tx = 0, ty = 0, fitS = 1, userTouched = false;

  const apply = () => { img.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; };
  const doFit = () => {
    const r = stage.getBoundingClientRect();
    if (r.width < 40 || !img.naturalWidth) return;
    fitS = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight) * 0.96;
    s = fitS;
    tx = (r.width - img.naturalWidth * s) / 2;
    ty = (r.height - img.naturalHeight * s) / 2;
    apply();
  };
  const scheduleFit = () => requestAnimationFrame(() => requestAnimationFrame(() => { if (!userTouched) doFit(); }));
  img.addEventListener("load", () => {
    scheduleFit();
    setTimeout(() => { if (!userTouched && !cropMode) doFit(); }, 350);
  }, { once: true });
  if (img.complete && img.naturalWidth) scheduleFit();
  [100, 300, 700].forEach(d => setTimeout(() => { if (!userTouched && !cropMode) doFit(); }, d));
  let rsT = null;
  window.addEventListener("resize", () => { clearTimeout(rsT); rsT = setTimeout(() => { if (!cropMode) doFit(); }, 150); });
  // 决定性修复:舞台尺寸一旦稳定(瞬态布局→最终布局),自动重新适配
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => { if (!userTouched && !cropMode) doFit(); }).observe(stage);
  }

  const zoomAt = (mx, my, f) => {
    userTouched = true;
    const ns = Math.min(12, Math.max(fitS * 0.5, s * f));
    tx = mx - (mx - tx) * (ns / s);
    ty = my - (my - ty) * (ns / s);
    s = ns; apply();
  };
  stage.addEventListener("wheel", e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.16 : 1 / 1.16);
  }, { passive: false });

  let pan = null;
  stage.addEventListener("pointerdown", e => {
    if (cropMode || e.target.closest(".cropbox")) return;
    userTouched = true;
    pan = { x: e.clientX - tx, y: e.clientY - ty, id: e.pointerId };
    try { stage.setPointerCapture(e.pointerId); } catch {}
  });
  window.addEventListener("pointermove", e => {
    if (!pan || pan.id !== e.pointerId) return;
    tx = e.clientX - pan.x; ty = e.clientY - pan.y; apply();
  });
  window.addEventListener("pointerup", e => { if (pan && pan.id === e.pointerId) pan = null; });
  stage.addEventListener("dblclick", e => {
    const r = stage.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, 2);
  });

  document.getElementById("v-zin").addEventListener("click", () => { const r = stage.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.4); });
  document.getElementById("v-zout").addEventListener("click", () => { const r = stage.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.4); });
  document.getElementById("v-fit").addEventListener("click", doFit);

  /* ---------- 裁剪 → 细节块 ---------- */
  let cropMode = false;
  document.getElementById("v-crop")?.addEventListener("click", () => {
    cropMode = true;
    const bar = document.getElementById("vbar");
    const cropBtnEl = document.getElementById("v-crop");
    cropBtnEl.style.display = "none";
    bar.insertAdjacentHTML("beforeend", `
      <button class="sbtn sbtn--wide sbtn--primary" id="crop-ok">${I.check} 确认裁剪</button>
      <button class="sbtn sbtn--wide" id="crop-no">${I.x} 取消</button>`);

    const r = stage.getBoundingClientRect();
    const bw = Math.min(r.width * 0.56, r.height * 0.62);
    const bh = bw / Math.max(0.6, Math.min(1.8, b.ar || 1));
    const box = document.createElement("div");
    box.className = "cropbox";
    box.style.left = (r.width - bw) / 2 + "px";
    box.style.top = (r.height - bh) / 2 + "px";
    box.style.width = bw + "px";
    box.style.height = bh + "px";
    box.innerHTML = `<div class="cropbox__h" data-h="nw"></div><div class="cropbox__h" data-h="ne"></div>
      <div class="cropbox__h" data-h="sw"></div><div class="cropbox__h" data-h="se"></div>
      <div class="cropbox__size"></div>`;
    stage.appendChild(box);
    const sizeLbl = box.querySelector(".cropbox__size");
    const updSize = () => { sizeLbl.textContent = `${Math.round(box.offsetWidth / s)} × ${Math.round(box.offsetHeight / s)} px`; };
    updSize();
    const clampBox = () => {
      const R = stage.getBoundingClientRect();
      let x = parseFloat(box.style.left), y = parseFloat(box.style.top);
      let W = parseFloat(box.style.width), H = parseFloat(box.style.height);
      W = Math.max(44, Math.min(W, R.width)); H = Math.max(44, Math.min(H, R.height));
      x = Math.max(0, Math.min(x, R.width - W)); y = Math.max(0, Math.min(y, R.height - H));
      box.style.left = x + "px"; box.style.top = y + "px";
      box.style.width = W + "px"; box.style.height = H + "px";
    };
    box.addEventListener("pointerdown", e => {
      e.preventDefault(); e.stopPropagation();
      try { box.setPointerCapture(e.pointerId); } catch {}
      const h = e.target.dataset.h;
      const start = { x: e.clientX, y: e.clientY, l: parseFloat(box.style.left), t: parseFloat(box.style.top), w: parseFloat(box.style.width), hh: parseFloat(box.style.height) };
      const move = ev => {
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (!h) { box.style.left = start.l + dx + "px"; box.style.top = start.t + dy + "px"; }
        else {
          let { l, t, w: W, hh: H } = start;
          if (h.includes("e")) W = start.w + dx;
          if (h.includes("s")) H = start.hh + dy;
          if (h.includes("w")) { W = start.w - dx; l = start.l + dx; }
          if (h.includes("n")) { H = start.hh - dy; t = start.t + dy; }
          box.style.width = Math.max(44, W) + "px"; box.style.height = Math.max(44, H) + "px";
          box.style.left = l + "px"; box.style.top = t + "px";
        }
        clampBox(); updSize();
      };
      const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });

    const exitCrop = () => {
      cropMode = false;
      document.getElementById("crop-ok")?.remove();
      document.getElementById("crop-no")?.remove();
      cropBtnEl.style.display = "";
    };
    document.getElementById("crop-no").addEventListener("click", () => { box.remove(); exitCrop(); });
    document.getElementById("crop-ok").addEventListener("click", () => {
      const bx = box.getBoundingClientRect(), R = stage.getBoundingClientRect();
      const ix = (bx.left - R.left - tx) / s, iy = (bx.top - R.top - ty) / s;
      const iw = bx.width / s, ih = bx.height / s;
      const cw = img.naturalWidth, ch = img.naturalHeight;
      const cx0 = Math.max(0, Math.min(ix, cw - 8)), cy0 = Math.max(0, Math.min(iy, ch - 8));
      const cx1 = Math.min(cw, Math.max(8, ix + iw)), cy1 = Math.min(ch, Math.max(8, iy + ih));
      const rw = Math.round(cx1 - cx0), rh = Math.round(cy1 - cy0);
      if (rw < 16 || rh < 16) { toast("裁剪区域太小"); return; }
      const k = Math.min(1, 900 / Math.max(rw, rh));
      const cv = document.createElement("canvas");
      cv.width = Math.round(rw * k); cv.height = Math.round(rh * k);
      cv.getContext("2d").drawImage(img, cx0, cy0, rw, rh, 0, 0, cv.width, cv.height);
      const crop = { id: uid("crop"), work: b.id, data: cv.toDataURL("image/jpeg", 0.88), note: "", ar: rw / rh, created: Date.now() };
      state.crops.unshift(crop); saveState();
      box.remove(); exitCrop();
      cropModal(crop, b);
    });
  });
}

/* 裁剪成功 → 注释 + 去创作 */
function cropModal(crop, b) {
  const ov = openModal(`
    <h3>已裁下一块细节</h3>
    <p class="modal__sub">来自《${esc(b.title)}》· 已存入「我的档案 · 细节」</p>
    <img src="${crop.data}" style="width:100%;border:1px solid var(--line);border-radius:3px;margin-bottom:14px" alt="">
    <div class="field">
      <label>给这个细节写一句注(可选)</label>
      <input class="textin" id="crop-note" placeholder="比如:鹤的丹顶,一点朱砂。" maxlength="60">
    </div>
    <div class="modal__acts">
      <button class="mkbtn" id="cm-done">存入档案</button>
      <button class="mkbtn mkbtn--dark" id="cm-make">${I.plus} 拿去创作</button>
    </div>`);
  ov.querySelector("#cm-done").addEventListener("click", () => {
    crop.note = ov.querySelector("#crop-note").value.trim();
    saveState(); closeModal(); toast("细节已入档案");
  });
  ov.querySelector("#cm-make").addEventListener("click", () => {
    crop.note = ov.querySelector("#crop-note").value.trim();
    saveState(); closeModal();
    makeStash = [{ src: crop.data, ar: crop.ar }];
    location.hash = "#/make";
  });
}

/* ============================================================
   连接(connect)—— Are.na 核心:把块收进频道
   ============================================================ */
function connectModal(blockId) {
  const b = blockById(blockId);
  openModal(`
    <h3>连接到频道</h3>
    <p class="modal__sub">${b ? `「${esc(b.title)}」` : "这个块"}会出现在所选频道里。</p>
    <div id="chlist">
      ${state.channels.length ? state.channels.map(c => `
        <div class="chrow ${c.items.includes(blockId) ? "is-on" : ""}" data-ch="${c.id}">
          <span class="cb">${I.check}</span><b>${esc(c.name)}</b><span>${c.items.length} 块</span>
        </div>`).join("") : `<p class="hint" style="padding:6px 0 12px">还没有频道,在下面建一个。</p>`}
    </div>
    <div class="row" style="margin-top:14px">
      <input class="textin grow" id="newch-name" placeholder="新频道名,如「山水的一种看法」" maxlength="24">
      <button class="mkbtn mkbtn--dark" id="newch-go">新建并连接</button>
    </div>
    <div class="modal__acts"><button class="mkbtn" id="conn-close">完成</button></div>`);
  overlayRoot.firstElementChild.querySelector("#chlist").addEventListener("click", e => {
    const row = e.target.closest(".chrow"); if (!row) return;
    const ch = state.channels.find(x => x.id === row.dataset.ch);
    const i = ch.items.indexOf(blockId);
    if (i >= 0) ch.items.splice(i, 1); else ch.items.push(blockId);
    saveState(); row.classList.toggle("is-on", i < 0);
    row.querySelector("span:last-child").textContent = ch.items.length + " 块";
    toast(i < 0 ? `已连接「${esc(ch.name)}」` : `已移出「${esc(ch.name)}」`);
  });
  const ovEl = overlayRoot.firstElementChild;
  ovEl.querySelector("#newch-go").addEventListener("click", () => {
    const name = ovEl.querySelector("#newch-name").value.trim();
    if (!name) { toast("先给频道起个名字"); return; }
    state.channels.unshift({ id: uid("ch"), name, desc: "", items: [blockId], created: Date.now() });
    saveState(); toast(`频道「${esc(name)}」已建立`);
    connectModal(blockId);
  });
  ovEl.querySelector("#conn-close").addEventListener("click", closeModal);
}

/* ============================================================
   添加块(＋:文字碎片 / 上传照片)
   ============================================================ */
function addModal() {
  const ov = openModal(`
    <h3>添加一个块</h3>
    <p class="modal__sub">碎片是档案的最小单位——一句话、一张观展照片,都算。</p>
    <div class="seg">
      <button type="button" class="is-on" data-at="text">写一条碎片</button>
      <button type="button" data-at="img">上传照片</button>
    </div>
    <div id="add-text">
      <textarea class="textin" id="frag-text" placeholder="今天在展厅里记住的一句话、一个瞬间…" maxlength="500"></textarea>
    </div>
    <div id="add-img" class="hidden">
      <div class="empty" style="padding:28px 18px" id="upzone" role="button" tabindex="0">
        <h3 style="font-size:var(--fs3)">选择或拖入观展照片</h3>
        <p class="hint">自动读取拍摄时间(EXIF)并按主色归入色系 · 仅存本机</p>
        <input type="file" id="frag-file" accept="image/*" multiple hidden>
      </div>
    </div>
    <div class="modal__acts">
      <button class="mkbtn" id="add-close">取消</button>
      <button class="mkbtn mkbtn--dark" id="add-ok">加入档案</button>
    </div>`);
  ov.querySelectorAll(".seg button").forEach(btn => btn.addEventListener("click", () => {
    ov.querySelectorAll(".seg button").forEach(x => x.classList.remove("is-on"));
    btn.classList.add("is-on");
    ov.querySelector("#add-text").classList.toggle("hidden", btn.dataset.at !== "text");
    ov.querySelector("#add-img").classList.toggle("hidden", btn.dataset.at !== "img");
  }));
  const zone = ov.querySelector("#upzone"), file = ov.querySelector("#frag-file");
  zone.addEventListener("click", () => file.click());
  zone.addEventListener("keydown", e => { if (e.key === "Enter") file.click(); });
  ["dragover", "dragenter"].forEach(ev => zone.addEventListener(ev, e => e.preventDefault()));
  zone.addEventListener("drop", e => { e.preventDefault(); if (e.dataTransfer.files.length) { closeModal(); ingestFiles(e.dataTransfer.files); } });
  file.addEventListener("change", () => { if (file.files.length) { closeModal(); ingestFiles(file.files); } });
  ov.querySelector("#add-ok").addEventListener("click", () => {
    const t = ov.querySelector("#frag-text").value.trim();
    if (!t) { toast("写点什么再保存"); return; }
    state.texts.unshift({ id: uid("txt"), text: t, created: Date.now() });
    saveState(); closeModal(); toast("碎片已入档案");
    render();
  });
  ov.querySelector("#add-close").addEventListener("click", closeModal);
}

async function ingestFiles(files) {
  let n = 0;
  for (const f of files) {
    if (!f.type.startsWith("image/")) continue;
    try { await ingestPhoto(f); n++; } catch {}
  }
  if (n) { toast(`已收录 ${n} 张照片`); render(); }
  else toast("未能读取图片");
}

/* ============================================================
   频道
   ============================================================ */
const DEMO_CHANNELS = [
  { id: "demo:1", name: "夏季山水", author: "再观编辑部", date: "2026-08-12", items: ["kb:0", "kb:4", "kb:2", "kb:8"], desc: "看山看水,过一个清凉的夏天。" },
  { id: "demo:2", name: "青铜之魂", author: "再观编辑部", date: "2026-07-30", items: ["kb:11", "kb:12", "kb:13", "kb:14", "kb:15", "kb:25"], desc: "狞厉与浪漫并存的礼器时代。" },
  { id: "demo:3", name: "金色黄昏", author: "再观编辑部", date: "2026-06-18", items: ["kb:16", "kb:17", "kb:22", "kb:5"], desc: "一切与金子有关的光。" },
];

function channelCover(ch, n = 4) {
  const blocks = ch.items.map(blockById).filter(b => b && b.img).slice(0, n);
  return blocks.map(b => `<img src="${b.img()}" alt="" loading="lazy">`).join("");
}

function viewChannels() {
  setActiveNav("channels");
  view.innerHTML = `
  <div class="container page">
    <div class="pagehead"><h1>频道</h1><span class="sub">像策展人一样,把块组织成你自己的线索</span></div>
    <div class="chgrid" style="margin-bottom:34px">
      <a class="chcard--new" href="javascript:void 0" id="newch-card">＋ 新建频道</a>
      ${state.channels.map(ch => `
      <a class="chcard" href="#/channel/${encodeURIComponent(ch.id)}">
        <div class="chcard__cover">${ch.items.length ? channelCover(ch, 2) : ""}</div>
        <div class="chcard__name">${esc(ch.name)}</div>
        <div class="chcard__m">${ch.items.length} 块 · ${fmtDate(ch.created)}</div>
      </a>`).join("")}
      ${DEMO_CHANNELS.map(ch => `
      <a class="chcard" href="#/channel/${encodeURIComponent(ch.id)}">
        <div class="chcard__cover">${channelCover(ch, 2)}</div>
        <div class="chcard__name">${esc(ch.name)} <span class="vis vis--pub" style="margin-left:4px">示例</span></div>
        <div class="chcard__m">${ch.items.length} 块 · 官方示例</div>
      </a>`).join("")}
    </div>
  </div>`;
  document.getElementById("newch-card").addEventListener("click", () => {
    const name = prompt("频道名", "");
    if (name && name.trim()) {
      state.channels.unshift({ id: uid("ch"), name: name.trim(), desc: "", items: [], created: Date.now() });
      saveState(); toast("频道已建立"); render();
    }
  });
}

function viewChannel(id) {
  setActiveNav("channels");
  const isDemo = id.startsWith("demo:");
  const ch = isDemo ? DEMO_CHANNELS.find(c => c.id === id) : state.channels.find(c => c.id === id);
  if (!ch) { view.innerHTML = `<div class="container page empty"><h3>频道不存在</h3><a class="lnk" href="#/channels">返回频道</a></div>`; return; }
  const blocks = ch.items.map(blockById).filter(Boolean);
  const mine = allBlocks().filter(b => !ch.items.includes(b.id));

  view.innerHTML = `
  <div class="container page">
    <div class="chanhead">
      <div>
        <h1>${esc(ch.name)}</h1>
        <div class="chanhead__meta">${blocks.length} 块 · ${isDemo ? "官方示例 · " + ch.date : "我的频道"}</div>
      </div>
      <div class="chanhead__acts">
        ${isDemo ? `<button class="mkbtn" id="ch-copy">${I.copy} 复制为我的频道</button>` : `
          <button class="mkbtn" id="ch-edit">${I.edit} 重命名 / 描述</button>
          <button class="mkbtn" id="ch-del" style="color:var(--red)">${I.trash} 删除频道</button>`}
      </div>
    </div>
    ${ch.desc ? `<p class="chandesc">${esc(ch.desc)}</p>` : ""}
    ${blocks.length ? `<div class="masonry">${blocks.map(b => blockCard(b).replace("</a>",
      `<button class="bact" style="position:absolute;left:8px;top:8px;opacity:0" data-rmch="${esc(b.id)}" title="移出频道">${I.x}</button></a>`)).join("")}</div>`
      : `<div class="empty"><h3>频道还是空的</h3><p>在任意块上点「＋」即可连接到这个频道。</p><a class="lnk" href="#/">去探索</a></div>`}

    ${!isDemo && mine.length ? `
    <div class="pagehead" style="margin-top:45px"><h1 style="font-size:var(--fs4)">添加块</h1><span class="sub">点 ＋ 连接进本频道</span></div>
    <div class="masonry" id="addgrid">${mine.slice(0, 12).map(b => blockCard(b).replace("</a>",
      `<button class="bact" style="position:absolute;left:8px;top:8px;opacity:0" data-addch="${esc(b.id)}" title="连接进本频道">${I.plus}</button></a>`)).join("")}</div>` : ""}
  </div>`;

  document.getElementById("ch-copy")?.addEventListener("click", () => {
    state.channels.unshift({ id: uid("ch"), name: ch.name + "(副本)", desc: ch.desc, items: [...ch.items], created: Date.now() });
    saveState(); toast("已复制为我的频道");
    location.hash = "#/channels";
  });
  document.getElementById("ch-edit")?.addEventListener("click", () => {
    const name = prompt("频道名", ch.name);
    if (name === null) return;
    const desc = prompt("频道描述(可留空)", ch.desc || "");
    if (name.trim()) { ch.name = name.trim(); ch.desc = (desc || "").trim(); saveState(); render(); }
  });
  document.getElementById("ch-del")?.addEventListener("click", () => {
    if (confirm(`删除频道「${ch.name}」?块本身不受影响。`)) {
      state.channels = state.channels.filter(c => c.id !== id);
      saveState(); toast("频道已删除");
      location.hash = "#/channels";
    }
  });
  view.querySelectorAll("[data-rmch]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    ch.items = ch.items.filter(x => x !== btn.dataset.rmch);
    saveState(); render(); toast("已移出频道");
  }));
  view.querySelectorAll("[data-addch]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    ch.items.push(btn.dataset.addch);
    saveState(); render(); toast("已连接进频道");
  }));
}

/* ============================================================
   我的档案
   ============================================================ */
function viewMe() {
  setActiveNav("me");
  const p = state.profile;
  const mine = allBlocks().filter(b => b.kind !== "kb");
  const tab = current.q.get("tab") || "all";
  const kinds = [["all", `全部${mine.length}`], ["photo", `照片${state.photos.length}`], ["crop", `细节${state.crops.length}`], ["text", `碎片${state.texts.length}`], ["creation", `创作${state.creations.length}`], ["like", `收藏${state.likes.length}`]];
  const list = tab === "all" ? mine : tab === "like" ? state.likes.map(blockById).filter(Boolean) : mine.filter(b => b.kind === tab);

  view.innerHTML = `
  <div class="container page">
    <div class="mehead">
      <div class="mehead__av">${esc((p.name || "观")[0])}</div>
      <div>
        <h1>${esc(p.name)} 的档案</h1>
        <div class="sub">碎片 · 细节 · 频道 —— 你的观看档案</div>
      </div>
      <div class="mestats">
        <div class="mestat"><b>${state.channels.length}</b><span>频道</span></div>
        <div class="mestat"><b>${mine.length}</b><span>我的块</span></div>
        <div class="mestat"><b>${state.likes.length}</b><span>收藏</span></div>
      </div>
    </div>
    <div class="toolrow">
      <div class="chips">
        ${kinds.map(([k, lbl]) => `<a class="chip ${tab === k ? "is-on" : ""}" href="#/me?tab=${k}">${lbl}</a>`).join("")}
      </div>
      <span class="count">数据仅存本机 · 设置页可导出</span>
    </div>
    ${list.length ? `<div class="masonry">${list.map(blockCard).join("")}</div>`
      : `<div class="empty"><h3>这里还是空的</h3><p>点右上角「＋」写下第一条碎片,或上传一张观展照片。</p></div>`}
  </div>`;
}

/* ============================================================
   创作 Make(拼贴画布)
   ============================================================ */
let makeStash = null, makeStashText = null;
const MAKE_W = 680, MAKE_H = 906;
const MAKE_BG = ["#FFFFFF", "#F7F7F7", "#EDEDED", "#DEDEDE", "#333333", "#16171E", "#3D46C2", "#A87253", "#B93D3D", "#238020"];
const TEXT_COLORS = ["#000000", "#FFFFFF", "#3D46C2", "#B93D3D", "#696969"];

let makeState = null;
function selEl() { return makeState.els.find(e => e.id === makeState.sel); }

function viewMake() {
  setActiveNav("make");
  if (!makeState) makeState = { els: [], sel: null, bg: "#FFFFFF", zTop: 1 };
  if (makeStash) {
    makeStash.forEach(s => makeState.els.push({
      id: uid("el"), type: "img", src: s.src, ar: s.ar || 1,
      x: MAKE_W * 0.28, y: MAKE_H * 0.26, w: MAKE_W * 0.44, h: MAKE_W * 0.44 / (s.ar || 1), rot: 0, z: ++makeState.zTop,
    }));
    makeStash = null;
  }
  if (makeStashText) {
    makeState.els.push({ id: uid("el"), type: "text", text: makeStashText, size: 40, color: "#000000", x: MAKE_W * 0.16, y: MAKE_H * 0.42, w: MAKE_W * 0.68, h: 60, rot: 0, z: ++makeState.zTop });
    makeStashText = null;
  }

  view.innerHTML = `
  <div class="container page">
    <div class="pagehead"><h1>创作</h1><span class="sub">把块拖上画布,导出属于你的拼贴</span></div>
    <div class="make">
      <div class="makestage-wrap">
        <div class="makebar">
          <div class="bgrow">
            ${MAKE_BG.map(c => `<button class="dot ${makeState.bg === c ? "is-on" : ""}" data-bg="${c}" style="background:${c}"></button>`).join("")}
          </div>
          <span class="gap"></span>
          <button class="mkbtn" id="mk-text">${I.edit} 加文字</button>
          <button class="mkbtn mkbtn--dark" id="mk-export">${I.down} 导出 / 保存</button>
        </div>
        <div class="makestage" id="mk-stage">
          <div id="mk-inner" style="position:absolute;left:0;top:0;width:${MAKE_W}px;height:${MAKE_H}px;transform-origin:0 0"></div>
        </div>
        <div class="elbar">
          <button class="mkbtn" id="el-up">${I.layers} 上移</button>
          <button class="mkbtn" id="el-down">${I.layers} 下移</button>
          <button class="mkbtn" id="el-copy">${I.copy} 复制</button>
          <button class="mkbtn" id="el-del" style="color:var(--red)">${I.trash} 删除选中</button>
          <button class="mkbtn" id="el-clear" style="color:var(--red)">${I.x} 清空</button>
        </div>
        <div class="textpanel" id="mk-textpanel">
          <label>文字内容</label>
          <textarea id="tp-text"></textarea>
          <label>字号 <span id="tp-sizev" class="grey"></span></label>
          <input type="range" id="tp-size" min="18" max="120" value="44">
          <label>颜色</label>
          <div class="tcolors">${TEXT_COLORS.map(c => `<button class="dot" data-tc="${c}" style="background:${c}"></button>`).join("")}</div>
        </div>
      </div>
      <aside class="drawer">
        <div class="drawer__tabs">
          <button class="is-on" data-dt="crops">细节</button>
          <button data-dt="kb">馆藏</button>
          <button data-dt="photos">照片</button>
          <button data-dt="texts">碎片</button>
        </div>
        <div class="drawer__grid" id="mk-drawer"></div>
        <div class="drawer__hint">点素材加入画布 · 拖动摆放 · 右下角缩放 · 顶部圆点旋转</div>
      </aside>
    </div>
  </div>`;

  renderDrawer("crops");
  renderMakeStage();
  bindTextPanel();
  document.getElementById("mk-stage").addEventListener("click", e => {
    if (e.target.closest(".el")) return;
    if (makeState.sel !== null) { makeState.sel = null; renderMakeStage(); }
  });

  document.querySelectorAll(".drawer__tabs [data-dt]").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".drawer__tabs [data-dt]").forEach(x => x.classList.remove("is-on"));
      b.classList.add("is-on");
      renderDrawer(b.dataset.dt);
    }));
  document.querySelectorAll(".bgrow [data-bg]").forEach(b =>
    b.addEventListener("click", () => {
      makeState.bg = b.dataset.bg;
      document.querySelectorAll(".bgrow [data-bg]").forEach(x => x.classList.toggle("is-on", x.dataset.bg === makeState.bg));
      renderMakeStage();
    }));
  document.getElementById("mk-text").addEventListener("click", () => {
    const el = { id: uid("el"), type: "text", text: "再观", size: 44, color: "#000000", x: MAKE_W * 0.2, y: MAKE_H * 0.4, w: MAKE_W * 0.6, h: 60, rot: 0, z: ++makeState.zTop };
    makeState.els.push(el); makeState.sel = el.id;
    renderMakeStage(); openTextPanel(el);
  });
  document.getElementById("mk-export").addEventListener("click", exportMake);
  document.getElementById("el-del").addEventListener("click", () => {
    makeState.els = makeState.els.filter(e => e.id !== makeState.sel);
    makeState.sel = null; renderMakeStage();
  });
  document.getElementById("el-copy").addEventListener("click", () => {
    const el = selEl(); if (!el) return;
    const c = { ...el, id: uid("el"), x: el.x + 24, y: el.y + 24, z: ++makeState.zTop };
    makeState.els.push(c); makeState.sel = c.id; renderMakeStage();
  });
  document.getElementById("el-clear").addEventListener("click", () => {
    if (!makeState.els.length || confirm("清空画布?")) { makeState.els = []; makeState.sel = null; renderMakeStage(); }
  });
  document.getElementById("el-up").addEventListener("click", () => moveLayer(1));
  document.getElementById("el-down").addEventListener("click", () => moveLayer(-1));
  document.addEventListener("keydown", makeKeydown);
}

function moveLayer(d) {
  const el = selEl(); if (!el) return;
  el.z += d * 1.5; if (d > 0) el.z = Math.max(el.z, ++makeState.zTop);
  renderMakeStage();
}
function makeKeydown(e) {
  if (!location.hash.startsWith("#/make")) { document.removeEventListener("keydown", makeKeydown); return; }
  if (e.target.matches("input, textarea")) return;
  if ((e.key === "Delete" || e.key === "Backspace") && makeState.sel) {
    e.preventDefault();
    makeState.els = makeState.els.filter(x => x.id !== makeState.sel);
    makeState.sel = null; renderMakeStage();
  }
  if (e.key === "Escape") { makeState.sel = null; renderMakeStage(); }
}

function renderDrawer(tab) {
  const grid = document.getElementById("mk-drawer");
  let items = [];
  if (tab === "crops") items = state.crops.map(c => ({ kind: "crop", id: c.id, src: c.data, ar: c.ar, title: c.note || "细节" }));
  if (tab === "kb") items = KB.map(w => ({ kind: "kb", id: w.id, src: workImage(w, 480), ar: w.ar, title: w.name }));
  if (tab === "photos") items = state.photos.map(w => ({ kind: "photo", id: w.id, src: workImage(w, 480), ar: w.ar, title: w.name }));
  if (tab === "texts") items = state.texts.map(t => ({ kind: "text", id: t.id, text: t.text }));
  grid.innerHTML = items.length ? items.map((it, i) => {
    if (it.kind === "text") return `<div class="ditem ditem--text" data-add2="${tab}:${i}">${esc(it.text.slice(0, 40))}…</div>`;
    return `<div class="ditem" data-add2="${tab}:${i}" title="${esc(it.title)}"><img src="${it.src}" alt="" loading="lazy"></div>`;
  }).join("") : `<p class="hint" style="grid-column:1/-1;padding:6px 2px">这里还没有素材。</p>`;
  grid.querySelectorAll("[data-add2]").forEach(d => d.addEventListener("click", () => {
    const [t, i] = d.dataset.add2.split(":");
    if (t === "texts") {
      const tx = state.texts[+i];
      makeState.els.push({ id: uid("el"), type: "text", text: tx.text.slice(0, 80), size: 36, color: "#000000", x: MAKE_W * 0.15, y: MAKE_H * 0.4, w: MAKE_W * 0.7, h: 60, rot: 0, z: ++makeState.zTop });
    } else {
      const it = t === "crops" ? state.crops[+i] : t === "kb" ? KB[+i] : state.photos[+i];
      const src = t === "crops" ? it.data : workImage(it, 480);
      const ar = it.ar || 1;
      const w = MAKE_W * 0.46, h = w / Math.max(0.4, Math.min(3.4, ar));
      makeState.els.push({ id: uid("el"), type: "img", src, ar, x: (MAKE_W - w) / 2, y: (MAKE_H - h) / 2, w, h, rot: 0, z: ++makeState.zTop });
    }
    renderMakeStage();
  }));
}

let stageScale = 1;
function renderMakeStage() {
  const outer = document.getElementById("mk-stage"), inner = document.getElementById("mk-inner");
  if (!outer || !inner) return;
  stageScale = outer.clientWidth / MAKE_W;
  inner.style.transform = `scale(${stageScale})`;
  inner.style.background = makeState.bg;
  const sorted = [...makeState.els].sort((a, b) => a.z - b.z);
  inner.innerHTML = sorted.map(el => {
    if (el.type === "img") {
      return `<div class="el ${el.id === makeState.sel ? "is-sel" : ""}" data-el="${el.id}"
        style="left:${el.x}px;top:${el.y}px;transform:rotate(${el.rot}rad)">
        <img class="el-img" src="${el.src}" alt="" draggable="false" style="width:${el.w}px;height:${el.h}px">
        <div class="el__handle" data-h="se"></div><div class="el__rot" data-h="rot"></div>
      </div>`;
    }
    return `<div class="el ${el.id === makeState.sel ? "is-sel" : ""}" data-el="${el.id}"
      style="left:${el.x}px;top:${el.y}px;transform:rotate(${el.rot}rad)">
      <div style="width:${el.w}px;font-size:${el.size}px;font-weight:700;color:${el.color};line-height:1.25;word-break:break-word;white-space:normal">${esc(el.text)}</div>
      <div class="el__handle" data-h="se"></div><div class="el__rot" data-h="rot"></div>
    </div>`;
  }).join("");
  bindStageEvents(inner, outer);
  syncTextPanel();
}

function bindStageEvents(inner, outer) {
  inner.querySelectorAll(".el").forEach(node => {
    node.addEventListener("pointerdown", e => {
      const el = makeState.els.find(x => x.id === node.dataset.el);
      if (!el) return;
      makeState.sel = el.id;
      document.querySelectorAll(".el").forEach(n => n.classList.toggle("is-sel", n === node));
      if (el.type === "text") el.h = node.offsetHeight / stageScale;
      openTextPanel(el);
      const h = e.target.dataset.h;
      e.preventDefault();
      try { node.setPointerCapture(e.pointerId); } catch {}
      const r = outer.getBoundingClientRect();
      const start = { px: (e.clientX - r.left) / stageScale, py: (e.clientY - r.top) / stageScale, x: el.x, y: el.y, w: el.w, h: el.h, rot: el.rot };
      const cx = el.x + el.w / 2, cy = el.y + (el.h || 60) / 2;
      const move = ev => {
        const px = (ev.clientX - r.left) / stageScale, py = (ev.clientY - r.top) / stageScale;
        if (!h) { el.x = start.x + px - start.px; el.y = start.y + py - start.py; }
        else if (h === "se") {
          const w2 = Math.max(36, start.w + (px - start.px));
          el.w = w2;
          if (el.type === "img") el.h = Math.max(24, w2 / Math.max(0.3, Math.min(4, el.ar)));
        } else if (h === "rot") {
          el.rot = Math.atan2(py - cy, px - cx) + Math.PI / 2;
        }
        node.style.left = el.x + "px"; node.style.top = el.y + "px";
        node.style.transform = `rotate(${el.rot}rad)`;
        const im = node.querySelector(".el-img");
        if (im) { im.style.width = el.w + "px"; im.style.height = el.h + "px"; }
        const tx = node.querySelector("div:not(.el__handle):not(.el__rot)");
        if (el.type === "text" && tx) tx.style.width = el.w + "px";
      };
      const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
    node.addEventListener("click", e => e.stopPropagation());
  });
}

function openTextPanel(el) {
  const panel = document.getElementById("mk-textpanel");
  if (!panel) return;
  if (el && el.type === "text") {
    panel.classList.add("is-open");
    panel.dataset.el = el.id;
    document.getElementById("tp-text").value = el.text;
    document.getElementById("tp-size").value = el.size;
    document.getElementById("tp-sizev").textContent = el.size;
    panel.querySelectorAll("[data-tc]").forEach(b => b.classList.toggle("is-on", b.dataset.tc === el.color));
  } else panel.classList.remove("is-open");
}
function syncTextPanel() {
  const el = selEl();
  if (el && el.type === "text") openTextPanel(el);
  else document.getElementById("mk-textpanel")?.classList.remove("is-open");
}
function bindTextPanel() {
  const panel = document.getElementById("mk-textpanel");
  panel.addEventListener("input", e => {
    const el = makeState.els.find(x => x.id === panel.dataset.el);
    if (!el) return;
    if (e.target.id === "tp-text") el.text = e.target.value;
    if (e.target.id === "tp-size") { el.size = +e.target.value; document.getElementById("tp-sizev").textContent = el.size; }
    renderMakeStageKeepSel();
  });
  panel.addEventListener("click", e => {
    const b = e.target.closest("[data-tc]");
    if (!b) return;
    const el = makeState.els.find(x => x.id === panel.dataset.el);
    if (el) { el.color = b.dataset.tc; renderMakeStageKeepSel(); }
  });
}
function renderMakeStageKeepSel() {
  const sel = makeState.sel;
  renderMakeStage();
  makeState.sel = sel;
  document.querySelectorAll(".el").forEach(n => n.classList.toggle("is-sel", n.dataset.el === sel));
}

/* 导出 */
async function exportMake() {
  if (!makeState.els.length) { toast("画布是空的"); return; }
  const cv = document.createElement("canvas");
  cv.width = MAKE_W; cv.height = MAKE_H;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = makeState.bg;
  ctx.fillRect(0, 0, MAKE_W, MAKE_H);
  const loads = src => new Promise(res => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const sorted = [...makeState.els].sort((a, b) => a.z - b.z);
  for (const el of sorted) {
    if (el.type === "img") {
      const im = await loads(el.src);
      if (!im) continue;
      ctx.save();
      ctx.translate(el.x + el.w / 2, el.y + el.h / 2);
      ctx.rotate(el.rot || 0);
      ctx.drawImage(im, -el.w / 2, -el.h / 2, el.w, el.h);
      ctx.restore();
    } else {
      ctx.save();
      const h = textHeight(el);
      ctx.translate(el.x + el.w / 2, el.y + h / 2);
      ctx.rotate(el.rot || 0);
      ctx.fillStyle = el.color;
      ctx.font = `700 ${el.size}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const lines = wrapText(ctx, el.text, el.w);
      const lh = el.size * 1.25;
      lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * lh));
      ctx.restore();
    }
  }
  const data = cv.toDataURL("image/png");
  const cr = { id: uid("cr"), title: "未命名创作", data, created: Date.now() };
  state.creations.unshift(cr); saveState();
  const ov = openModal(`
    <h3>创作完成</h3>
    <p class="modal__sub">已存入「我的档案 · 创作」</p>
    <img src="${data}" style="width:100%;border:1px solid var(--line);border-radius:3px;margin-bottom:14px" alt="">
    <div class="field"><label>标题</label><input class="textin" id="cr-title" value="未命名创作" maxlength="24"></div>
    <div class="modal__acts">
      <button class="mkbtn" id="crx-close">关闭</button>
      <button class="mkbtn mkbtn--dark" id="crx-dl">${I.down} 下载 PNG</button>
    </div>`);
  ov.querySelector("#crx-dl").addEventListener("click", () => {
    cr.title = ov.querySelector("#cr-title").value.trim() || "未命名创作";
    saveState();
    downloadDataUrl(data, `${cr.title}-再观.png`);
  });
  ov.querySelector("#crx-close").addEventListener("click", () => {
    cr.title = ov.querySelector("#cr-title").value.trim() || "未命名创作";
    saveState(); closeModal(); toast("已保存到我的档案");
  });
}
function wrapText(ctx, text, maxW) {
  const lines = [];
  let cur = "";
  for (const ch of String(text)) {
    if (ch === "\n") { lines.push(cur); cur = ""; continue; }
    if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}
function textHeight(el) {
  const m = document.createElement("canvas").getContext("2d");
  m.font = `700 ${el.size}px Arial, "PingFang SC", sans-serif`;
  return wrapText(m, el.text, el.w).length * el.size * 1.25;
}
window.addEventListener("resize", () => {
  if (location.hash.startsWith("#/make") && document.getElementById("mk-inner")) renderMakeStageKeepSel();
});

/* ============================================================
   设置
   ============================================================ */
function viewSettings() {
  setActiveNav("settings");
  const p = state.profile;
  view.innerHTML = `
  <div class="container page">
    <div class="pagehead"><h1>设置</h1><span class="sub">资料 · 数据 · 关于</span></div>
    <div class="setgrid">
      <div class="panel">
        <h3>个人资料</h3>
        <div class="field">
          <label>昵称(显示在我的档案)</label>
          <input class="textin" id="pf-name" value="${esc(p.name)}" maxlength="16">
        </div>
        <button class="mkbtn mkbtn--dark" id="pf-save">保存</button>
      </div>
      <div class="panel">
        <h3>我的数据</h3>
        <p>块、频道、细节、创作与笔记全部只存在这台浏览器。换设备前请先导出。</p>
        <div class="row">
          <button class="mkbtn" id="dt-export">${I.down} 导出 JSON</button>
          <button class="mkbtn" id="dt-import">${I.plus} 导入</button>
          <button class="mkbtn" id="dt-clear" style="color:var(--red)">${I.trash} 清空全部</button>
          <input type="file" id="dt-file" accept="application/json" hidden>
        </div>
      </div>
      <div class="panel">
        <h3>关于再观</h3>
        <p>「再观」是观展后的个人知识档案:上传照片、裁下细节、写下碎片、组织成频道。
        本版形态参考 Are.na —— 设计师喜爱的共同知识档案平台;真实影像来自 Wikimedia Commons(公有领域 / CC)。
        藏品数据与界面仅用于学习研究。</p>
      </div>
    </div>
  </div>`;
  document.getElementById("pf-save").addEventListener("click", () => {
    const v = document.getElementById("pf-name").value.trim();
    if (v) { state.profile.name = v; saveState(); toast("已保存"); }
  });
  document.getElementById("dt-export").addEventListener("click", () => {
    const blob = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement("a");
    a.href = blob; a.download = `zaiguan-arena-${fmtDate(Date.now())}.json`;
    a.click(); toast("已导出");
  });
  const file = document.getElementById("dt-file");
  document.getElementById("dt-import").addEventListener("click", () => file.click());
  file.addEventListener("change", () => {
    const f = file.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        if (!data || typeof data !== "object" || !Array.isArray(data.likes)) throw 0;
        if (!confirm("导入会覆盖当前全部数据,继续?")) return;
        state = { ...structuredClone(DEFAULT_STATE), ...data };
        saveState(); toast("已导入"); render();
      } catch { toast("文件格式不对"); }
    };
    rd.readAsText(f);
  });
  document.getElementById("dt-clear").addEventListener("click", () => {
    if (confirm("清空全部块、频道与创作?不可恢复。")) {
      state = structuredClone(DEFAULT_STATE);
      saveState(); toast("已清空"); render();
    }
  });
}

/* ============================================================
   启动
   ============================================================ */
render();
if (!location.hash) location.hash = "#/";
