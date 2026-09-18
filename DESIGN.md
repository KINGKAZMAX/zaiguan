# 再观 · 设计手册与素材资源

> **v2 当前版本:Rijksstudio 复刻**(白底编辑排版) · v1 存档:中国风重制版(见文末)

## 〇、v2 · Rijksstudio 复刻要点

参考:**Rijksmuseum Rijksstudio**(rijksmuseum.nl/rijksstudio,博物馆界公认最佳 UX)

### 配色(逐色提取自 rijksmuseum.nl 生产 CSS:`/statics/generated/rijksmuseum-app.css`)

| Rijks 真实色值 | 用途(rijksmuseum.nl) | 再观落地 |
|---|---|---|
| `#CC4C28` 陶土红(104 处白色外的第 5 高频,`--ubPrimaryButtonColor`) | 主按钮/CTA/强调 | `.btn-primary`、爱心 ♥、星级、tab 激活下划线、未识别状态 |
| `#BF3220` | 陶土红 hover | `:active` 深化 |
| `#C2CCCE` 蓝灰(62 处,仅次于白的第 2 高频色) | 边框/分隔/链接 | 所有卡片边框、分隔线、搜索框 |
| `#202327` 石板黑(10 处) | 主按钮/深色元素 | 标题、粗规则线、角标、toast |
| `#40474F` 正文灰(29 处) | 正文 | `--ink-2` |
| `#343B42`(13 处) | 次级深灰 | 层级备用 |
| `#8C9095`(`--ubLightGray`) | 次级文字 | `--ink-3` |
| `#AC8367` 赭棕 / `#AAA04D` 橄榄 / `#436178` 石青 / `#5E99B0` 浅石青 | 辅助色 | 状态徽章:已修改(赭棕)/已确认(石青)/系统建议(浅石青) |
| 圆角 `2px`(10 处,`--ubButtonBorderRadius:2px`) | 按钮/输入框 | 全站 2px 方正圆角 |

字体:Rijksmuseum 用自研 RijksText(拉丁);再观以系统衬线 Songti SC 栈承担大标题(对应其衬线品牌字),正文系统无衬线。

### Rijksstudio 功能复刻

| Rijksstudio 元素 | 再观落地 |
|---|---|
| Collections(用户自建收藏集) | 每次观展 = 一册收藏集;2 列封面网格 + 数量角标 |
| Artwork 瀑布流浏览 | 「作品」页 columns 瀑布流 + 状态/细节标注 |
| ♥ 心形收藏 | 陶土红爱心:卡片悬浮、最爱筛选、作品页按钮 |
| **Crop details(裁剪细节)** | Pointer Events 拖选 + Canvas 裁切;细节画廊 + 一句注 |
| 白底编辑排版 | 纯白底、大衬线标题、黑色粗顶线统计条 |

**裁剪细节实现**:拖选框用 `box-shadow: 0 0 0 9999px rgba(32,35,39,.38)` 实现选区外暗化;保存时按显示尺寸/原图尺寸比例换算后 Canvas `drawImage` 裁切,输出 ≤900px JPEG。

## 一、设计参考(v1 中国风版调研存档)

| 参考对象 | 借鉴点 |
|---|---|
| 数字敦煌(敦煌研究院) | 敦煌色系氛围(石青/黛蓝/赭金)、深色底 + 暖金点缀、大留白 |
| 故宫博物院官网 / 故宫名画记 | 高清书画质感、朱砂印章、古籍版式(界格、鱼尾) |
| 中国色 zhongguose.com | 传统色命名体系与色值规范(《中国传统色》384 色) |
| 清华美院陈楠「中国风设计观」 | 传统元素当代转化:不堆砌符号,取其骨(留白/线条/字韵) |

## 二、传统色 Token(本项目实际使用)

| 色名 | HEX | 用途 |
|---|---|---|
| 宣纸 | `#F5F0E3` | 页面底色 |
| 皮纸 | `#ECE4D0` | 次级底色/输入底 |
| 书页白 | `#FBF8EF` | 卡片 |
| 玄色 | `#23201B` | 主文字 |
| 苍色 | `#6F695C` | 次级文字 |
| 朱砂 / 殷红 | `#A63D2F` / `#8C2F22` | 主强调、印章、进度 |
| 鎏金 | `#A9834B` | 分隔线、星级、鱼尾饰 |
| 黛蓝 / 石青 | `#2F5D6E` / `#3A6273` | 图表、远山、hero 底 |
| 松绿 | `#52755C` | 成功态、开关 |

## 三、字体

- **霞鹜文楷 LXGW WenKai**(基于 Fontworks 开源字体 Klee One 派生,**OFL 开源协议**,可免费商用)
  - 官网:<https://lxgw.github.io> · 仓库:<https://github.com/lxgw/LxgwWenKai>
  - 本项目通过 jsDelivr 分包 CDN 按需加载(unicode-range 切片,仅加载用到的字形包):
    ```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-bold.css">
    ```
  - 回退栈:`"LXGW WenKai", "Kaiti SC", "STKaiti", "Songti SC", serif`(离线时退化为系统楷体/宋体)

## 四、纹样与版式元素(本项目自绘 SVG,无版权风险)

| 元素 | 实现方式 |
|---|---|
| 宣纸肌理 | SVG `feTurbulence` 噪点 data-URI,5% 透明度叠加 |
| 远山(千里江山意象) | 三层 SVG path,石青→黛蓝渐变透明度,置于 hero 底部 |
| 竖排题字(立轴式) | `writing-mode: vertical-rl` + 霞鹜文楷 + 右侧界线 |
| 印章 | CSS 渐变朱砂底 + 双层内描边(印边栏)+ 微旋转 |
| 鱼尾(古籍版心) | 章节标题末端的三角刻痕 SVG(宋版书鱼尾记号) |
| 朱丝栏 | 档案时间线的朱红竖线 + 菱形节点 |
| 界格线 | 卡片虚线/细线分隔,取古籍行格意象 |
| 洒金纸 | 兴趣洞察卡片:`radial-gradient` 金点 + 米色渐变 |
| 文武线 | 弹层顶部朱砂粗线 + 卡片粗细双线描边 |

## 五、更多可复用资源(调研收录)

**传统色**
- 中国色(560+ 传统色 + 色值): <http://zhongguose.com>
- 中华传统色开源项目(742 张色卡,可打包下载): <https://github.com/nevertoday/zhongguo-traditional-colors>
- 中国色卡(按敦煌/宋式/UI 场景分组,可复制 CSS/JSON): <https://chinesecoloratlas.com>

**开源字体**
- 霞鹜系列全部字体: <https://lxgw.github.io>(文楷/屏幕阅读版/方正等宽衍生)
- Google Fonts 亦有收录 LXGW WenKai TC

**传统纹样**
- 开源中国传统纹样图鉴 Wényàng(瓷器/织锦/建筑/漆器): <https://github.com/nichenqin/chinese-traditional-patterns>
- 祥云/回纹矢量素材(商用注意授权): 千图网、Pngtree

## 六、设计原则(为什么这样做)

1. **取骨不取皮**:不堆砌中国符号,而用版式(竖排/界格/留白)与色彩(宣纸/朱砂/黛蓝)传达气质——参考陈楠"让传统的成为时尚"。
2. **古籍即界面**:记录册 = 函套,展品卡 = 版页,时间线 = 朱丝栏,兴趣洞察 = 洒金批注,把"观展记录"隐喻为一部持续生长的个人古籍。
3. **零外部图片依赖**:所有纹样均为 CSS/SVG 自绘或程序化生成,站点永远可加载、无版权风险。
