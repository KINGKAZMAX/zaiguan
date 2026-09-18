/* ============================================================
   再观 Rijksstudio — 基础库
   馆藏 24 件 / 颜色筛选体系 / 程序化藏品图 / EXIF / 压缩
   ============================================================ */

/* ---------- 颜色家族(Rijksmuseum 式颜色筛选,取自其官网色板) ---------- */
const HUES = {
  qing: { name: "石青", dot: "#2F5D6E" },
  dai:  { name: "黛蓝", dot: "#436178" },
  zhe:  { name: "赭红", dot: "#CC4C28" },
  jin:  { name: "鎏金", dot: "#AAA04D" },
  mo:   { name: "玄墨", dot: "#202327" },
  su:   { name: "月白", dot: "#C2CCCE" },
};

/* ---------- 馆藏(内置博物馆 Collection) ---------- */
const KB = [
  { name: "千里江山图", artist: "王希孟", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "qing" },
  { name: "清明上河图", artist: "张择端", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "dai" },
  { name: "步辇图", artist: "阎立本", era: "唐代", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "qing" },
  { name: "溪山行旅图", artist: "范宽", era: "北宋", medium: "绢本水墨", category: "绘画", collection: "台北故宫博物院", hue: "mo" },
  { name: "富春山居图(剩山图)", artist: "黄公望", era: "元代", medium: "纸本水墨", category: "绘画", collection: "浙江省博物馆", hue: "mo" },
  { name: "洛神赋图(宋摹本)", artist: "顾恺之(原作)", era: "东晋", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "dai" },
  { name: "韩熙载夜宴图", artist: "顾闳中", era: "五代", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "dai" },
  { name: "瑞鹤图", artist: "赵佶", era: "北宋", medium: "绢本设色", category: "绘画", collection: "辽宁省博物馆", hue: "qing" },
  { name: "快雪时晴帖", artist: "王羲之", era: "东晋", medium: "纸本行书", category: "书法", collection: "台北故宫博物院", hue: "mo" },
  { name: "祭侄文稿", artist: "颜真卿", era: "唐代", medium: "纸本行书", category: "书法", collection: "台北故宫博物院", hue: "su" },
  { name: "兰亭序(神龙本)", artist: "冯承素(摹)", era: "唐代", medium: "纸本行书", category: "书法", collection: "故宫博物院", hue: "mo" },
  { name: "莲鹤方壶", artist: "失记载", era: "春秋", medium: "青铜", category: "青铜器", collection: "河南博物院", hue: "zhe" },
  { name: "大禾人面纹方鼎", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "湖南博物院", hue: "zhe" },
  { name: "妇好鸮尊", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "中国国家博物馆", hue: "zhe" },
  { name: "青铜大立人像", artist: "佚名工匠", era: "商代晚期", medium: "青铜", category: "青铜器", collection: "三星堆博物馆", hue: "zhe" },
  { name: "铜车马(一号车)", artist: "佚名工匠", era: "秦代", medium: "青铜", category: "青铜器", collection: "秦始皇帝陵博物院", hue: "zhe" },
  { name: "太阳神鸟金饰", artist: "佚名工匠", era: "商周之际", medium: "金箔", category: "金银器", collection: "成都金沙遗址博物馆", hue: "jin" },
  { name: "金面具", artist: "佚名工匠", era: "商代晚期", medium: "金箔", category: "金银器", collection: "三星堆博物馆", hue: "jin" },
  { name: "汝窑天青釉弦纹三足樽", artist: "汝窑", era: "北宋", medium: "瓷器", category: "瓷器", collection: "台北故宫博物院", hue: "qing" },
  { name: "唐三彩骆驼载乐俑", artist: "佚名工匠", era: "唐代", medium: "陶器", category: "瓷器", collection: "中国国家博物馆", hue: "jin" },
  { name: "睡莲", artist: "克劳德·莫奈", era: "1906年", medium: "布面油画", category: "绘画", collection: "芝加哥艺术博物馆", hue: "qing" },
  { name: "向日葵", artist: "文森特·梵高", era: "1888年", medium: "布面油画", category: "绘画", collection: "伦敦国家美术馆", hue: "jin" },
  { name: "舞蹈课", artist: "埃德加·德加", era: "1874年", medium: "布面油画", category: "绘画", collection: "奥赛博物馆", hue: "su" },
  { name: "思想者", artist: "奥古斯特·罗丹", era: "1880年", medium: "青铜雕塑", category: "雕塑", collection: "罗丹博物馆", hue: "zhe" },
];
KB.forEach((k, i) => { k.id = "kb:" + i; });

const CATEGORIES = [...new Set(KB.map(k => k.category))];

