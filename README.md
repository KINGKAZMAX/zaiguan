# 再观 Rijksstudio · 让观看发生第二次

观展后个人文化记忆系统,界面复刻自 **Rijksmuseum / Rijksstudio**(rijksmuseum.nl)——
业界公认最佳博物馆网站 UX。纯静态 SPA,零构建、零外链图片、零后端,
数据全部保存在浏览器 localStorage。

**线上地址**: <https://kingkazmax.github.io/zaiguan/>

## Rijksstudio 三大支柱 → 再观实现

| Rijksstudio | 再观 | 入口 |
|---|---|---|
| ♥ 收藏作品 | 藏品卡悬浮爱心一键收藏 / 取消 | `#/collection` |
| Collections 收藏集 | 自建收藏集(建/重命名/删/移出),内置 3 个官方示例集(仿 Visitor Stories) | `#/studio?tab=sets` |
| ✂ Crop details 裁剪细节 | 深度缩放查看器(滚轮/拖动/双击) + 可拖可缩裁剪框,裁下即存「细节墙」,可写一句注 | 任意作品页 → 裁剪细节 |
| ✎ 用藏品再创作 | 拼贴编辑器:细节/收藏/馆藏/照片四类素材,拖动·缩放·旋转·图层·文字,10 色底,680×906 PNG 导出 | `#/make` |
| 颜色筛选(官网招牌) | 10 传统色系圆点筛选;上传照片按主色自动归类(EXIF 时间一并读取) | `#/collection` |

## 页面

- `#/` 首页:深色 Hero + 三支柱 + 馆藏精选 + 大家的收藏集
- `#/collection` 馆藏:26 件藏品全部使用**真实影像**(Wikimedia Commons 公有领域/CC 授权,含 Google Art Project 高清),每件作品页标注「信息来源」;离线时自动回退程序化示意图 + 搜索 + 类别 + 色点筛选 + 上传观展照片
- `#/work/:id` 作品页:深度缩放查看器、裁剪、收藏、加入收藏集、元数据表、观展笔记与星级、同色系推荐
- `#/studio` 我的 Rijksstudio:总览统计 / 收藏集 / 收藏作品 / 细节墙 / 我的创作
- `#/make` 创作:拼贴编辑器,导出自动存入「我的创作」
- `#/settings` 设置:昵称、数据导出/导入/清空、关于

## 技术

- 原生 HTML/CSS/JS(hash 路由单页),无框架无构建,GitHub Pages 直接部署
- 藏品影像来自 Wikimedia Commons(跨域 CORS 可裁剪/可导出),加载失败自动回退到 Canvas 程序化生成图(按 id 确定性,同一件作品永远同一张图),站点离线也可用
- 设计令牌逐色提取自 rijksmuseum.nl 生产 CSS(`rijksmuseum-app.css`):
  主文字 `#343B42` · CTA `#CC4C28`/`#BF3220` · 边框 `#C2CCCE` ·
  深灰 `#202327`/`#40474F` · 次级 `#8C9095` · 圆角 `2px`
- 存储 key:`zaiguan.v4`(likes / sets / crops / creations / notes / photos / profile)

## 开发

```bash
cd zaiguan && python3 -m http.server 8765   # 打开 http://127.0.0.1:8765/
```

推送到 main 即自动重新部署 Pages。

## 版权说明

内置藏品影像均为程序化生成的示意画面(非博物馆原件影像),名称仅作内容索引。
界面复刻仅用于学习研究,配色与版式规范提取自公开可访问的生产样式表。
