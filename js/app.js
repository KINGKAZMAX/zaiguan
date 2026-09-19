/* ============================================================
   再观 Rijksstudio v4 — 应用主体
   路由 + 视图(首页/馆藏/作品/工作室/收藏集/创作/设置)
   + 深度缩放查看器 + 裁剪细节 + 拼贴创作编辑器
   ============================================================ */

"use strict";

/* ---------- 图标 ---------- */
const I = {
  heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8.5-5.9-8.5-11.5C3.5 6.2 5.7 4 8.4 4c1.5 0 2.9.7 3.6 1.9C12.7 4.7 14.1 4 15.6 4c2.7 0 4.9 2.2 4.9 5.5C20.5 15.1 12 21 12 21z"/></svg>',
  heartO: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.5S3.5 14.8 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.6-8.5 11.3-8.5 11.3z"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  down: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></svg>',
  crop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
  zin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M21 21l-4.3-4.3"/></svg>',
  zout: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-4.3-4.3"/></svg>',
  fit: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  star: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/></svg>',
  edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  layers: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l10 5.5L12 13 2 7.5zM2 12.5L12 18l10-5.5M2 17.5L12 23l10-5.5"/></svg>',
  copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
};

const view = document.getElementById("view");
const overlayRoot = document.getElementById("overlay-root");
const toastRoot = document.getElementById("toast-root");

/* ============================================================
   通用 UI
   ============================================================ */
function toast(msg, accent = false) {
  const t = document.createElement("div");
  t.className = "toast" + (accent ? " toast--accent" : "");
  t.innerHTML = msg;
  toastRoot.appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 320); }, 2200);
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

/* 藏品卡(masonry 内) */
function workCard(w) {
  const liked = isLiked(w.id);
  const hue = HUES[w.hue] || HUES.yuebai;
  return `
  <a class="wcard" href="#/work/${encodeURIComponent(w.id)}">
    ${w.kind === "photo" ? '<span class="wcard__tag">我的照片</span>' : ""}
    <button class="wcard__heart ${liked ? "is-on" : ""}" data-heart="${w.id}" aria-label="收藏">${liked ? I.heart : I.heartO}</button>
    <img class="wcard__img" src="${workImage(w, 480)}" alt="${esc(w.name)}" loading="lazy" data-fb="${esc(w.id)}"
         width="${Math.round(480 * (w.ar >= 1 ? 1 : w.ar))}" height="${Math.round(480 / (w.ar >= 1 ? w.ar : 1))}">
    <div class="wcard__body">
      <div class="wcard__name"><span class="wcard__hue" style="background:${hue.dot}"></span>${esc(w.name)}</div>
      <div class="wcard__meta">${esc(w.artist)} · ${esc(w.era)}</div>
    </div>
  </a>`;
}

/* 点爱心(事件委托) */
document.addEventListener("click", e => {
  const h = e.target.closest("[data-heart]");
  if (!h) return;
  e.preventDefault(); e.stopPropagation();
  const on = toggleLike(h.dataset.heart);
  h.classList.toggle("is-on", on);
  h.innerHTML = on ? I.heart : I.heartO;
  toast(on ? `${I.heart} 已收藏 · 进入「我的 Rijksstudio」` : "已取消收藏");
});

/* 真实影像加载失败 → 程序化兜底图(站点离线也可用) */
document.addEventListener("error", e => {
  const t = e.target;
  if (!t || t.tagName !== "IMG" || !t.dataset.fb) return;
  const w = workById(t.dataset.fb);
  t.removeAttribute("data-fb");
  if (!w || w.kind === "photo") return;
  t.src = fallbackImage(w);
}, true);

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
document.addEventListener("zaiguan:photo-ready", () => {
  const y = window.scrollY; render(); window.scrollTo(0, y);
});

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const v = document.getElementById("search-input").value.trim();
  location.hash = "#/collection" + (v ? "?q=" + encodeURIComponent(v) : "");
});

function setActiveNav(key) {
  document.querySelectorAll("#main-nav a").forEach(a => a.classList.toggle("is-active", a.dataset.nav === key));
}

function render() {
  const [root, a, b] = current.seg;
  closeModal();
  if (!root) return viewHome();
  if (root === "collection") return viewCollection();
  if (root === "work" && a) return viewWork(decodeURIComponent(a));
  if (root === "studio") return viewStudio();
  if (root === "set" && a) return viewSet(decodeURIComponent(a));
  if (root === "make") return viewMake();
  if (root === "settings") return viewSettings();
  viewHome();
}

/* ============================================================
   首页
   ============================================================ */
function viewHome() {
  setActiveNav("");
  const heroArts = [KB[0], KB[7], KB[21]].map((w, i) =>
    `<img src="${workImage(w, 1080)}" data-fb="${esc(w.id)}" alt="" style="${[
      "left:-6%;top:-8%;width:62%;height:118%",
      "right:-8%;top:0;width:56%;height:100%",
      "left:24%;bottom:-14%;width:52%;height:76%",
    ][i]}">`).join("");
  const rnd = mulberry32(20260919);
  const featured = [...KB].sort(() => rnd() - 0.5).slice(0, 6);
  view.innerHTML = `
  <section class="hero">
    <div class="hero__art">${heroArts}</div>
    <div class="container hero__inner">
      <div class="hero__tag">再观 Rijksstudio</div>
      <h1 class="h-display h1">让观看,<br>发生第二次。</h1>
      <p>把展签前停留的三十秒,变成可以回去的地方。收藏打动你的作品,
      裁下画面里最锋利的那个细节,再用馆藏完成一次属于你的创作——
      这是你的 Rijksstudio。</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#/collection">进入馆藏</a>
        <a class="btn btn--ghost-light" href="#/studio">我的 Rijksstudio</a>
      </div>
    </div>
  </section>

  <div class="container">
    <div class="pillars" style="margin-top:-1px">
      <div class="pillar">
        <div class="pillar__no">01 — 收藏</div>
        <h3 class="h3">♥ 收藏作品</h3>
        <p>在馆藏中漫游,像在展厅里一样随手记下心动:卡片上的爱心,一点即藏。</p>
      </div>
      <div class="pillar">
        <div class="pillar__no">02 — 裁剪</div>
        <h3 class="h3">✂ 裁剪细节</h3>
        <p>深度放大一幅画,框住最打动你的局部——鹤的丹顶、笔的飞白、釉的开片,存进细节墙。</p>
      </div>
      <div class="pillar">
        <div class="pillar__no">03 — 再创作</div>
        <h3 class="h3">✎ 用藏品创作</h3>
        <p>把细节与藏品拖上画布,配一句想说的话,导出你的拼贴创作。馆藏因你而不同。</p>
      </div>
    </div>

    <div class="section-head">
      <div><div class="kicker">Collection</div><h2 class="h-display h2">馆藏精选</h2></div>
      <a class="link" href="#/collection"><span>浏览全部 →</span></a>
    </div>
    <div class="masonry">${featured.map(workCard).join("")}</div>

    <div class="section-head">
      <div><div class="kicker">Visitor Stories</div><h2 class="h-display h2">大家的收藏集</h2></div>
      <a class="link" href="#/studio?tab=sets"><span>全部收藏集 →</span></a>
    </div>
    <div class="stories" style="margin-bottom:clamp(40px,7vw,84px)">
      ${DEMO_SETS.map(setStory).join("")}
    </div>
  </div>`;
}