/* ---------- 确定性伪随机 ---------- */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 程序化藏品图(画布版,可裁剪/可用于再创作) ---------- */
function posterCanvas(name, family, size = 520) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const base = HUES[family] ? HUES[family].dot : "#4E5A66";
  const deep = shade(base, -0.42);
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, shade(base, 0.18)); g.addColorStop(1, deep);
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const r = ctx.createRadialGradient(size * 0.32, size * 0.26, 0, size * 0.32, size * 0.26, size * 0.85);
  r.addColorStop(0, "rgba(252,249,242,0.20)"); r.addColorStop(1, "rgba(252,249,242,0)");
  ctx.fillStyle = r; ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(hashStr(name || "x"));
  ctx.strokeStyle = "rgba(250,247,240,0.20)"; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(size * (0.12 + rand() * 0.76), size * (0.12 + rand() * 0.76), size * (0.08 + rand() * 0.34), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(250,247,240,0.32)";
  ctx.strokeRect(13.5, 13.5, size - 27, size - 27);
  const chars = [...(name || "?").replace(/[()《》·\s]/g, "")].slice(0, 2);
  ctx.fillStyle = "rgba(250,247,240,0.95)";
  ctx.font = `700 ${Math.round(size * 0.26)}px "Songti SC","STSong","Noto Serif SC",serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (chars.length > 1) {
    ctx.fillText(chars[0], size * 0.37, size * 0.43);
    ctx.fillText(chars[1], size * 0.63, size * 0.62);
  } else {
    ctx.fillText(chars[0] || "?", size / 2, size / 2);
  }
  return cv;
}
/* hex 变亮/变深 */
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (k >= 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const posterCache = {};
const posterSrc = (id, name, family) => {
  if (!posterCache[id]) {
    posterCache[id] = posterCanvas(name, family).toDataURL("image/jpeg", 0.9);
  }
  return posterCache[id];
};
function cropCanvasDataUrl(cv, x, y, w, h, maxDim = 900) {
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const out = document.createElement("canvas");
  out.width = Math.round(w * scale); out.height = Math.round(h * scale);
  out.getContext("2d").drawImage(cv, x, y, w, h, 0, 0, out.width, out.height);
  return out.toDataURL("image/jpeg", 0.85);
}

/* ---------- 照片主色 → 颜色家族(Rijksmuseum 色彩检索精神) ---------- */
function classifyFamily(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 8;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, 8, 8);
      const d = ctx.getImageData(0, 0, 8, 8).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      r /= 64; g /= 64; b /= 64;
      let best = "su", bd = 1e9;
      for (const [k, v] of Object.entries(HUES)) {
        const n = parseInt(v.dot.slice(1), 16);
        const dr = r - ((n >> 16) & 255), dg = g - ((n >> 8) & 255), db = b - (n & 255);
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bd) { bd = dist; best = k; }
      }
      resolve(best);
    };
    img.onerror = () => resolve("su");
    img.src = dataUrl;
  });
}

/* ---------- JPEG EXIF 拍摄时间(0x9003) ---------- */
function parseExifDate(arrayBuffer) {
  try {
    const v = new DataView(arrayBuffer);
    if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return null;
    let off = 2, tiff = -1;
    while (off < v.byteLength - 4) {
      if (v.getUint8(off) !== 0xFF) break;
      const marker = v.getUint8(off + 1);
      const size = v.getUint16(off + 2);
      if (marker === 0xE1 && v.getUint32(off + 4) === 0x45786966) { tiff = off + 10; break; }
      off += 2 + size;
    }
    if (tiff < 0) return null;
    const little = v.getUint16(tiff) === 0x4949;
    const u16 = p => v.getUint16(p, little), u32 = p => v.getUint32(p, little);
    const walk = (ifd) => {
      const n = u16(ifd);
      for (let i = 0; i < n; i++) {
        const e = ifd + 2 + i * 12;
        const tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
        if (tag === 0x9003 && type === 2 && cnt >= 19) {
          const valOff = cnt > 4 ? tiff + u32(e + 8) : e + 8;
          let s = "";
          for (let j = 0; j < cnt - 1; j++) s += String.fromCharCode(v.getUint8(valOff + j));
          const m = s.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
          if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
        }
        if (tag === 0x8769) { const r = walk(tiff + u32(e + 8)); if (r) return r; }
      }
      return null;
    };
    return walk(tiff + u32(tiff + 4));
  } catch (e) { return null; }
}

/* ---------- 图片压缩 ---------- */
function compressImage(file, maxDim = 1000, quality = 0.82) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawBuf = reader.result;
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.round(w * scale); h = Math.round(h * scale);
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve({ dataUrl: cv.toDataURL("image/jpeg", quality), rawBuf, w: img.width, h: img.height });
      };
      img.onerror = () => resolve({ dataUrl: null, rawBuf });
      img.src = rawBuf;
    };
    reader.onerror = () => resolve({ dataUrl: null, rawBuf: null });
    reader.readAsDataURL(file);
  });
}

/* ---------- 通用 ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
