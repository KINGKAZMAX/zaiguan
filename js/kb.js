/* ============================================================
   再观 Zaiguan — 知识库 / 示例数据 / 工具函数
   ============================================================ */

/* ---------- 馆藏知识库(模拟多模态识别的匹配候选) ---------- */
const KB = [
  { name: "千里江山图", artist: "王希孟", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院" },
  { name: "清明上河图", artist: "张择端", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院" },
  { name: "步辇图", artist: "阎立本", era: "唐代", medium: "绢本设色", category: "绘画", collection: "故宫博物院" },
  { name: "富春山居图(剩山图)", artist: "黄公望", era: "元代", medium: "纸本水墨", category: "绘画", collection: "浙江省博物馆" },
  { name: "洛神赋图(宋摹本)", artist: "顾恺之(原作)", era: "东晋", medium: "绢本设色", category: "绘画", collection: "故宫博物院" },
  { name: "快雪时晴帖", artist: "王羲之", era: "东晋", medium: "纸本行书", category: "书法", collection: "故宫博物院" },
  { name: "祭侄文稿", artist: "颜真卿", era: "唐代", medium: "纸本行书", category: "书法", collection: "台北故宫博物院" },
  { name: "莲鹤方壶", artist: "失记载", era: "春秋", medium: "青铜", category: "青铜器", collection: "河南博物院" },
  { name: "大禾人面纹方鼎", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "湖南博物院" },
  { name: "妇好鸮尊", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "中国国家博物馆" },
  { name: "青铜大立人像", artist: "佚名工匠", era: "商代晚期", medium: "青铜", category: "青铜器", collection: "三星堆博物馆" },
  { name: "铜车马(一号车)", artist: "佚名工匠", era: "秦代", medium: "青铜", category: "青铜器", collection: "秦始皇帝陵博物院" },
  { name: "汝窑天青釉弦纹三足樽", artist: "汝窑", era: "北宋", medium: "瓷器", category: "瓷器", collection: "台北故宫博物院" },
  { name: "唐三彩骆驼载乐俑", artist: "佚名工匠", era: "唐代", medium: "陶器", category: "瓷器", collection: "中国国家博物馆" },
  { name: "睡莲", artist: "克劳德·莫奈", era: "1906年", medium: "布面油画", category: "绘画", collection: "芝加哥艺术博物馆" },
  { name: "向日葵", artist: "文森特·梵高", era: "1888年", medium: "布面油画", category: "绘画", collection: "伦敦国家美术馆" },
  { name: "舞蹈课", artist: "埃德加·德加", era: "1874年", medium: "布面油画", category: "绘画", collection: "奥赛博物馆" },
  { name: "思想者", artist: "奥古斯特·罗丹", era: "1880年", medium: "青铜雕塑", category: "雕塑", collection: "罗丹博物馆" },
  { name: "玉神人纹边璋", artist: "佚名工匠", era: "商代", medium: "玉器", category: "玉器", collection: "三星堆博物馆" },
  { name: "太阳神鸟金饰", artist: "佚名工匠", era: "商周之际", medium: "金箔", category: "金银器", collection: "成都金沙遗址博物馆" },
];

/* ---------- 展品类别与配色(程序化生成展品占位图) ---------- */
const CATEGORIES = ["绘画", "书法", "青铜器", "瓷器", "玉器", "金银器", "雕塑", "摄影", "织绣", "其他"];
const CAT_PALETTE = {
  "绘画":  ["#33637a", "#152b38"], "书法":  ["#4a4a6e", "#1e1e30"],
  "青铜器": ["#77602e", "#33290f"], "瓷器":  ["#5d8296", "#243d4e"],
  "玉器":  ["#4e7a5e", "#20402c"], "金银器": ["#a3822e", "#4d3c10"],
  "雕塑":  ["#7a5c4e", "#3a2c24"], "摄影":  ["#55555c", "#232327"],
  "织绣":  ["#8c4a5e", "#3c1e28"], "其他":  ["#5d5d63", "#26262b"],
};

/* ---------- 匹配状态 ---------- */
const STATUS = {
  suggested:    { label: "系统建议", desc: "来自识别匹配,等待你确认" },
  confirmed:    { label: "已确认",   desc: "你已确认系统建议的信息" },
  modified:     { label: "已修改",   desc: "你在系统建议基础上修改过" },
  pending:      { label: "待补充",   desc: "信息暂缺,留待日后补充" },
  unrecognized: { label: "未识别",   desc: "暂未匹配到馆藏信息,可先记录感受" },
};

/* ---------- 年代分桶(兴趣线索用) ---------- */
const ERA_RULES = [
  ["先秦两汉", ["商", "周", "春秋", "战国", "秦", "汉"]],
  ["魏晋南北朝", ["魏晋", "东晋", "南北朝", "北魏"]],
  ["隋唐五代", ["隋", "唐", "五代"]],
  ["宋辽金元", ["宋", "辽", "金", "元"]],
  ["明清", ["明", "清"]],
  ["近现代", ["18", "19", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199"]],
];
function eraBucket(era) {
  if (!era) return null;
  for (const [bucket, keys] of ERA_RULES) if (keys.some(k => era.includes(k))) return bucket;
  return "其他";
}

/* ---------- 确定性伪随机(让"AI 建议"可复现) ---------- */
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

/* ---------- 程序化展品占位图(水墨/印章风格 SVG) ---------- */
function posterHTML(name, category, small) {
  const pal = CAT_PALETTE[category] || CAT_PALETTE["其他"];
  const chars = (name || "?").replace(/[()《》·\s]/g, "").slice(0, 2) || "?";
  const style = `--c1:${pal[0]};--c2:${pal[1]};`;
  const g1 = chars.length > 1
    ? `<div class="g1">${chars[0]}<br>${chars[1]}</div>`
    : `<div class="g1">${chars}</div>`;
  return `<div class="poster ${small ? "small" : ""}" style="${style}">${g1}</div>`;
}

/* ---------- 极简 JPEG EXIF 拍摄时间解析(0x9003) ---------- */
function parseExifDate(arrayBuffer) {
  try {
    const v = new DataView(arrayBuffer);
    if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return null;
    let off = 2;
    let tiff = -1;
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
    const ifd0 = tiff + u32(tiff + 4);
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
        if (tag === 0x8769) { const sub = tiff + u32(e + 8); const r = walk(sub); if (r) return r; }
      }
      return null;
    };
    return walk(ifd0);
  } catch (e) { return null; }
}

/* ---------- 图片压缩(dataURL,控制 localStorage 体积) ---------- */
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
        resolve({ dataUrl: cv.toDataURL("image/jpeg", quality), rawBuf });
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
const fmtDate = d => (d || "").trim() || "";
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* ---------- 示例数据(首次访问注入,可在设置中清除/恢复) ---------- */
function seedBooks() {
  const mk = (venue, exhibition, visitDate, items) => ({
    id: uid(), venue, exhibition, visitDate, createdAt: visitDate, items,
  });
  const item = (kb, status, exp, photoTakenAt, photoNull) => ({
    id: uid(),
    photo: photoNull ? null : null, /* 示例数据使用程序化占位图,不占用存储 */
    photoTakenAt: photoTakenAt || null,
    knowledge: {
      name: kb.name, artist: kb.artist, era: kb.era, medium: kb.medium,
      category: kb.category, collection: kb.collection,
      source: "馆藏数据匹配(示例)", sourceType: "museum",
    },
    experience: Object.assign({ feeling: "", rating: 0, question: "", tags: [], isPublic: false }, exp),
    status,
  });
  return [
    mk("故宫博物院", "千里江山——历代青绿山水画特展", "2026-08-12", [
      item(KB[0], "confirmed",
        { feeling: "在展厅里站了将近二十分钟。石青石绿层层叠开,近看只是笔触,退后一步才是山河。原来十八岁可以把千里画得这么从容。",
          rating: 5, question: "卷尾的蔡京题跋为什么会保留下来?", tags: ["青绿山水", "色彩", "宋代"] },
        "2026-08-12 10:24"),
      item(KB[4], "suggested",
        { feeling: "人太多,只能隔着人海看一眼衣袂飘带。但那种'翩若惊鸿'的动势,隔多远都能感觉到。",
          rating: 4, tags: ["摹本", "人物"] },
        "2026-08-12 11:02"),
      item(KB[2], "pending",
        { feeling: "宫女们的排列有一种节奏感,像乐句。想之后对照原作尺寸再看看禄东赞的袍子纹样。",
          rating: 4, tags: ["纹样", "唐代"] },
        "2026-08-12 11:41"),
    ]),
    mk("上海博物馆", "星耀中国——三星堆·金沙古蜀文明展", "2026-07-05", [
      item(KB[10], "confirmed",
        { feeling: "环绕大立人走了三圈。那双手握成中空的环,握着的东西永远不在了,反而比拿着任何东西都更有想象力。",
          rating: 5, question: "大立人手中原本握的是什么?权杖?玉琮?还是象牙?", tags: ["青铜", "人像", "祭祀"] },
        "2026-07-05 14:15"),
      item(KB[19], "modified",
        { feeling: "金箔薄得像呼吸。四只神鸟绕着十二道光芒转,三千年前的人对'循环'的理解竟然这么轻盈。",
          rating: 5, tags: ["金器", "纹样", "宇宙"] },
        "2026-07-05 15:03"),
      item(KB[9], "unrecognized",
        { feeling: "隔着玻璃与鸮尊对视了很久。它好像在笑,又好像什么都不在乎。还没查到馆方说明,先把这种被注视的感觉记下来。",
          rating: 4, tags: ["凝视"] },
        "2026-07-05 15:47"),
    ]),
    mk("中国美术馆", "光影印象——莫奈与印象派大师展", "2026-05-18", [
      item(KB[14], "confirmed",
        { feeling: "没有轮廓,只有水的呼吸。看久了会觉得画面在轻轻晃动——不是风,是光本身在动。",
          rating: 5, tags: ["光影", "色彩", "风景"] },
        "2026-05-18 10:36"),
      item(KB[15], "suggested",
        { feeling: "比想象中更厚重的颜料堆叠,花瓣几乎是雕出来的。标签说是复制期,但站在面前的冲击是真的。",
          rating: 4, tags: ["笔触", "色彩"] },
        "2026-05-18 11:20"),
      item(KB[16], "modified",
        { feeling: "德加总在画'练习中的身体'——不完美的、疲惫的、重复的。这比舞台上的完美更接近真实。",
          rating: 3, question: "为什么印象派里只有他这么痴迷画舞者 backstage?", tags: ["人物", "日常"] },
        "2026-05-18 13:05"),
    ]),
  ];
}