function setCoverImgs(items, n = 3) {
  const works = items.map(workById).filter(Boolean).slice(0, n);
  while (works.length && works.length < n) works.push(works[0]);
  return works.map(w => `<img src="${workImage(w, 360)}" alt="">`).join("");
}
function setStory(s) {
  return `
  <a class="story" href="#/set/${encodeURIComponent(s.id)}">
    <div class="story__cover">${setCoverImgs(s.items)}</div>
    <div class="story__body">
      <div class="story__name">${esc(s.name)}</div>
      <div class="story__meta">${s.date} · <b>${s.items.length}</b> 件作品 · ${esc(s.author)}</div>
    </div>
  </a>`;
}

/* ============================================================
   馆藏(Collection)
   ============================================================ */
function viewCollection() {
  setActiveNav("collection");
  const q = current.q.get("q") || "";
  const cat = current.q.get("cat") || "";
  const hue = current.q.get("hue") || "";
  if (q) document.getElementById("search-input").value = q;

  let list = allWorks();
  if (cat) list = list.filter(w => w.category === cat);
  if (hue) list = list.filter(w => w.hue === hue);
  if (q) {
    const k = q.toLowerCase();
    list = list.filter(w => [w.name, w.artist, w.era, w.medium, w.collection, HUES[w.hue]?.name]
      .join(" ").toLowerCase().includes(k));
  }

  view.innerHTML = `
  <div class="container page">
    <div class="section-head mt-0" style="margin-top:26px">
      <div><div class="kicker">Rijksstudio</div><h1 class="h-display h2">馆藏 Collection</h1></div>
      <div class="row">
        <span class="small grey">颜色筛选 · 点色找感觉</span>
        <a class="btn btn--quiet btn--sm" href="#/collection?upload=1" id="btn-upload">${I.plus} 上传观展照片</a>
      </div>
    </div>

    <div class="uploadzone" id="uploadzone" role="button" tabindex="0">
      <b style="font-size:.92rem">＋ 把观展照片放进馆藏</b>
      <div class="small" style="margin-top:6px">自动读取拍摄时间(EXIF)与主色,按色系归入你的 Rijksstudio · 图片仅存本机</div>
      <input type="file" id="photo-input" accept="image/*" multiple hidden>
    </div>

    <div class="filterbar">
      <span class="filterbar__label">类别</span>
      <div class="chips">
        <a class="chip ${!cat ? "is-on" : ""}" href="${collHref({ q, hue })}">全部</a>
        ${CATEGORIES.map(c => `<a class="chip ${cat === c ? "is-on" : ""}" href="${collHref({ q, hue, cat: c })}">${c}</a>`).join("")}
        <a class="chip ${cat === "我的照片" ? "is-on" : ""}" href="${collHref({ q, hue, cat: "我的照片" })}">我的照片</a>
      </div>
      <span class="filterbar__label">色系</span>
      <div class="swatches">
        <a class="swatch ${!hue ? "is-on" : ""}" style="background:conic-gradient(#cc4c28,#aaa04d,#52755c,#436178,#202327,#cc4c28)" href="${collHref({ q, cat })}" title="全部颜色"></a>
        ${HUE_IDS.map(id => `<a class="swatch ${hue === id ? "is-on" : ""}" style="background:${HUES[id].dot}" href="${collHref({ q, cat, hue: id })}" title="${HUES[id].name}"></a>`).join("")}
      </div>
      <span class="filterbar__count">${list.length} 件${q ? ` · “${esc(q)}”` : ""}</span>
    </div>

    ${list.length ? `<div class="masonry">${list.map(workCard).join("")}</div>` : `
    <div class="emptybox">
      <h3 class="h3">没有找到符合条件的藏品</h3>
      <p>换个关键词,或点上方色点按颜色探索。</p>
      <a class="btn btn--ghost" href="#/collection">清除筛选</a>
    </div>`}
  </div>`;

  const zone = document.getElementById("uploadzone");
  const input = document.getElementById("photo-input");
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") input.click(); });
  ["dragover", "dragenter"].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add("is-drag"); }));
  ["dragleave", "drop"].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove("is-drag"); }));
  zone.addEventListener("drop", e => { if (e.dataTransfer.files.length) ingestFiles(e.dataTransfer.files); });
  input.addEventListener("change", () => { if (input.files.length) ingestFiles(input.files); });

  if (current.q.get("upload")) zone.scrollIntoView({ behavior: "smooth", block: "center" });
}

function collHref(over) {
  const p = new URLSearchParams();
  const merged = { q: current.q.get("q"), cat: current.q.get("cat"), hue: current.q.get("hue"), ...over };
  Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return "#/collection" + (s ? "?" + s : "");
}

async function ingestFiles(files) {
  let n = 0;
  for (const f of files) {
    if (!f.type.startsWith("image/")) continue;
    try { await ingestPhoto(f); n++; } catch { /* 跳过坏文件 */ }
  }
  if (n) { toast(`${I.check} 已收录 ${n} 张观展照片`, true); render(); }
  else toast("未能读取图片");
}

/* ============================================================
   作品页(深度缩放 + 裁剪)
   ============================================================ */
