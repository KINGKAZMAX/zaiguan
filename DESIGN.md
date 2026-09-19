# 再观 · 设计手册

> **v4 当前版本:Rijksmuseum / Rijksstudio 网站级全量复刻**(2026-09-19,旧前端 git rm 后重写)
> v3 及更早版本存档见文末。

## 〇、v4 · 网站级复刻(2026-09-19)

与 v3(手机壳 App)不同,v4 按 rijksmuseum.nl 的**网站形态**复刻:
全宽响应式(320px→桌面)、粘性页头(logo+搜索+导航)、深色 Hero、
大写粗体标题、页脚,四端体验一致。

### 复刻映射

| Rijksstudio 元素 | 再观 v4 实现 |
|---|---|
| 网站框架 | 粘性白底页头(Logo/搜索/导航)+ 深色页脚,hash 路由 7 页 |
| Collection 浏览 | 26 件内置藏品瀑布流(CSS columns)+ 搜索/类别/颜色筛选 + 上传照片区 |
| **颜色筛选**(招牌) | 10 传统色系圆点(月白/石青/天青/松绿/鎏金/赭石/朱砂/玄墨/黛蓝/绢黄) |
| Artwork 页 | 深色观看台:滚轮缩放/拖动平移/双击放大,缩放条 + 裁剪 + 下载;右侧元数据表 + 笔记 + 星级 + 同色系推荐 |
| **Crop details** | 虚线裁剪框(拖动 + 四角缩放 + 实时显示图片像素尺寸),确认后 Canvas 裁切存细节墙,弹层写一句注,「拿去创作」直通编辑器 |
| **Sets** | 自建收藏集(作品页加入弹层/新建/移出/重命名/删除)+ 3 个官方示例集(仿 Visitor Stories 卡) |
| **Make 再创作** | 拼贴编辑器:素材库四 tab(细节/收藏/馆藏/照片)、拖动/SE 缩放/顶点旋转/图层/复制、文字工具(内容/字号/五色)、10 色底、680×906 PNG 导出并存「我的创作」 |
| 我的 Rijksstudio | 深色档案头(头像/昵称/四统计)+ 五 tab(总览/收藏集/收藏/细节墙/创作) |

### 设计令牌(逐色提取自 rijksmuseum.nl 生产 CSS:`/statics/generated/rijksmuseum-app.css`)

| 真实值 | 官网用途 | 再观落地 |
|---|---|---|
| `--primary-color:#343B42` | 正文 | `--ink` 主文字 |
| `#CC4C28`(`--ubPrimaryButtonColor`) | CTA | `--accent` 主按钮/♥/星级/kicker |
| `#BF3220` | CTA hover | `--accent-deep` |
| `#C2CCCE`(全站第二高频) | 边框/分隔 | `--line` 所有边框分隔 |
| `#202327` / `#40474F` | 深色块/深灰 | `--dark`(hero/查看器/页脚)/`--mid` |
| `#8C9095` | 次级文字 | `--grey` |
| `#EAEAEA` | 浅分隔 | `--faint` |
| 圆角 `2px`(`--ubButtonBorderRadius`) | 按钮/输入 | 全站 `--r: 2px` |
| `RijksText, Arial, sans-serif` | 品牌字体 | 同栈兜底(PingFang SC 补中文) |
| h1 `text-transform:uppercase; line-height:.9` | 标题 | `.h-display`(中文加 letter-spacing) |
| `.link` 下划线 `background-size` 动画 | 链接 | `.link` 同款下划线滑出 |

### 真实藏品影像(v4.1,2026-09-19)

26 件藏品全部换用 **Wikimedia Commons 真实影像**(公有领域/CC 授权),经视觉模型逐张校验与藏品对应:
- 双尺寸:卡片 500px / 查看器 1280~3840px(标准缩略宽度 20/40/60/120/250/330/500/960/1280/1920/3840)
- 跨域链路:`crossorigin="anonymous"` + `access-control-allow-origin:*` → 裁剪与创作导出均不受污染
- 信息来源(PRD「展品知识·信息来源」字段):作品页元数据表列出 Commons 文件页链接
- 内容更正以匹配真迹:洛神赋图(辽宁省博物馆宋摹本)、汝窑天青釉洗(「奉华」铭)、舞蹈课(大都会艺术博物馆 1874)
- 离线兜底:任何远程图加载失败 → 程序化生成图自动顶替(见下节)

### 程序化藏品画(离线兜底,零外链图片)

同一 id 永远生成同一张图(mulberry32 种子随机),长边 1080(作品页)/480(卡片):
山水(青绿/水墨双风格+雾带+点景+皴)、瑞鹤(青天群鹤+檐脊云)、
书法(朱丝栏+枯笔飞白+双印)、青铜(铜绿锈斑+器形+雷纹带+兽面)、
金箔(十二齿芒+逆时针神鸟+金尘)、瓷器(冰裂开片+青花缠枝/汝窑弦纹)、
三彩(釉色垂流+驼载乐)、油画(厚涂色块+星空漩涡)。

---

## 历史版本存档

### v3 · Rijksstudio 手机壳复刻(2026-09-18,已被 v4 取代)
四 tab 手机壳:馆藏(24 件+六色系+上传)/收藏/创作/设置;映射表同上;数据 key `zaiguan.rs.v1`。

### v2 · Rijksstudio 式「收藏集 + 裁剪细节」(2026-09-18)
白底编辑排版,收藏集信息架构 + 裁剪细节。

### v1 · 中国风重制版(2026-09-18)
霞鹜文楷 + 宣纸/朱砂/鎏金/黛蓝传统色 + 古籍版式(竖排/鱼尾/朱丝栏)。
传统色 Token:宣纸 `#F5F0E3`、玄色 `#23201B`、朱砂 `#A63D2F`、鎏金 `#A9834B`、黛蓝 `#2F5D6E`、松绿 `#52755C` 等。
字体:LXGW WenKai(jsDelivr CDN,OFL 开源)。

## 更多可复用资源

- 中国色:<http://zhongguose.com> · 中华传统色开源项目:<https://github.com/nevertoday/chinese-traditional-colors>
- 霞鹜系列开源字体:<https://lxgw.github.io>
- 开源传统纹样图鉴 Wényàng:<https://github.com/nichenqin/chinese-traditional-patterns>
