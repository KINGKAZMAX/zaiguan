# 再观 Rijksstudio

> **让观看发生第二次** —— 观展后个人文化记忆系统(v3 全量复刻版)

完整复刻 [Rijksmuseum Rijksstudio](https://www.rijksmuseum.nl/en/rijksstudio) 的产品形态与真实配色(逐色提取自其生产 CSS):**收藏作品 ♥ · 裁剪细节 ✂ · 用藏品再创作** —— 与「再观」的"个人数字策展"理念契合。

🔗 在线使用:[https://kingkazmax.github.io/zaiguan/](https://kingkazmax.github.io/zaiguan/)

## 四个页面

### 🏛 馆藏 Collection(rijksmuseum.nl/collection 式)
- 内置 24 件馆藏(故宫/三星堆/上博/辽博/奥赛/罗丹……),画布程序化生成藏品图
- **颜色筛选**(Rijksmuseum 招牌功能):石青/黛蓝/赭红/鎏金/玄墨/月白 六色系
- 搜索 + 类别筛选;♥ 一键收藏
- **上传观展照片**:批量导入 → EXIF 拍摄时间解析 → 照片主色自动归入色系 → 模拟馆藏识别建议(每张 3 候选+未识别)→ 成为"我的照片"个人藏品

### ♥ 我的 Rijksstudio
- **收藏的作品**:所有 ♥ 藏品
- **我的观展照片**:上传的个人藏品
- **收藏集 Sets**:自建主题收藏集(如"青绿与山河"),作品页一键加入/移出
- **我的细节**:全部裁剪细节墙

### ✂ 裁剪细节 Crop Details(Rijksstudio 标志性功能)
- 藏品页拖动框选任意局部 → 保存为细节卡 → 写一句注
- 细节画廊、大图查看、加注、删除

### 🎨 再创作 Make("用藏品进行个人再创作")
- 拼贴编辑器:素材取自**我的细节 + 收藏 + 我的照片**
- 素材拖动移动、缩放、调层级、删除;8 色画布底色
- 标题 + 一句话说明 → 保存为 680×906 创作图,可下载分享
- 示例数据自带一件创作《山河、手与水面》

### ⚙️ 设置
- 数据 100% 本地(localStorage),JSON 导入导出、恢复示例、一键清空

## 技术实现

| 项 | 说明 |
|---|---|
| 架构 | 纯前端 SPA,无后端、无依赖、无构建(全部删除旧代码后重写) |
| 配色 | **逐色提取自 rijksmuseum.nl 生产 CSS**:`#CC4C28` 陶土红(`--ubPrimaryButtonColor`)、`#C2CCCE` 蓝灰、`#202327` 石板黑、`#8C9095`、2px 圆角(映射表见 [DESIGN.md](DESIGN.md)) |
| 字体 | 系统衬线 Songti SC 栈承担大标题(对应 Rijksmuseum 衬线品牌字),零外部依赖 |
| 藏品图 | Canvas 程序化生成(色系渐变 + 确定性圆纹 + 书名首字),可直接裁剪/入画 |
| 裁剪 | 原生 Pointer Events 拖选 + Canvas 裁切;选区外暗化用 box-shadow 9999px 技巧 |
| 再创作 | Canvas 合成器:2x 输出(680×906),素材按 z 序绘制 |
| 照片 | Canvas 压缩(≤1000px)+ JPEG EXIF `DateTimeOriginal` 纯前端解析 + 主色 kNN 归类色系 |
| 数据 | `zaiguan.rs.v1`:likes/custom/meta(crops,note,rating)/sets/creations |

## 本地运行

```bash
cd zaiguan
python3 -m http.server 8080
```

## 项目结构

```
zaiguan/
├── index.html      # 入口(馆藏/收藏/创作/设置 四 tab)
├── style.css       # Rijksmuseum 真实配色体系
└── js/
    ├── lib.js      # 馆藏 24 件 / 色系 / 程序化藏品图 / EXIF / 主色归类
    └── app.js      # 四页 / 藏品页 / 裁剪 / 收藏集 / 再创作编辑器 / 数据管理
```

## 隐私

照片、细节、创作与笔记仅存于你的浏览器本地,不上传任何服务器,可随时导出或彻底删除。识别建议仅供参考;收藏、裁剪与再创作,全部由你决定。

## License

MIT