function viewWork(id) {
  setActiveNav("collection");
  const w = workById(id);
  if (!w) { view.innerHTML = `<div class="container page emptybox"><h3>作品不存在</h3><a class="btn btn--ghost" href="#/collection">返回馆藏</a></div>`; return; }
  const hue = HUES[w.hue] || HUES.yuebai;
  const note = state.notes[id] || {};
  const related = allWorks().filter(x => x.hue === w.hue && x.id !== id).slice(0, 4);
  const liked = isLiked(id);

  view.innerHTML = `
  <div class="container page">
    <div class="crumbs"><a href="#/collection">馆藏</a> / <a href="${collHref({ cat: w.category, hue: "", q: "" })}">${esc(w.category)}</a> / ${esc(w.name)}</div>
    <div class="workpage">
      <div>
        <div class="viewer" id="viewer">
          <div class="viewer__stage" id="vstage">
            <img class="viewer__img" id="vimg" alt="${esc(w.name)}" src="${workImage(w, 1080)}" crossorigin="anonymous" data-fb="${esc(w.id)}" draggable="false">
          </div>
          <div class="viewer__hint" id="vhint">滚轮缩放 · 拖动平移 · 双击放大</div>
          <div class="viewer__bar" id="vbar">
            <button class="vbtn" id="v-zin" title="放大">${I.zin}</button>
            <button class="vbtn" id="v-zout" title="缩小">${I.zout}</button>
            <button class="vbtn" id="v-fit" title="适配">${I.fit}</button>
            <span style="flex:1"></span>
            <button class="vbtn vbtn--wide" id="v-crop">${I.crop} 裁剪细节</button>
            <button class="vbtn vbtn--wide" id="v-dl">${I.down} 下载</button>
          </div>
        </div>
        ${related.length ? `
        <div class="section-head"><div><div class="kicker kicker--grey">同色系 · ${hue.name}</div><h2 class="h-display h2" style="font-size:1.3rem">继续看</h2></div></div>
        <div class="masonry" style="columns:2 240px">${related.map(workCard).join("")}</div>` : ""}
      </div>

      <aside class="workinfo">
        <h1 class="workinfo__title">${esc(w.name)}</h1>
        <p class="workinfo__artist"><b>${esc(w.artist)}</b> · ${esc(w.era)}</p>
        <div class="workinfo__id">再观馆藏号 ${esc(id.toUpperCase())} · 色系 ${hue.name}</div>

        <div class="workacts">
          <button class="btn ${liked ? "btn--primary" : "btn--ghost"}" id="act-like">${liked ? I.heart + " 已收藏" : I.heartO + " 收藏"}</button>
          <button class="btn btn--dark" id="act-set">${I.plus} 加入收藏集</button>
        </div>

        <table class="metatable">
          <tr><th>艺术家</th><td>${esc(w.artist)}</td></tr>
          <tr><th>年代</th><td>${esc(w.era)}</td></tr>
          <tr><th>媒介</th><td>${esc(w.medium)}</td></tr>
          <tr><th>类别</th><td>${esc(w.category)}</td></tr>
          <tr><th>色系</th><td><span class="wcard__hue" style="background:${hue.dot}"></span>${hue.name}</td></tr>
          <tr><th>馆藏</th><td>${esc(w.collection)}</td></tr>
          ${w.src ? `<tr><th>信息来源</th><td><a class="link" href="https://commons.wikimedia.org/wiki/${encodeURIComponent(w.src)}" target="_blank" rel="noopener"><span>Wikimedia Commons</span></a></td></tr>` : ""}
        </table>

        ${w.desc ? `<p class="workinfo__desc">${esc(w.desc)}</p>` : ""}

        <div class="notebox">
          <div class="kicker kicker--grey" style="margin-bottom:8px">观展笔记</div>
          <textarea id="note-input" placeholder="为什么在这件作品前停下来?写点什么…">${esc(note.text || "")}</textarea>
          <div class="stars" id="stars">
            ${[1, 2, 3, 4, 5].map(n => `<button data-star="${n}" class="${(note.stars || 0) >= n ? "is-on" : ""}" aria-label="${n} 星">${I.star}</button>`).join("")}
          </div>
          <div class="small grey">笔记与星级只存在你的浏览器里</div>
        </div>
      </aside>
    </div>
  </div>`;

  initViewer(w);
  document.getElementById("v-dl").addEventListener("click", () => {
    // 跨域图片 <a download> 不生效,经 blob 落地
    fetch(workImage(w, 1080))
      .then(r => r.blob())
      .then(b => downloadDataUrl(URL.createObjectURL(b), `${w.name}-再观.jpg`))
      .catch(() => downloadDataUrl(workImage(w, 1080), `${w.name}-再观.jpg`));
  });
  document.getElementById("act-like").addEventListener("click", () => {
    const on = toggleLike(id);
    toast(on ? `${I.heart} 已收藏` : "已取消收藏");
    render();
  });
  document.getElementById("act-set").addEventListener("click", () => setsModal(id));

  const noteInput = document.getElementById("note-input");
  let deb = null;
  noteInput.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => {
      state.notes[id] = { ...(state.notes[id] || {}), text: noteInput.value };
      saveState();
    }, 500);
  });
  document.getElementById("stars").addEventListener("click", e => {
    const b = e.target.closest("[data-star]"); if (!b) return;
    const n = +b.dataset.star;
    state.notes[id] = { ...(state.notes[id] || {}), stars: (state.notes[id] || {}).stars === n ? 0 : n };
    saveState();
    document.querySelectorAll("#stars [data-star]").forEach(x => x.classList.toggle("is-on", +x.dataset.star <= state.notes[id].stars));
  });
}

/* ---------- 深度缩放查看器 ---------- */
function initViewer(w) {
  const stage = document.getElementById("vstage");
  const img = document.getElementById("vimg");
  const hint = document.getElementById("vhint");
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
  // 缓存图 complete 立即为真,需等布局稳定(双 rAF)再适配,200ms 后再校正一次
  const scheduleFit = () => requestAnimationFrame(() => requestAnimationFrame(() => { if (!userTouched) doFit(); }));
  img.addEventListener("load", scheduleFit, { once: true });
  if (img.complete && img.naturalWidth) scheduleFit();
  [100, 300, 700].forEach(d => setTimeout(() => { if (!userTouched && !cropMode) doFit(); }, d));
  let rsT = null; // 防抖:面板动画等瞬态尺寸不参与适配
  window.addEventListener("resize", () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => { if (!cropMode) doFit(); }, 150);
  });

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

  document.getElementById("v-zin").addEventListener("click", () => {
    const r = stage.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, 1.4);
  });
  document.getElementById("v-zout").addEventListener("click", () => {
    const r = stage.getBoundingClientRect();
    zoomAt(r.width / 2, r.height / 2, 1 / 1.4);
  });
  document.getElementById("v-fit").addEventListener("click", doFit);

  /* ---------- 裁剪模式 ---------- */
  let cropMode = false;
  const btnCrop = document.getElementById("v-crop");

  btnCrop.addEventListener("click", () => {
    cropMode = true;
    hint.textContent = "拖动虚线框 · 四角调整大小";
    btnCrop.style.display = "none";
    const bar = document.getElementById("vbar");
    bar.insertAdjacentHTML("beforeend", `
      <button class="vbtn vbtn--wide" id="crop-ok" style="background:var(--accent);color:#fff">${I.check} 确认裁剪</button>
      <button class="vbtn vbtn--wide is-danger" id="crop-no">${I.x} 取消</button>`);

    const r = stage.getBoundingClientRect();
    const bw = Math.min(r.width * 0.56, r.height * 0.62);
    const bh = bw / Math.max(0.6, Math.min(1.8, w.ar || 1));
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
    const updSize = () => {
      const b = box.getBoundingClientRect(), r2 = stage.getBoundingClientRect();
      sizeLbl.textContent = `${Math.round(b.width / s)} × ${Math.round(b.height / s)} px`;
      void r2;
    };
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
      const up = ev => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        void ev;
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });

    document.getElementById("crop-no").addEventListener("click", () => {
      box.remove(); exitCrop();
    });
    function exitCrop() {
      cropMode = false;
      hint.textContent = "滚轮缩放 · 拖动平移 · 双击放大";
      document.getElementById("crop-ok")?.remove();
      document.getElementById("crop-no")?.remove();
      btnCrop.style.display = "";
    }
    document.getElementById("crop-ok").addEventListener("click", () => {
      // 舞台坐标 → 图片坐标
      const b = box.getBoundingClientRect(), R = stage.getBoundingClientRect();
      const ix = (b.left - R.left - tx) / s, iy = (b.top - R.top - ty) / s;
      const iw = b.width / s, ih = b.height / s;
      const cw = img.naturalWidth, ch = img.naturalHeight;
      const cx0 = Math.max(0, Math.min(ix, cw - 8)), cy0 = Math.max(0, Math.min(iy, ch - 8));
      const cx1 = Math.min(cw, Math.max(8, ix + iw)), cy1 = Math.min(ch, Math.max(8, iy + ih));
      const rw = Math.round(cx1 - cx0), rh = Math.round(cy1 - cy0);
      if (rw < 16 || rh < 16) { toast("裁剪区域太小,再拉大一点"); return; }
      const k = Math.min(1, 900 / Math.max(rw, rh));
      const cv = document.createElement("canvas");
      cv.width = Math.round(rw * k); cv.height = Math.round(rh * k);
      cv.getContext("2d").drawImage(img, cx0, cy0, rw, rh, 0, 0, cv.width, cv.height);
      const data = cv.toDataURL("image/jpeg", 0.88);
      const crop = { id: uid("crop"), work: w.id, data, note: "", ar: rw / rh, created: Date.now() };
      state.crops.unshift(crop); saveState();
      box.remove(); exitCrop();
      cropModal(crop, w);
    });
  });
}

/* 裁剪成功 → 写一句注 + 去创作 */
function cropModal(crop, w) {
  const ov = openModal(`
    <div class="kicker" style="margin-bottom:8px">✂ 已裁剪保存</div>
    <h3 class="h3" style="margin-bottom:12px">来自《${esc(w.name)}》的细节</h3>
    <img src="${crop.data}" style="width:100%;border:1px solid var(--line);border-radius:2px;margin-bottom:14px" alt="裁剪细节">
    <div class="field">
      <label>给这个细节写一句注(可选)</label>
      <input class="textin" id="crop-note" placeholder="比如:鹤的丹顶,一点朱砂。" maxlength="60">
    </div>
    <div class="modal__acts">
      <button class="btn btn--quiet" id="cm-done">存入细节墙</button>
      <button class="btn btn--primary" id="cm-make">${I.plus} 拿去创作</button>
    </div>`);
  ov.querySelector("#cm-done").addEventListener("click", () => {
    crop.note = ov.querySelector("#crop-note").value.trim();
    saveState(); closeModal(); toast(`${I.check} 已存入细节墙`, true);
  });
  ov.querySelector("#cm-make").addEventListener("click", () => {
    crop.note = ov.querySelector("#crop-note").value.trim();
    saveState(); closeModal();
    makeStash = [{ src: crop.data, ar: crop.ar }];
    location.hash = "#/make";
  });
}

/* ---------- 收藏集弹层 ---------- */
function setsModal(workId) {
  const mine = state.sets;
  openModal(`
    <h3 class="h3">加入收藏集</h3>
    <p class="modal__sub">Rijksstudio 式自建收藏集——像策展人一样组织你的观看。</p>
    <div id="setlist">
      ${mine.length ? mine.map(s => `
        <div class="setrow ${s.items.includes(workId) ? "is-on" : ""}" data-set="${s.id}">
          <span class="dot">${I.check}</span><b>${esc(s.name)}</b><span>${s.items.length} 件</span>
        </div>`).join("") : `<p class="grey small" style="padding:8px 0 14px">还没有收藏集,在下面建一个。</p>`}
    </div>
    <div class="row" style="margin-top:16px">
      <input class="textin grow" id="newset-name" placeholder="新收藏集名称,如「夏季山水」" maxlength="24">
      <button class="btn btn--dark" id="newset-go">新建</button>
    </div>
    <div class="modal__acts"><button class="btn btn--quiet" id="sets-close">完成</button></div>`)
  .querySelector("#setlist").addEventListener("click", e => {
    const row = e.target.closest(".setrow"); if (!row) return;
    const set = state.sets.find(x => x.id === row.dataset.set);
    const i = set.items.indexOf(workId);
    if (i >= 0) set.items.splice(i, 1); else set.items.push(workId);
    saveState(); row.classList.toggle("is-on", i < 0);
    row.querySelector("span:last-child").textContent = set.items.length + " 件";
    toast(i < 0 ? `${I.check} 已加入「${esc(set.name)}」` : `已移出「${esc(set.name)}」`);
  });
  const ovEl = overlayRoot.firstElementChild;
  ovEl.querySelector("#newset-go").addEventListener("click", () => {
    const name = ovEl.querySelector("#newset-name").value.trim();
    if (!name) { toast("先给收藏集起个名字"); return; }
    const set = { id: uid("set"), name, items: [workId], created: Date.now() };
    state.sets.unshift(set); saveState();
    toast(`${I.check} 收藏集「${esc(name)}」已建立`, true);
    setsModal(workId);
  });
  ovEl.querySelector("#sets-close").addEventListener("click", closeModal);
}

/* ============================================================
   我的 Rijksstudio(Studio)
   ============================================================ */
function viewStudio() {
  setActiveNav("studio");
  const tab = current.q.get("tab") || "overview";
  const p = state.profile;
  const tabs = [
    ["overview", "总览"], ["sets", `收藏集${state.sets.length + DEMO_SETS.length}`],
    ["likes", `收藏作品${state.likes.length}`], ["crops", `细节墙${state.crops.length}`],
    ["creations", `我的创作${state.creations.length}`],
  ];
  const tabUrl = t => `#/studio?tab=${t}`;

  view.innerHTML = `
  <section class="studiohead">
    <div class="container studiohead__row">
      <div class="avatar">${esc((p.name || "观")[0])}</div>
      <div>
        <h1 class="h-display h2">${esc(p.name)} 的 Rijksstudio</h1>
        <div class="studiohead__sub">收藏 · 裁剪 · 再创作 —— 你的观看档案</div>
      </div>
      <div class="statgrid">
        <div class="stat"><b><a href="${tabUrl("likes")}">${state.likes.length}</a></b><span>收藏</span></div>
        <div class="stat"><b><a href="${tabUrl("crops")}">${state.crops.length}</a></b><span>细节</span></div>
        <div class="stat"><b><a href="${tabUrl("sets")}">${state.sets.length}</a></b><span>收藏集</span></div>
        <div class="stat"><b><a href="${tabUrl("creations")}">${state.creations.length}</a></b><span>创作</span></div>
      </div>
    </div>
  </section>
  <div class="container page">
    <div class="tabs">
      ${tabs.map(([k, lbl]) => `<a class="tabbtn ${tab === k ? "is-on" : ""}" href="${tabUrl(k)}">${lbl}</a>`).join("")}
    </div>
    <div id="studio-body">${studioTab(tab)}</div>
  </div>`;
}

function studioTab(tab) {
  if (tab === "sets") {
    const cards = [
      `<a class="setcard" href="javascript:void 0" id="newset-card"><div class="setcard__plus">＋ 新建收藏集</div><div class="setcard__name">新建收藏集</div><div class="setcard__meta">把相关的藏品组织在一起</div></a>`,
      ...state.sets.map(s => `
        <a class="setcard" href="#/set/${encodeURIComponent(s.id)}">
          <div class="setcard__cover">${s.items.length ? setCoverImgs(s.items, 2) : `<div class="setcard__plus" style="position:static;display:grid">空收藏集</div>`}</div>
          <div class="setcard__name">${esc(s.name)}</div>
          <div class="setcard__meta">${s.items.length} 件 · ${fmtDate(s.created)}</div>
        </a>`),
      ...DEMO_SETS.map(s => `
        <a class="setcard" href="#/set/${encodeURIComponent(s.id)}">
          <div class="setcard__cover">${setCoverImgs(s.items, 2)}</div>
          <div class="setcard__name">${esc(s.name)} <span class="wcard__tag" style="position:static;margin-left:6px;background:var(--grey)">示例</span></div>
          <div class="setcard__meta">${s.items.length} 件 · 官方示例</div>
        </a>`),
    ];
    return `<div class="masonry" style="columns:3 260px">${cards.join("")}</div>`;
  }
  if (tab === "likes") {
    const works = state.likes.map(workById).filter(Boolean);
    return works.length
      ? `<div class="masonry">${works.map(workCard).join("")}</div>`
      : emptyBox("还没有收藏", "去馆藏里,点亮卡片右上角的爱心。", "#/collection", "进入馆藏");
  }
  if (tab === "crops") {
    return state.crops.length
      ? `<div class="masonry">${state.crops.map(cropCard).join("")}</div>`
      : emptyBox("细节墙还是空的", "打开一件作品,放大,裁下最打动你的局部。", "#/collection", "去裁剪第一个细节");
  }
  if (tab === "creations") {
    return state.creations.length
      ? `<div class="masonry" style="columns:3 260px">${state.creations.map(creationCard).join("")}</div>`
      : emptyBox("还没有创作", "把细节和藏品拖上画布,完成你的第一次再创作。", "#/make", "去创作");
  }
  /* overview */
  const recentCrops = state.crops.slice(0, 4);
  const recentLikes = state.likes.map(workById).filter(Boolean).slice(0, 4);
  return `
  <div class="row" style="margin-bottom:18px">
    <a class="btn btn--primary" href="#/collection">去馆藏逛逛</a>
    <a class="btn btn--ghost" href="#/make">${I.plus} 开始一次创作</a>
  </div>
  ${recentCrops.length ? `
    <div class="section-head mt-0"><div><div class="kicker">最近裁剪</div><h2 class="h-display h2" style="font-size:1.25rem">细节墙</h2></div><a class="link" href="${"#/studio?tab=crops"}"><span>全部 →</span></a></div>
    <div class="masonry" style="columns:4 220px;margin-bottom:10px">${recentCrops.map(cropCard).join("")}</div>` : ""}
  ${recentLikes.length ? `
    <div class="section-head"><div><div class="kicker">最近收藏</div><h2 class="h-display h2" style="font-size:1.25rem">心动的作品</h2></div><a class="link" href="#/studio?tab=likes"><span>全部 →</span></a></div>
    <div class="masonry" style="columns:4 220px">${recentLikes.map(workCard).join("")}</div>` : ""}`;
}

function emptyBox(title, sub, href, btn) {
  return `<div class="emptybox"><h3 class="h3">${title}</h3><p>${sub}</p><a class="btn btn--ghost" href="${href}">${btn}</a></div>`;
}

function cropCard(c) {
  const w = workById(c.work);
  return `
  <div class="ccard">
    <img src="${c.data}" alt="细节" loading="lazy">
    <div class="ccard__acts">
      <button title="去创作" data-crop-make="${c.id}">${I.plus}</button>
      <button title="编辑注释" data-crop-edit="${c.id}">${I.edit}</button>
      <button title="删除" data-crop-del="${c.id}">${I.trash}</button>
    </div>
    <div class="ccard__body">
      <div class="ccard__note">${c.note ? esc(c.note) : '<span class="grey">未写注释</span>'}</div>
      ${w ? `<a class="ccard__src" href="#/work/${encodeURIComponent(w.id)}">自 <b>${esc(w.name)}</b> · ${esc(w.artist)}</a>` : ""}
    </div>
  </div>`;
}

function creationCard(cr) {
  return `
  <div class="ccard creation-card">
    <img src="${cr.data}" alt="${esc(cr.title)}" loading="lazy">
    <div class="ccard__acts">
      <button title="下载" data-cr-dl="${cr.id}">${I.down}</button>
      <button title="重命名" data-cr-edit="${cr.id}">${I.edit}</button>
      <button title="删除" data-cr-del="${cr.id}">${I.trash}</button>
    </div>
    <div class="ccard__body">
      <div class="ccard__note"><b>${esc(cr.title)}</b></div>
      <div class="ccard__src">${fmtDate(cr.created)}</div>
    </div>
  </div>`;
}

/* 细节墙 / 创作的操作 */
view.addEventListener("click", e => {
  const mk = e.target.closest("[data-crop-make]");
  if (mk) {
    const c = state.crops.find(x => x.id === mk.dataset.cropMake);
    if (c) { makeStash = [{ src: c.data, ar: c.ar }]; location.hash = "#/make"; }
    return;
  }
  const ed = e.target.closest("[data-crop-edit]");
  if (ed) {
    const c = state.crops.find(x => x.id === ed.dataset.cropEdit);
    if (c) {
      const ov = openModal(`
        <h3 class="h3">编辑细节注释</h3>
        <img src="${c.data}" style="width:100%;border:1px solid var(--line);border-radius:2px;margin:12px 0" alt="">
        <input class="textin" id="crop-note2" value="${esc(c.note)}" placeholder="一句注…" maxlength="60">
        <div class="modal__acts">
          <button class="btn btn--quiet" id="cn-del" style="margin-right:auto;color:var(--accent)">${I.trash} 删除细节</button>
          <button class="btn btn--primary" id="cn-ok">保存</button>
        </div>`);
      ov.querySelector("#cn-ok").addEventListener("click", () => {
        c.note = ov.querySelector("#crop-note2").value.trim();
        saveState(); closeModal(); render(); toast("注释已保存");
      });
      ov.querySelector("#cn-del").addEventListener("click", () => {
        state.crops = state.crops.filter(x => x.id !== c.id);
        saveState(); closeModal(); render(); toast("细节已删除");
      });
    }
    return;
  }
  const del = e.target.closest("[data-crop-del]");
  if (del) {
    state.crops = state.crops.filter(x => x.id !== del.dataset.cropDel);
    saveState(); render(); toast("细节已删除");
    return;
  }
  const dl = e.target.closest("[data-cr-dl]");
  if (dl) {
    const cr = state.creations.find(x => x.id === dl.dataset.crDl);
    if (cr) downloadDataUrl(cr.data, `${cr.title}-再观创作.png`);
    return;
  }
  const ce = e.target.closest("[data-cr-edit]");
  if (ce) {
    const cr = state.creations.find(x => x.id === ce.dataset.crEdit);
    if (cr) {
      const name = prompt("创作标题", cr.title);
      if (name && name.trim()) { cr.title = name.trim(); saveState(); render(); }
    }
    return;
  }
  const cd = e.target.closest("[data-cr-del]");
  if (cd) {
    if (confirm("删除这个创作?")) {
      state.creations = state.creations.filter(x => x.id !== cd.dataset.crDel);
      saveState(); render(); toast("创作已删除");
    }
    return;
  }
  const ns = e.target.closest("#newset-card");
  if (ns) {
    const name = prompt("收藏集名称", "");
    if (name && name.trim()) {
      state.sets.unshift({ id: uid("set"), name: name.trim(), items: [], created: Date.now() });
      saveState(); render(); toast(`${I.check} 收藏集已建立`, true);
    }
  }
});

/* ============================================================
   收藏集详情
   ============================================================ */
function viewSet(id) {
  setActiveNav("studio");
  const isDemo = id.startsWith("demo:");
  const set = isDemo ? DEMO_SETS.find(s => s.id === id) : state.sets.find(s => s.id === id);
  if (!set) { view.innerHTML = emptyBox("收藏集不存在", "", "#/studio?tab=sets", "返回收藏集"); return; }
  const works = set.items.map(workById).filter(Boolean);

  view.innerHTML = `
  <div class="container page">
    <div class="crumbs"><a href="#/studio">我的 Rijksstudio</a> / <a href="#/studio?tab=sets">收藏集</a> / ${esc(set.name)}</div>
    <div class="row spread" style="margin-bottom:6px">
      <div>
        <h1 class="h-display h2">${esc(set.name)}</h1>
        <div class="small grey" style="margin-top:6px">${works.length} 件作品 · ${isDemo ? "官方示例 · " + set.date : fmtDate(set.created)}${isDemo ? "" : " · 我的收藏集"}</div>
      </div>
      <div class="row">
        ${isDemo ? `<button class="btn btn--ghost btn--sm" id="copy-set">${I.copy} 复制为我的收藏集</button>` : `
          <button class="btn btn--quiet btn--sm" id="rename-set">${I.edit} 重命名</button>
          <button class="btn btn--quiet btn--sm" id="del-set" style="color:var(--accent)">${I.trash} 删除收藏集</button>`}
      </div>
    </div>
    ${works.length
      ? `<div class="masonry">${works.map(w => workCard(w).replace("</a>", `
          <button class="ccard__acts" style="position:absolute;top:8px;left:8px;opacity:0" data-rmfrom="${esc(w.id)}" title="移出收藏集">${I.x}</button></a>`)).join("")}</div>`
      : emptyBox("收藏集还是空的", "去馆藏里,用作品页的「加入收藏集」把它填满。", "#/collection", "进入馆藏")}
  </div>`;

  document.getElementById("copy-set")?.addEventListener("click", () => {
    state.sets.unshift({ id: uid("set"), name: set.name + "(副本)", items: [...set.items], created: Date.now() });
    saveState(); toast(`${I.check} 已复制为我的收藏集`, true);
    location.hash = "#/studio?tab=sets";
  });
  document.getElementById("rename-set")?.addEventListener("click", () => {
    const name = prompt("收藏集名称", set.name);
    if (name && name.trim()) { set.name = name.trim(); saveState(); render(); }
  });
  document.getElementById("del-set")?.addEventListener("click", () => {
    if (confirm(`删除收藏集「${set.name}」?作品本身不受影响。`)) {
      state.sets = state.sets.filter(s => s.id !== id);
      saveState(); toast("收藏集已删除");
      location.hash = "#/studio?tab=sets";
    }
  });
  view.querySelectorAll("[data-rmfrom]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation();
      set.items = set.items.filter(x => x !== btn.dataset.rmfrom);
      saveState(); render(); toast("已移出收藏集");
    });
  });
}

/* ============================================================
   创作 Make(拼贴编辑器)
   ============================================================ */
let makeStash = null; // 从细节墙带来的初始素材
const MAKE_W = 680, MAKE_H = 906;
const MAKE_BG = ["#FFFFFF", "#F5F0E3", "#EAEAEA", "#C2CCCE", "#CC4C28", "#436178", "#5E99B0", "#AAA04D", "#202327", "#52755C"];
const TEXT_COLORS = ["#202327", "#FFFFFF", "#CC4C28", "#436178", "#AAA04D"];

function viewMake() {
  setActiveNav("make");
  if (!view.dataset.makeInit) {
    view.dataset.makeInit = "1";
  }
  if (!makeState || makeState.expired) makeState = { els: [], sel: null, bg: "#FFFFFF", zTop: 1, expired: false };
  if (makeStash) {
    makeStash.forEach(s => makeState.els.push({
      id: uid("el"), type: "img", src: s.src, ar: s.ar || 1,
      x: MAKE_W * 0.28, y: MAKE_H * 0.26, w: MAKE_W * 0.44, h: MAKE_W * 0.44 / (s.ar || 1), rot: 0, z: ++makeState.zTop,
    }));
    makeStash = null;
  }

  view.innerHTML = `
  <div class="container page">
    <div class="section-head mt-0" style="margin-top:26px">
      <div><div class="kicker">Make</div><h1 class="h-display h2">创作 · 用藏品再创作</h1></div>
    </div>
    <div class="make">
      <div class="makestage-wrap">
        <div class="makebar">
          <span class="filterbar__label">底色</span>
          <div class="bgpick">
            ${MAKE_BG.map(c => `<button class="swatch ${makeState.bg === c ? "is-on" : ""}" data-bg="${c}" style="background:${c}" title="${c}"></button>`).join("")}
          </div>
          <span class="spacer"></span>
          <button class="btn btn--quiet btn--sm" id="mk-text">${I.edit} 添加文字</button>
          <button class="btn btn--quiet btn--sm" id="mk-export">${I.down} 导出 / 保存</button>
        </div>
        <div class="makestage" id="mk-stage">
          <div id="mk-inner" style="position:absolute;left:0;top:0;width:${MAKE_W}px;height:${MAKE_H}px;transform-origin:0 0"></div>
        </div>
        <div class="elbar" id="mk-elbar">
          <button class="btn btn--quiet btn--sm" id="el-up" title="图层上移">${I.layers} 上移</button>
          <button class="btn btn--quiet btn--sm" id="el-down" title="图层下移">${I.layers} 下移</button>
          <button class="btn btn--quiet btn--sm" id="el-copy">${I.copy} 复制</button>
          <button class="btn btn--quiet btn--sm" id="el-del" style="color:var(--accent)">${I.trash} 删除选中</button>
          <button class="btn btn--quiet btn--sm" id="el-clear" style="color:var(--accent)">${I.x} 清空画布</button>
        </div>
        <div class="textpanel" id="mk-textpanel">
          <label>文字内容</label>
          <textarea id="tp-text" placeholder="想说的话…"></textarea>
          <label>字号</label>
          <div class="row"><input type="range" id="tp-size" min="18" max="120" value="44" style="flex:1"><span id="tp-sizev" class="small">44</span></div>
          <label>颜色</label>
          <div class="swatches">${TEXT_COLORS.map(c => `<button class="swatch" data-tc="${c}" style="background:${c}"></button>`).join("")}</div>
        </div>
      </div>

      <aside class="drawer">
        <div class="drawer__tabs">
          <button class="tabbtn is-on" data-dt="crops">细节</button>
          <button class="tabbtn" data-dt="likes">收藏</button>
          <button class="tabbtn" data-dt="kb">馆藏</button>
          <button class="tabbtn" data-dt="photos">照片</button>
        </div>
        <div class="drawer__grid" id="mk-drawer"></div>
        <div class="drawer__hint">点按素材加入画布 · 拖动摆放 · 四角缩放 · 顶部圆点旋转</div>
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

  document.querySelectorAll(".bgpick [data-bg]").forEach(b =>
    b.addEventListener("click", () => {
      makeState.bg = b.dataset.bg;
      document.querySelectorAll(".bgpick [data-bg]").forEach(x => x.classList.toggle("is-on", x.dataset.bg === makeState.bg));
      renderMakeStage();
    }));

  document.getElementById("mk-text").addEventListener("click", () => {
    const el = { id: uid("el"), type: "text", text: "再观", size: 44, color: "#202327", x: MAKE_W * 0.2, y: MAKE_H * 0.4, w: MAKE_W * 0.6, h: 60, rot: 0, z: ++makeState.zTop };
    makeState.els.push(el); makeState.sel = el.id;
    renderMakeStage(); openTextPanel(el);
  });
  document.getElementById("mk-export").addEventListener("click", exportMake);

  document.getElementById("el-del").addEventListener("click", () => { delSel(); });
  document.getElementById("el-copy").addEventListener("click", () => {
    const el = selEl(); if (!el) return;
    const c = { ...el, id: uid("el"), x: el.x + 24, y: el.y + 24, z: ++makeState.zTop };
    makeState.els.push(c); makeState.sel = c.id; renderMakeStage();
  });
  document.getElementById("el-clear").addEventListener("click", () => {
    if (!makeState.els.length || confirm("清空画布?")) { makeState.els = []; makeState.sel = null; renderMakeStage(); }
  });
  document.getElementById("el-up").addEventListener("click", () => { moveLayer(+1); });
  document.getElementById("el-down").addEventListener("click", () => { moveLayer(-1); });

  document.addEventListener("keydown", makeKeydown);
}

let makeState = null;
function selEl() { return makeState.els.find(e => e.id === makeState.sel); }
function delSel() {
  makeState.els = makeState.els.filter(e => e.id !== makeState.sel);
  makeState.sel = null; renderMakeStage();
}
function moveLayer(d) {
  const el = selEl(); if (!el) return;
  el.z += d * 1.5; if (d > 0) el.z = Math.max(el.z, ++makeState.zTop);
  renderMakeStage();
}
function makeKeydown(e) {
  if (!location.hash.startsWith("#/make")) { document.removeEventListener("keydown", makeKeydown); return; }
  if (e.target.matches("input, textarea")) return;
  if (e.key === "Delete" || e.key === "Backspace") { if (makeState.sel) { e.preventDefault(); delSel(); } }
  if (e.key === "Escape") { makeState.sel = null; renderMakeStage(); }
}

function renderDrawer(tab) {
  const grid = document.getElementById("mk-drawer");
  let items = [];
  if (tab === "crops") items = state.crops.map(c => ({ src: c.data, ar: c.ar, title: c.note || "细节" }));
  if (tab === "likes") items = state.likes.map(workById).filter(Boolean).map(w => ({ src: workImage(w, 480), ar: w.ar, title: w.name }));
  if (tab === "kb") items = KB.map(w => ({ src: workImage(w, 480), ar: w.ar, title: w.name }));
  if (tab === "photos") items = state.photos.map(w => ({ src: workImage(w, 480), ar: w.ar, title: w.name }));
  grid.innerHTML = items.length
    ? items.map((it, i) => `<div class="drawer__item" data-add="${tab}:${i}" title="${esc(it.title)}"><img src="${it.src}" alt="" loading="lazy"></div>`).join("")
    : `<p class="grey small" style="grid-column:1/-1;padding:8px 2px">这里还没有素材。</p>`;
  grid.querySelectorAll("[data-add]").forEach(d =>
    d.addEventListener("click", () => {
      const [t, i] = d.dataset.add.split(":");
      const it = t === "crops" ? state.crops[+i] : t === "likes" ? workById(state.likes[+i]) : t === "kb" ? KB[+i] : state.photos[+i];
      if (!it) return;
      const src = t === "crops" ? it.data : workImage(it, 480);
      const ar = it.ar || 1;
      const w = MAKE_W * 0.46, h = w / Math.max(0.4, Math.min(3.4, ar));
      makeState.els.push({ id: uid("el"), type: "img", src, ar, x: (MAKE_W - w) / 2, y: (MAKE_H - h) / 2, w, h, rot: 0, z: ++makeState.zTop });
      renderMakeStage();
    }));
}

let stageScale = 1;
function renderMakeStage() {
  const outer = document.getElementById("mk-stage");
  const inner = document.getElementById("mk-inner");
  if (!outer || !inner) return;
  stageScale = outer.clientWidth / MAKE_W;
  inner.style.transform = `scale(${stageScale})`;
  inner.style.background = makeState.bg;
  const sorted = [...makeState.els].sort((a, b) => a.z - b.z);
  inner.innerHTML = sorted.map(el => {
    if (el.type === "img") {
      return `<div class="el ${el.id === makeState.sel ? "is-sel" : ""}" data-el="${el.id}" style="left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;transform:rotate(${el.rot}rad)">
        <img class="el-img" src="${el.src}" alt="" draggable="false">
        <div class="el__handle" data-h="se"></div><div class="el__rot" data-h="rot"></div>
      </div>`;
    }
    return `<div class="el ${el.id === makeState.sel ? "is-sel" : ""}" data-el="${el.id}" style="left:${el.x}px;top:${el.y}px;width:${el.w}px;transform:rotate(${el.rot}rad);font-size:${el.size}px;font-weight:700;color:${el.color};line-height:1.25;white-space:normal;word-break:break-word;font-family:var(--sans)">
      ${esc(el.text)}<div class="el__handle" data-h="se"></div><div class="el__rot" data-h="rot"></div>
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
      // 记录文本元素真实高度
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
        node.style.width = el.w + "px";
        if (el.type === "img") node.style.height = el.h + "px";
        node.style.transform = `rotate(${el.rot}rad)`;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
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
  } else {
    panel.classList.remove("is-open");
  }
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

/* 导出创作 */
async function exportMake() {
  if (!makeState.els.length) { toast("画布还是空的,先加一点素材"); return; }
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
      ctx.translate(el.x + el.w / 2, el.y + textHeight(el) / 2);
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
    <div class="kicker" style="margin-bottom:8px">✎ 创作完成</div>
    <h3 class="h3" style="margin-bottom:14px">已存入「我的创作」</h3>
    <img src="${data}" style="width:100%;border:1px solid var(--line);border-radius:2px;margin-bottom:14px" alt="创作">
    <div class="field"><label>标题</label><input class="textin" id="cr-title" value="未命名创作" maxlength="24"></div>
    <div class="modal__acts">
      <button class="btn btn--quiet" id="crx-close">关闭</button>
      <button class="btn btn--primary" id="crx-dl">${I.down} 下载 PNG</button>
    </div>`);
  ov.querySelector("#crx-dl").addEventListener("click", () => {
    cr.title = ov.querySelector("#cr-title").value.trim() || "未命名创作";
    saveState();
    downloadDataUrl(data, `${cr.title}-再观创作.png`);
  });
  ov.querySelector("#crx-close").addEventListener("click", () => {
    cr.title = ov.querySelector("#cr-title").value.trim() || "未命名创作";
    saveState(); closeModal(); toast("已保存到「我的 Rijksstudio · 我的创作」", true);
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

/* 窗口尺寸变化时重算画布缩放 */
window.addEventListener("resize", () => {
  if (location.hash.startsWith("#/make") && document.getElementById("mk-inner")) {
    renderMakeStageKeepSel();
  }
});

/* ============================================================
   设置
   ============================================================ */
function viewSettings() {
  setActiveNav("settings");
  const p = state.profile;
  view.innerHTML = `
  <div class="container page">
    <div class="section-head mt-0" style="margin-top:26px">
      <div><div class="kicker">Settings</div><h1 class="h-display h2">设置</h1></div>
    </div>
    <div class="settings-grid">
      <div class="panel">
        <h3 class="h3">个人资料</h3>
        <div class="field">
          <label>昵称(显示在 Rijksstudio)</label>
          <input class="textin" id="pf-name" value="${esc(p.name)}" maxlength="16">
        </div>
        <button class="btn btn--dark btn--sm" id="pf-save">保存</button>
      </div>
      <div class="panel">
        <h3 class="h3">我的数据</h3>
        <p class="small grey" style="margin-bottom:16px">收藏、细节、收藏集、创作与笔记全部只存在这台浏览器的 localStorage。换设备前请先导出。</p>
        <div class="row">
          <button class="btn btn--ghost btn--sm" id="dt-export">${I.down} 导出 JSON</button>
          <button class="btn btn--ghost btn--sm" id="dt-import">${I.plus} 导入</button>
          <button class="btn btn--quiet btn--sm" id="dt-clear" style="color:var(--accent)">${I.trash} 清空全部</button>
          <input type="file" id="dt-file" accept="application/json" hidden>
        </div>
      </div>
      <div class="panel">
        <h3 class="h3">关于再观</h3>
        <div class="about-quote">
          「再观」是一套观展后个人文化记忆系统:上传照片、识别线索、记录感受、形成档案。
          本版界面复刻学习荷兰国立博物馆 Rijksstudio——业界公认最佳博物馆网站 UX
          的三大支柱:<b>收藏作品 ♥ · 裁剪细节 ✂ · 用藏品再创作 ✎</b>。
        </div>
        <p class="small grey">内置藏品图均为程序化生成的示意画面,非博物馆原件影像。配色逐色提取自 rijksmuseum.nl 生产 CSS。</p>
      </div>
    </div>
  </div>`;

  document.getElementById("pf-save").addEventListener("click", () => {
    const v = document.getElementById("pf-name").value.trim();
    if (v) { state.profile.name = v; saveState(); toast("已保存", true); }
  });
  document.getElementById("dt-export").addEventListener("click", () => {
    const blob = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement("a");
    a.href = blob; a.download = `zaiguan-rijksstudio-${fmtDate(Date.now())}.json`;
    a.click(); toast("数据已导出");
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
        saveState(); toast("数据已导入", true); render();
      } catch { toast("文件格式不对"); }
    };
    rd.readAsText(f);
  });
  document.getElementById("dt-clear").addEventListener("click", () => {
    if (confirm("确定清空全部收藏、细节、收藏集与创作?此操作不可恢复。")) {
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
