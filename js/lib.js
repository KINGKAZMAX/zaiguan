/* ============================================================
   再观 Rijksstudio v4 — 基础库
   馆藏数据 / 程序化藏品图(七种画风) / localStorage / EXIF / 主色归类
   零外部依赖、零外链图片:一切画面均在本地 Canvas 生成
   ============================================================ */

/* ---------- 色系(Rijksstudio 招牌颜色筛选;色值取自 rijksmuseum.nl 生产 CSS 色板) ---------- */
const HUES = {
  yuebai:   { name: "月白", dot: "#C2CCCE" },
  shanqing: { name: "石青", dot: "#436178" },
  tianqing: { name: "天青", dot: "#5E99B0" },
  songlv:   { name: "松绿", dot: "#52755C" },
  liujin:   { name: "鎏金", dot: "#AAA04D" },
  zheshi:   { name: "赭石", dot: "#AC8367" },
  zhusha:   { name: "朱砂", dot: "#CC4C28" },
  xuanmo:   { name: "玄墨", dot: "#202327" },
  dailan:   { name: "黛蓝", dot: "#343B42" },
  juanhuang:{ name: "绢黄", dot: "#D8C9A3" },
};
const HUE_IDS = Object.keys(HUES);

/* ---------- 内置馆藏(再观 Collection) ---------- */
/* style: paint 山水 / crane 瑞鹤 / calligraphy 书法 / bronze 青铜 / gold 金箔 / porcelain 瓷 / terracotta 陶 / oil 油画 */
const KB = [
  { name: "千里江山图", artist: "王希孟", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "shanqing", style: "paint", ar: 3.3462, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/A_Thousand_Li_of_Rivers_and_Mountains_Section_1.jpg/3840px-A_Thousand_Li_of_Rivers_and_Mountains_Section_1.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/A_Thousand_Li_of_Rivers_and_Mountains_Section_1.jpg/500px-A_Thousand_Li_of_Rivers_and_Mountains_Section_1.jpg", src: "File:A Thousand Li of Rivers and Mountains Section 1.jpg", desc: "青绿山水长卷,群峰竞秀,江河浩渺,十八岁天才的传世孤本。" },
  { name: "清明上河图", artist: "张择端", era: "北宋", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "dailan", style: "paint", ar: 2.0, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Along_the_River_During_the_Qingming_Festival_%28detail_of_original%29.jpg/1280px-Along_the_River_During_the_Qingming_Festival_%28detail_of_original%29.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Along_the_River_During_the_Qingming_Festival_%28detail_of_original%29.jpg/500px-Along_the_River_During_the_Qingming_Festival_%28detail_of_original%29.jpg", src: "File:Along the River During the Qingming Festival (detail of original).jpg", desc: "汴京市井长卷,八百余人栩栩如生,一座城市的正午记忆。" },
  { name: "步辇图", artist: "阎立本", era: "唐代", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "shanqing", style: "paint", ar: 1.8017, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Emperor_Taizong_gives_an_audience_to_the_ambassador_of_Tibet.jpg/1280px-Emperor_Taizong_gives_an_audience_to_the_ambassador_of_Tibet.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Emperor_Taizong_gives_an_audience_to_the_ambassador_of_Tibet.jpg/500px-Emperor_Taizong_gives_an_audience_to_the_ambassador_of_Tibet.jpg", src: "File:Emperor Taizong gives an audience to the ambassador of Tibet.jpg", desc: "唐太宗接见吐蕃使臣,汉藏友好的历史现场。" },
  { name: "溪山行旅图", artist: "范宽", era: "北宋", medium: "绢本水墨", category: "绘画", collection: "台北故宫博物院", hue: "xuanmo", style: "paint", ar: 0.4987, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg/1280px-Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg/500px-Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg", src: "File:Fan Kuan - Travelers Among Mountains and Streams - Google Art Project.jpg", desc: "巨峰壁立,飞瀑千尺,山脚旅人渺小如豆,北宋山水的纪念碑。" },
  { name: "富春山居图", artist: "黄公望", era: "元代", medium: "纸本水墨", category: "绘画", collection: "浙江省博物馆", hue: "xuanmo", style: "paint", ar: 8.0667, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/%E5%AF%8C%E6%98%A5%E5%B1%B1%E5%B1%85%E5%9C%96%28%E5%89%A9%E5%B1%B1%E5%9C%96%29.jpg/3840px-%E5%AF%8C%E6%98%A5%E5%B1%B1%E5%B1%85%E5%9C%96%28%E5%89%A9%E5%B1%B1%E5%9C%96%29.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/%E5%AF%8C%E6%98%A5%E5%B1%B1%E5%B1%85%E5%9C%96%28%E5%89%A9%E5%B1%B1%E5%9C%96%29.jpg/500px-%E5%AF%8C%E6%98%A5%E5%B1%B1%E5%B1%85%E5%9C%96%28%E5%89%A9%E5%B1%B1%E5%9C%96%29.jpg", src: "File:富春山居圖(剩山圖).jpg", desc: "七年画就一段富春江,笔意萧散,是文人画的至高山水。" },
  { name: "洛神赋图", artist: "顾恺之(宋摹)", era: "东晋", medium: "绢本设色", category: "绘画", collection: "辽宁省博物馆", hue: "dailan", style: "paint", ar: 4.1918, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/B_Gu_Kaizhi._Nymph_of_the_Luo_River._%28section%29_Southern_Song_Copy._Liaoning_Provincial_museum.jpg/1280px-B_Gu_Kaizhi._Nymph_of_the_Luo_River._%28section%29_Southern_Song_Copy._Liaoning_Provincial_museum.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/B_Gu_Kaizhi._Nymph_of_the_Luo_River._%28section%29_Southern_Song_Copy._Liaoning_Provincial_museum.jpg/500px-B_Gu_Kaizhi._Nymph_of_the_Luo_River._%28section%29_Southern_Song_Copy._Liaoning_Provincial_museum.jpg", src: "File:B Gu Kaizhi. Nymph of the Luo River. (section) Southern Song Copy. Liaoning Provincial museum.jpg", desc: "人神殊途的怅惘爱情,以春蚕吐丝般的线条随画卷徐徐展开。此为辽宁省博物馆藏宋摹本。" },
  { name: "韩熙载夜宴图", artist: "顾闳中", era: "五代", medium: "绢本设色", category: "绘画", collection: "故宫博物院", hue: "dailan", style: "paint", ar: 5.175, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Gu_Hongzhong%27s_Night_Revels_1_edit_%28cropped%29.jpg/3840px-Gu_Hongzhong%27s_Night_Revels_1_edit_%28cropped%29.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Gu_Hongzhong%27s_Night_Revels_1_edit_%28cropped%29.jpg/500px-Gu_Hongzhong%27s_Night_Revels_1_edit_%28cropped%29.jpg", src: "File:Gu Hongzhong's Night Revels 1 edit (cropped).jpg", desc: "听乐、观舞、歇息、清吹、散宴五段连环,一场被「观看」的夜宴。" },
  { name: "瑞鹤图", artist: "赵佶", era: "北宋", medium: "绢本设色", category: "绘画", collection: "辽宁省博物馆", hue: "tianqing", style: "crane", ar: 1.4353, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Auspicious_Cranes.jpg/1280px-Auspicious_Cranes.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Auspicious_Cranes.jpg/500px-Auspicious_Cranes.jpg", src: "File:Auspicious Cranes.jpg", desc: "汴梁宣德门群鹤盘旋,青天如洗,宋徽宗的祥瑞时刻。" },
  { name: "快雪时晴帖", artist: "王羲之", era: "东晋", medium: "纸本行书", category: "书法", collection: "台北故宫博物院", hue: "xuanmo", style: "calligraphy", ar: 1.3358, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/%E6%99%89%E7%8E%8B%E7%BE%B2%E4%B9%8B%E5%BF%AB%E9%9B%AA%E6%99%82%E6%99%B4%E5%B8%96_%E5%86%8A.jpg/1280px-%E6%99%89%E7%8E%8B%E7%BE%B2%E4%B9%8B%E5%BF%AB%E9%9B%AA%E6%99%82%E6%99%B4%E5%B8%96_%E5%86%8A.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/%E6%99%89%E7%8E%8B%E7%BE%B2%E4%B9%8B%E5%BF%AB%E9%9B%AA%E6%99%82%E6%99%B4%E5%B8%96_%E5%86%8A.jpg/500px-%E6%99%89%E7%8E%8B%E7%BE%B2%E4%B9%8B%E5%BF%AB%E9%9B%AA%E6%99%82%E6%99%B4%E5%B8%96_%E5%86%8A.jpg", src: "File:晉王羲之快雪時晴帖 冊.jpg", desc: "二十八字短札:「羲之顿首。快雪时晴,佳想安善。」" },
  { name: "祭侄文稿", artist: "颜真卿", era: "唐代", medium: "纸本行书", category: "书法", collection: "台北故宫博物院", hue: "yuebai", style: "calligraphy", ar: 1.336, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/%E5%94%90%E9%A1%8F%E7%9C%9F%E5%8D%BF%E7%A5%AD%E5%A7%AA%E6%96%87%E7%A8%BF_%E5%8D%B7.png/1280px-%E5%94%90%E9%A1%8F%E7%9C%9F%E5%8D%BF%E7%A5%AD%E5%A7%AA%E6%96%87%E7%A8%BF_%E5%8D%B7.png", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/%E5%94%90%E9%A1%8F%E7%9C%9F%E5%8D%BF%E7%A5%AD%E5%A7%AA%E6%96%87%E7%A8%BF_%E5%8D%B7.png/500px-%E5%94%90%E9%A1%8F%E7%9C%9F%E5%8D%BF%E7%A5%AD%E5%A7%AA%E6%96%87%E7%A8%BF_%E5%8D%B7.png", src: "File:唐顏真卿祭姪文稿 卷.png", desc: "涂改满纸的悲愤草稿,被称为「天下第二行书」。" },
  { name: "兰亭序(神龙本)", artist: "冯承素(摹)", era: "唐代", medium: "纸本行书", category: "书法", collection: "故宫博物院", hue: "xuanmo", style: "calligraphy", ar: 3.0493, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Lanting_Xu_by_Feng_Chengsu.jpg/3840px-Lanting_Xu_by_Feng_Chengsu.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Lanting_Xu_by_Feng_Chengsu.jpg/500px-Lanting_Xu_by_Feng_Chengsu.jpg", src: "File:Lanting Xu by Feng Chengsu.jpg", desc: "永和九年暮春之初,曲水流觞,二十一个「之」字各不相同。" },
  { name: "莲鹤方壶", artist: "失载工匠", era: "春秋", medium: "青铜", category: "青铜器", collection: "河南博物院", hue: "songlv", style: "bronze", ar: 0.6667, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Spring_%26_Autumn_Bronze_Hu_-_a.jpg/1280px-Spring_%26_Autumn_Bronze_Hu_-_a.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Spring_%26_Autumn_Bronze_Hu_-_a.jpg/500px-Spring_%26_Autumn_Bronze_Hu_-_a.jpg", src: "File:Spring & Autumn Bronze Hu - a.jpg", desc: "壶顶立鹤展翅,双龙耳侧探,青铜时代的浪漫绝唱。" },
  { name: "大禾人面纹方鼎", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "湖南博物院", hue: "zhusha", style: "bronze", ar: 0.8084, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Bronze_square_ding_%28cauldron%29_with_human_faces.jpg/1280px-Bronze_square_ding_%28cauldron%29_with_human_faces.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Bronze_square_ding_%28cauldron%29_with_human_faces.jpg/500px-Bronze_square_ding_%28cauldron%29_with_human_faces.jpg", src: "File:Bronze square ding (cauldron) with human faces.jpg", desc: "四面各一人面,写实与狞厉并存,唯一以人面为饰的商代鼎。" },
  { name: "妇好鸮尊", artist: "佚名工匠", era: "商代", medium: "青铜", category: "青铜器", collection: "中国国家博物馆", hue: "songlv", style: "bronze", ar: 0.6669, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Fuhao_Owl_Zun_front.jpg/3840px-Fuhao_Owl_Zun_front.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Fuhao_Owl_Zun_front.jpg/500px-Fuhao_Owl_Zun_front.jpg", src: "File:Fuhao Owl Zun front.jpg", desc: "战神妇好的猫头鹰,敛翅直立,喙与胸线刚劲如刻。" },
  { name: "青铜大立人像", artist: "佚名工匠", era: "商代晚期", medium: "青铜", category: "青铜器", collection: "三星堆博物馆", hue: "zheshi", style: "bronze", ar: 0.6676, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/%E4%B8%89%E6%98%9F%E5%A0%86%E5%87%BA%E5%9C%9F%E9%9D%92%E9%93%9C%E5%A4%A7%E7%AB%8B%E4%BA%BA%E5%83%8F%2C_2017-09-17.jpg/3840px-%E4%B8%89%E6%98%9F%E5%A0%86%E5%87%BA%E5%9C%9F%E9%9D%92%E9%93%9C%E5%A4%A7%E7%AB%8B%E4%BA%BA%E5%83%8F%2C_2017-09-17.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/%E4%B8%89%E6%98%9F%E5%A0%86%E5%87%BA%E5%9C%9F%E9%9D%92%E9%93%9C%E5%A4%A7%E7%AB%8B%E4%BA%BA%E5%83%8F%2C_2017-09-17.jpg/500px-%E4%B8%89%E6%98%9F%E5%A0%86%E5%87%BA%E5%9C%9F%E9%9D%92%E9%93%9C%E5%A4%A7%E7%AB%8B%E4%BA%BA%E5%83%8F%2C_2017-09-17.jpg", src: "File:三星堆出土青铜大立人像, 2017-09-17.jpg", desc: "高逾两米,双手环握,古蜀国祭司沉默地站立了三千年。" },
  { name: "铜车马(一号车)", artist: "佚名工匠", era: "秦代", medium: "青铜", category: "青铜器", collection: "秦始皇帝陵博物院", hue: "zhusha", style: "bronze", ar: 1.5, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Qin_bronze_chariot_two.jpg/3840px-Qin_bronze_chariot_two.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Qin_bronze_chariot_two.jpg/500px-Qin_bronze_chariot_two.jpg", src: "File:Qin bronze chariot two.jpg", desc: "三千零六十四个零件,「青铜之冠」的立车伞盖下站着御官。" },
  { name: "太阳神鸟金饰", artist: "佚名工匠", era: "商周之际", medium: "金箔", category: "金银器", collection: "成都金沙遗址博物馆", hue: "liujin", style: "gold", ar: 1.1338, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/%E5%A4%AA%E9%98%B3%E7%A5%9E%E9%B8%9F%E9%87%91%E9%A5%B0_Golden_Sun_Bird.png/1280px-%E5%A4%AA%E9%98%B3%E7%A5%9E%E9%B8%9F%E9%87%91%E9%A5%B0_Golden_Sun_Bird.png", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/%E5%A4%AA%E9%98%B3%E7%A5%9E%E9%B8%9F%E9%87%91%E9%A5%B0_Golden_Sun_Bird.png/500px-%E5%A4%AA%E9%98%B3%E7%A5%9E%E9%B8%9F%E9%87%91%E9%A5%B0_Golden_Sun_Bird.png", src: "File:太阳神鸟金饰 Golden Sun Bird.png", desc: "厚 0.02 厘米的金箔上,四只神鸟绕日逆时针飞翔,十二道齿芒旋转。" },
  { name: "金面具", artist: "佚名工匠", era: "商代晚期", medium: "金箔", category: "金银器", collection: "三星堆博物馆", hue: "liujin", style: "gold", ar: 1.3335, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Sanxingdui_Gold_Mask.jpg/1280px-Sanxingdui_Gold_Mask.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Sanxingdui_Gold_Mask.jpg/500px-Sanxingdui_Gold_Mask.jpg", src: "File:Sanxingdui Gold Mask.jpg", desc: "微笑的黄金面孔,宽耳巨目,古蜀人心中不朽的容颜。" },
  { name: "汝窑天青釉洗(「奉华」铭)", artist: "汝窑", era: "北宋", medium: "瓷器", category: "瓷器", collection: "台北故宫博物院", hue: "tianqing", style: "porcelain", ar: 1.3322, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/%E6%B1%9D%E7%AA%AF_%E9%9D%92%E7%93%B7%E6%B4%97_%E3%80%8C%E5%A5%89%E8%8F%AF%E3%80%8D%E9%8A%98.png/1280px-%E6%B1%9D%E7%AA%AF_%E9%9D%92%E7%93%B7%E6%B4%97_%E3%80%8C%E5%A5%89%E8%8F%AF%E3%80%8D%E9%8A%98.png", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/%E6%B1%9D%E7%AA%AF_%E9%9D%92%E7%93%B7%E6%B4%97_%E3%80%8C%E5%A5%89%E8%8F%AF%E3%80%8D%E9%8A%98.png/500px-%E6%B1%9D%E7%AA%AF_%E9%9D%92%E7%93%B7%E6%B4%97_%E3%80%8C%E5%A5%89%E8%8F%AF%E3%80%8D%E9%8A%98.png", src: "File:汝窯 青瓷洗 「奉華」銘.png", desc: "雨过天青云破处。底刻「奉华」二字,相传为宋高宗刘贵妃之物,汝窑传世不足百件。" },
  { name: "青花缠枝莲纹瓶", artist: "景德镇窑", era: "明代", medium: "瓷器", category: "瓷器", collection: "故宫博物院", hue: "shanqing", style: "porcelain", ar: 0.6663, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/20241025_Blue_and_White_Porcelain_Vase_with_Interlocking_Lotus_Design_of_Wanli_Reign%2C_Ming_Dynasty.jpg/1280px-20241025_Blue_and_White_Porcelain_Vase_with_Interlocking_Lotus_Design_of_Wanli_Reign%2C_Ming_Dynasty.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/20241025_Blue_and_White_Porcelain_Vase_with_Interlocking_Lotus_Design_of_Wanli_Reign%2C_Ming_Dynasty.jpg/500px-20241025_Blue_and_White_Porcelain_Vase_with_Interlocking_Lotus_Design_of_Wanli_Reign%2C_Ming_Dynasty.jpg", src: "File:20241025 Blue and White Porcelain Vase with Interlocking Lotus Design of Wanli Reign, Ming Dynasty.jpg", desc: "苏麻离青发色浓翠,缠枝莲一路缠绕而上,永不凋谢。" },
  { name: "唐三彩骆驼载乐俑", artist: "佚名工匠", era: "唐代", medium: "陶器", category: "瓷器", collection: "中国国家博物馆", hue: "zheshi", style: "terracotta", ar: 1.5, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Tang_Sancai_Camel_%26_Musicians_%289948318303%29.jpg/3840px-Tang_Sancai_Camel_%26_Musicians_%289948318303%29.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Tang_Sancai_Camel_%26_Musicians_%289948318303%29.jpg/500px-Tang_Sancai_Camel_%26_Musicians_%289948318303%29.jpg", src: "File:Tang Sancai Camel & Musicians (9948318303).jpg", desc: "驼背上一支胡汉混编乐队,黄绿褐三彩流淌,丝路的声音。" },
  { name: "睡莲", artist: "克劳德·莫奈", era: "1906 年", medium: "布面油画", category: "绘画", collection: "芝加哥艺术博物馆", hue: "tianqing", style: "oil", ar: 1.0409, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/500px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg", src: "File:Claude Monet - Water Lilies - 1906, Ryerson.jpg", desc: "水面、倒影与光,一座池塘画了二十余年,时间本身成为主题。" },
  { name: "向日葵", artist: "文森特·梵高", era: "1888 年", medium: "布面油画", category: "绘画", collection: "伦敦国家美术馆", hue: "liujin", style: "oil", ar: 0.7865, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg/3840px-Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg/500px-Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg", src: "File:Vincent van Gogh - Sunflowers (1888, National Gallery London).jpg", desc: "铬黄厚涂的花盘朝着不同方向,在阿尔勒的阳光里燃烧。" },
  { name: "舞蹈课", artist: "埃德加·德加", era: "1874 年", medium: "布面油画", category: "绘画", collection: "纽约大都会艺术博物馆", hue: "yuebai", style: "oil", ar: 0.925, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Dance_Class_MET_DT46.jpg/1280px-The_Dance_Class_MET_DT46.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Dance_Class_MET_DT46.jpg/500px-The_Dance_Class_MET_DT46.jpg", src: "File:The Dance Class MET DT46.jpg", desc: "排练厅斜角的一瞥,芭蕾舞者整理耳环与缎带,不经意的瞬间。" },
  { name: "星月夜", artist: "文森特·梵高", era: "1889 年", medium: "布面油画", category: "绘画", collection: "纽约现代艺术博物馆", hue: "dailan", style: "oil", ar: 1.2944, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/3840px-Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", src: "File:Vincent van Gogh - Starry Night - Google Art Project.jpg", desc: "圣雷米疗养院窗外的夜空,柏树如黑色火焰,星云旋转。" },
  { name: "思想者", artist: "奥古斯特·罗丹", era: "1880 年", medium: "青铜雕塑", category: "雕塑", collection: "罗丹博物馆", hue: "zhusha", style: "bronze", ar: 0.82, img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Thinker_MET_DP-13618-011.jpg/1280px-The_Thinker_MET_DP-13618-011.jpg", imgS: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/The_Thinker_MET_DP-13618-011.jpg/500px-The_Thinker_MET_DP-13618-011.jpg", src: "File:The Thinker MET DP-13618-011.jpg", desc: "俯身的沉思者,每块肌肉都在用力思考,为《地狱之门》而生。" },
];
KB.forEach((k, i) => { k.id = "kb:" + i; });
const CATEGORIES = [...new Set(KB.map(k => k.category))];

/* ---------- 内置示例收藏集(仿官网 Visitor Stories,让空态也有内容) ---------- */
const DEMO_SETS = [
  { id: "demo:1", name: "夏季山水", author: "再观编辑部", date: "2026-08-12", items: ["kb:0", "kb:4", "kb:2", "kb:8"], desc: "看山看水,过一个清凉的夏天。" },
  { id: "demo:2", name: "青铜之魂", author: "再观编辑部", date: "2026-07-30", items: ["kb:11", "kb:12", "kb:13", "kb:14", "kb:15", "kb:25"], desc: "狞厉与浪漫并存的礼器时代。" },
  { id: "demo:3", name: "金色黄昏", author: "再观编辑部", date: "2026-06-18", items: ["kb:16", "kb:17", "kb:22", "kb:5"], desc: "一切与金子有关的光。" },
];

/* ---------- 确定性伪随机(同一件作品永远生成同一张图) ---------- */
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

/* ---------- 颜色小工具 ---------- */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

/* ============================================================
   程序化藏品图生成器
   每件作品按其 style 走对应画法,长边默认 1080,可裁剪、可进创作
   ============================================================ */
const artCache = new Map();

function makeWorkCanvas(work, maxSide = 1080) {
  const key = work.id + "@" + maxSide;
  if (artCache.has(key)) return artCache.get(key);
  const ar = work.ar || 1;
  const w = ar >= 1 ? maxSide : Math.round(maxSide * ar);
  const h = ar >= 1 ? Math.round(maxSide / ar) : maxSide;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  const rnd = mulberry32(hashStr(work.id + work.name));
  const S = Math.min(w, h); // 特征尺寸基准
  const painters = {
    paint: drawPaint, crane: drawCrane, calligraphy: drawCalligraphy,
    bronze: drawBronze, gold: drawGold, porcelain: drawPorcelain,
    terracotta: drawTerracotta, oil: drawOil, photo: drawPhotoFrame,
  };
  (painters[work.style] || drawPaint)(ctx, w, h, S, rnd, work);
  artCache.set(key, cv);
  return cv;
}

/* 通用:画布做旧(边缘晕染 + 绢纹) */
function ageSilk(ctx, w, h, rnd, tint = "#E9DFC8", edge = 0.16) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, rgba("#FFFFFF", 0.10));
  g.addColorStop(0.5, rgba("#8C9095", 0.05));
  g.addColorStop(1, rgba("#7A6A4F", 0.12));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = rgba(tint, 0.35); ctx.lineWidth = 1;
  for (let i = 0; i < w / 14; i++) {
    const y = rnd() * h;
    ctx.globalAlpha = 0.05 + rnd() * 0.08;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (rnd() - 0.5) * 8); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const eg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * (0.5 - edge), w / 2, h / 2, Math.max(w, h) * 0.72);
  eg.addColorStop(0, "rgba(120,100,70,0)");
  eg.addColorStop(1, "rgba(96,78,50,0.22)");
  ctx.fillStyle = eg; ctx.fillRect(0, 0, w, h);
}

/* 山峰:一条山脊的填充路径 */
function ridge(ctx, w, h, baseY, amp, color, alpha, rnd, peaks = 5) {
  ctx.beginPath();
  ctx.moveTo(-w * 0.05, h);
  ctx.lineTo(-w * 0.05, baseY);
  let x = -w * 0.05;
  const step = (w * 1.1) / peaks;
  for (let i = 0; i <= peaks; i++) {
    const px = x + step * rnd() * 0.6;
    const py = baseY - amp * (0.4 + rnd());
    ctx.quadraticCurveTo(px, py, x + step, baseY - amp * 0.25 * rnd());
    x += step;
  }
  ctx.lineTo(w * 1.05, baseY);
  ctx.lineTo(w * 1.05, h);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha); ctx.fill();
}

/* 小树:枝干 + 点叶 */
function tree(ctx, x, y, s, ink, rnd) {
  ctx.strokeStyle = rgba(ink, 0.85); ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * s * 0.1, y - s); ctx.stroke();
  ctx.fillStyle = rgba(ink, 0.35 + rnd() * 0.3);
  for (let i = 0; i < 10; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * s * 0.45;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r + (rnd() - 0.5) * s * 0.2, y - s * (0.55 + rnd() * 0.55), s * 0.13, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* 1) 山水长卷 */
function drawPaint(ctx, w, h, S, rnd, work) {
  const isBlueGreen = work.hue === "shanqing" || work.hue === "tianqing";
  const silk = isBlueGreen ? "#E7E9D8" : "#EAE2CE";
  ctx.fillStyle = silk; ctx.fillRect(0, 0, w, h);
  const far = isBlueGreen ? "#7FA8A4" : mix(HUES[work.hue]?.dot || "#8C9095", "#C2CCCE", 0.55);
  const mid = isBlueGreen ? "#5E8C8A" : mix(HUES[work.hue]?.dot || "#40474F", "#8C9095", 0.35);
  const near = isBlueGreen ? "#3F6E6C" : mix(HUES[work.hue]?.dot || "#202327", "#40474F", 0.4);
  // 水面留白
  const waterY = h * (0.62 + rnd() * 0.1);
  ridge(ctx, w, waterY, h * 0.30, h * 0.16, far, 0.55, rnd, Math.max(4, Math.round(w / S * 4)));
  ctx.fillStyle = rgba("#FFFFFF", 0.28); ctx.fillRect(0, waterY - h * 0.02, w, h * 0.1); // 雾带
  ridge(ctx, w, waterY + h * 0.06, h * 0.48, h * 0.18, mid, 0.75, rnd, Math.max(3, Math.round(w / S * 3)));
  ctx.fillStyle = rgba("#FFFFFF", 0.22); ctx.fillRect(0, waterY + h * 0.06, w, h * 0.05);
  // 近山 + 皴法
  const nearBase = h * 0.86;
  ridge(ctx, w, nearBase, h * 0.62, h * 0.22, near, 0.92, rnd, Math.max(2, Math.round(w / S * 2.4)));
  ctx.strokeStyle = rgba("#202327", isBlueGreen ? 0.25 : 0.4); ctx.lineWidth = Math.max(1, S * 0.004);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w, y = waterY * 0.4 + rnd() * (nearBase - waterY * 0.4);
    ctx.globalAlpha = 0.10 + rnd() * 0.15;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * S * 0.06, y + S * 0.1 * (0.4 + rnd())); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 水纹
  ctx.strokeStyle = rgba(isBlueGreen ? "#436178" : "#40474F", 0.3);
  for (let i = 0; i < 16; i++) {
    const y = waterY + h * 0.08 + rnd() * h * 0.2;
    ctx.beginPath();
    ctx.moveTo(w * rnd() * 0.85, y);
    ctx.quadraticCurveTo(w * (0.2 + rnd() * 0.6), y + (rnd() - 0.5) * 8, w * rnd() * 0.95, y);
    ctx.stroke();
  }
  // 点景:树、屋、舟
  const nTree = 3 + Math.round(rnd() * 4);
  for (let i = 0; i < nTree; i++) tree(ctx, w * (0.03 + rnd() * 0.94), h * (0.66 + rnd() * 0.24), S * (0.05 + rnd() * 0.05), isBlueGreen ? "#2F5D6E" : "#202327", rnd);
  if (rnd() > 0.35) { // 小屋
    const hx = w * (0.15 + rnd() * 0.7), hy = h * (0.72 + rnd() * 0.14), hs = S * 0.05;
    ctx.fillStyle = rgba("#FFFFFF", 0.85); ctx.fillRect(hx, hy, hs, hs * 0.6);
    ctx.strokeStyle = "#202327"; ctx.lineWidth = Math.max(1, S * 0.004);
    ctx.beginPath(); ctx.moveTo(hx - hs * 0.15, hy); ctx.lineTo(hx + hs * 0.5, hy - hs * 0.35); ctx.lineTo(hx + hs * 1.15, hy); ctx.closePath(); ctx.stroke();
  }
  if (rnd() > 0.4) { // 小舟
    const bx = w * (0.1 + rnd() * 0.8), by = waterY + h * (0.12 + rnd() * 0.12), bs = S * 0.045;
    ctx.strokeStyle = "#202327"; ctx.lineWidth = Math.max(1, S * 0.005);
    ctx.beginPath(); ctx.moveTo(bx - bs, by); ctx.quadraticCurveTo(bx, by + bs * 0.5, bx + bs, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bs * 0.2, by); ctx.lineTo(bx + bs * 0.2, by - bs * 0.8); ctx.stroke();
  }
  // 印章
  seal(ctx, w * 0.955, h * 0.94, S * 0.045, rnd);
  ageSilk(ctx, w, h, rnd, silk);
}

/* 2) 瑞鹤图:青天 + 群鹤 */
function drawCrane(ctx, w, h, S, rnd) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9FC4CE"); sky.addColorStop(0.7, "#C4D8DA"); sky.addColorStop(1, "#DCE6E2");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // 祥云(屋顶檐脊)
  ctx.fillStyle = rgba("#FFFFFF", 0.5);
  for (let i = 0; i < 6; i++) {
    const cx = w * rnd(), cy = h * (0.86 + rnd() * 0.1), r = S * (0.08 + rnd() * 0.1);
    for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.ellipse(cx + j * r * 0.5 - r, cy + Math.sin(j) * r * 0.15, r * (0.5 + rnd() * 0.3), r * 0.32, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = rgba("#8C9095", 0.35);
  ctx.fillRect(w * 0.1, h * 0.93, w * 0.8, h * 0.012); // 檐线
  // 群鹤
  const cranes = 14;
  for (let i = 0; i < cranes; i++) {
    const cx = w * (0.08 + rnd() * 0.84), cy = h * (0.08 + rnd() * 0.62);
    const s = S * (0.035 + rnd() * 0.03), dir = rnd() > 0.5 ? 1 : -1, flap = rnd() * 0.6 - 0.3;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((rnd() - 0.5) * 0.7); ctx.scale(dir, 1);
    ctx.fillStyle = "#F7F5EE"; ctx.strokeStyle = rgba("#40474F", 0.7); ctx.lineWidth = Math.max(1, s * 0.06);
    ctx.beginPath(); ctx.ellipse(0, 0, s * 1.1, s * 0.5, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // 身
    ctx.beginPath(); ctx.arc(s * 1.05, -s * 0.35, s * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // 头
    ctx.fillStyle = "#CC4C28"; ctx.beginPath(); ctx.arc(s * 1.02, -s * 0.75, s * 0.14, 0, Math.PI * 2); ctx.fill(); // 丹顶
    ctx.fillStyle = "#202327"; ctx.beginPath(); ctx.arc(s * 1.3, -s * 0.32, s * 0.07, 0, Math.PI * 2); ctx.fill(); // 喙点
    for (const [dx, dy] of [[-0.2, -0.1], [0.35, -0.05]]) { // 双翼
      ctx.save(); ctx.translate(dx * s, dy * s); ctx.rotate(flap * dx * 4);
      ctx.fillStyle = "#F7F5EE"; ctx.strokeStyle = rgba("#40474F", 0.6);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * 0.9, -s * 1.2 * (1 + flap), -s * 1.7, -s * 0.3);
      ctx.quadraticCurveTo(-s * 0.9, -s * 0.1, 0, 0); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.strokeStyle = "#202327"; // 颈与腿
    ctx.lineWidth = Math.max(1, s * 0.08);
    ctx.beginPath(); ctx.moveTo(s * 0.8, -s * 0.2); ctx.quadraticCurveTo(s * 1.0, -s * 0.45, s * 1.05, -s * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.3); ctx.lineTo(-s * 0.9, s * 1.3); ctx.stroke();
    ctx.restore();
  }
  seal(ctx, w * 0.94, h * 0.9, S * 0.05, rnd);
  ageSilk(ctx, w, h, rnd, "#DCE6E2");
}

/* 3) 书法:朱丝栏 + 大字枯笔 + 印章 */
function drawCalligraphy(ctx, w, h, S, rnd) {
  const paper = "#F2ECD9";
  ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
  const cols = Math.max(3, Math.round(w / (S * 0.42)));
  const cw = w / cols;
  ctx.strokeStyle = rgba("#CC4C28", 0.35); ctx.lineWidth = Math.max(1, S * 0.003); // 朱丝栏
  for (let i = 1; i < cols; i++) { ctx.beginPath(); ctx.moveTo(i * cw, h * 0.04); ctx.lineTo(i * cw, h * 0.96); ctx.stroke(); }
  ctx.strokeStyle = rgba("#8C9095", 0.4); ctx.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
  const ink = "#26221B";
  for (let c = 0; c < cols; c++) {
    const rows = Math.max(2, Math.round(h / (S * 0.5)));
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      if (rnd() < 0.18) continue; // 章法留白
      const cx = c * cw + cw / 2, cy = r * ch + ch / 2;
      const strokes = 3 + Math.round(rnd() * 4);
      for (let s = 0; s < strokes; s++) {
        const x0 = cx + (rnd() - 0.5) * cw * 0.55, y0 = cy + (rnd() - 0.5) * ch * 0.55;
        const x1 = cx + (rnd() - 0.5) * cw * 0.6, y1 = cy + (rnd() - 0.5) * ch * 0.6;
        const cxp = (x0 + x1) / 2 + (rnd() - 0.5) * cw * 0.3, cyp = (y0 + y1) / 2 + (rnd() - 0.5) * ch * 0.3;
        const wdt = ch * (0.05 + rnd() * 0.08);
        brushStroke(ctx, x0, y0, cxp, cyp, x1, y1, wdt, ink, 0.82 + rnd() * 0.18);
      }
    }
  }
  seal(ctx, w * 0.9, h * 0.93, S * 0.055, rnd);
  // 两方印
  ctx.fillStyle = rgba("#CC4C28", 0.85);
  ctx.fillRect(w * 0.06, h * 0.93, S * 0.035, S * 0.035);
  ctx.fillStyle = "#F2ECD9";
  ctx.fillRect(w * 0.06 + S * 0.006, h * 0.93 + S * 0.006, S * 0.023, S * 0.023);
  ageSilk(ctx, w, h, rnd, paper, 0.1);
}

/* 枯笔笔画:沿二次贝塞尔的变宽填充,再叠干擦 */
function brushStroke(ctx, x0, y0, cx, cy, x1, y1, wMax, ink, alpha) {
  const N = 14, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    pts.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]);
  }
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [px, py] = pts[i];
    const [nx, ny] = i < N ? [pts[i + 1][0] - px, pts[i + 1][1] - py] : [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
    const len = Math.hypot(nx, ny) || 1;
    const wd = wMax * Math.sin(Math.PI * (0.12 + t * 0.88)) * (0.5 + Math.sin(t * Math.PI) * 0.6);
    const ox = -ny / len * wd / 2, oy = nx / len * wd / 2;
    if (i === 0) ctx.moveTo(px + ox, py + oy); else ctx.lineTo(px + ox, py + oy);
    ctx.lineTo(px - ox, py - oy);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(ink, alpha); ctx.fill();
  ctx.strokeStyle = rgba(ink, alpha * 0.5); ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) { // 飞白
    const t = 0.25 + Math.random() * 0.5;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.quadraticCurveTo(cx + (Math.random() - 0.5) * wMax, cy, x1, y1);
    ctx.setLineDash([2, wMax * 0.6]); ctx.stroke(); ctx.setLineDash([]);
    void t;
  }
}

/* 朱砂印章 */
function seal(ctx, x, y, s, rnd) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((rnd() - 0.5) * 0.08);
  ctx.fillStyle = rgba("#BF3220", 0.88);
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.strokeStyle = "#F2ECD9"; ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.strokeRect(-s * 0.38, -s * 0.38, s * 0.76, s * 0.76);
  ctx.fillStyle = "#F2ECD9";
  const g = s * 0.34 / 2;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    if (rnd() > 0.2) ctx.fillRect(-g * 1.6 + i * g * 2.2 - g * 0.5, -g * 1.6 + j * g * 2.2 - g * 0.5, g, g * (1 + rnd()));
  }
  ctx.restore();
}

/* 4) 青铜器:铜绿斑 + 器形 + 雷纹带 */
function drawBronze(ctx, w, h, S, rnd, work) {
  const dark = work.hue === "zheshi" ? "#3B332A" : "#2C3230";
  const bg = ctx.createRadialGradient(w * 0.4, h * 0.3, S * 0.1, w * 0.5, h * 0.5, S * 0.9);
  bg.addColorStop(0, mix(dark, "#C2CCCE", 0.18)); bg.addColorStop(1, dark);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // 铜绿锈斑
  const patina = work.hue === "songlv" ? ["#52755C", "#6E9A7E"] : work.hue === "zhusha" ? ["#8C5A3C", "#AC8367"] : ["#4E6E5E", "#5E8A6A"];
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w, y = rnd() * h, r = S * (0.03 + rnd() * 0.11);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(patina[i % 2], 0.35 + rnd() * 0.3)); g.addColorStop(1, rgba(patina[i % 2], 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // 器形:对称尊/鼎轮廓
  const cx = w / 2, top = h * 0.16, bot = h * 0.84;
  const bronze = mix("#3A4A42", HUES[work.hue]?.dot || "#52755C", 0.28);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.13, top);
  ctx.bezierCurveTo(cx - w * 0.05, top + h * 0.1, cx - w * 0.2, top + h * 0.22, cx - w * 0.21, top + h * 0.4);
  ctx.bezierCurveTo(cx - w * 0.22, top + h * 0.62, cx - w * 0.14, top + h * 0.66, cx - w * 0.24, bot);
  ctx.lineTo(cx + w * 0.24, bot);
  ctx.bezierCurveTo(cx + w * 0.14, top + h * 0.66, cx + w * 0.22, top + h * 0.62, cx + w * 0.21, top + h * 0.4);
  ctx.bezierCurveTo(cx + w * 0.2, top + h * 0.22, cx + w * 0.05, top + h * 0.1, cx + w * 0.13, top);
  ctx.closePath();
  const vg = ctx.createLinearGradient(cx - w * 0.22, 0, cx + w * 0.22, 0);
  vg.addColorStop(0, mix(bronze, "#202327", 0.4)); vg.addColorStop(0.35, mix(bronze, "#C2CCCE", 0.22));
  vg.addColorStop(0.6, bronze); vg.addColorStop(1, mix(bronze, "#202327", 0.45));
  ctx.fillStyle = vg; ctx.fill();
  ctx.strokeStyle = rgba("#202327", 0.5); ctx.lineWidth = Math.max(1, S * 0.005); ctx.stroke();
  ctx.clip();
  // 雷纹带(回纹)
  ctx.strokeStyle = rgba(mix(bronze, "#C2CCCE", 0.5), 0.65); ctx.lineWidth = Math.max(1, S * 0.006);
  const bandY = [0.3, 0.55, 0.72];
  for (const by of bandY) {
    const bh = h * 0.09, n = 6;
    for (let i = 0; i < n; i++) {
      const x0 = cx - w * 0.2 + (i / n) * w * 0.4, s0 = (w * 0.4 / n) * 0.7;
      spiralSquare(ctx, x0, top + by * h * 0.68 + h * 0.16, s0);
      void bh;
    }
  }
  // 兽面:双目
  ctx.fillStyle = rgba(mix(bronze, "#AAA04D", 0.45), 0.8);
  for (const ex of [-0.09, 0.09]) {
    ctx.beginPath(); ctx.ellipse(cx + w * ex, h * 0.45, S * 0.035, S * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // 口沿高光 + 金尘
  ctx.strokeStyle = rgba("#AAA04D", 0.5); ctx.lineWidth = Math.max(1, S * 0.004);
  ctx.beginPath(); ctx.moveTo(cx - w * 0.13, top); ctx.lineTo(cx + w * 0.13, top); ctx.stroke();
  ctx.fillStyle = rgba("#AAA04D", 0.5);
  for (let i = 0; i < 40; i++) { ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4); }
}

/* 回纹:方形螺旋 */
function spiralSquare(ctx, x, y, s) {
  ctx.beginPath();
  let cx0 = x, cy0 = y, side = s, dir = 0;
  ctx.moveTo(cx0, cy0);
  for (let k = 0; k < 3; k++) {
    const d = side * (1 - k * 0.28);
    if (dir === 0) ctx.lineTo(cx0 + d, cy0);
    else if (dir === 1) ctx.lineTo(cx0, cy0 + d);
    else if (dir === 2) ctx.lineTo(cx0 - d, cy0);
    else ctx.lineTo(cx0, cy0 - d);
    if (dir === 0) cx0 += d; else if (dir === 1) cy0 += d; else if (dir === 2) cx0 -= d; else cy0 -= d;
    dir = (dir + 1) % 4;
  }
  ctx.stroke();
}

/* 5) 金箔:深底 + 旋转神鸟/光芒 */
function drawGold(ctx, w, h, S, rnd) {
  const bg = ctx.createRadialGradient(w / 2, h / 2, S * 0.05, w / 2, h / 2, S * 0.85);
  bg.addColorStop(0, "#4A3A22"); bg.addColorStop(1, "#241C10");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  // 十二道齿芒
  ctx.save(); ctx.translate(cx, cy);
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate((i / 12) * Math.PI * 2);
    const len = S * (0.3 + rnd() * 0.08);
    const g = ctx.createLinearGradient(S * 0.09, 0, len, 0);
    g.addColorStop(0, rgba("#E8C46A", 0.95)); g.addColorStop(1, rgba("#AAA04D", 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(S * 0.085, -S * 0.02); ctx.lineTo(len, 0); ctx.lineTo(S * 0.085, S * 0.02); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 旋转火焰弧(逆时针飞翔的神鸟)
  ctx.strokeStyle = rgba("#D9AE55", 0.85);
  for (let i = 0; i < 4; i++) {
    ctx.save(); ctx.rotate((i / 4) * Math.PI * 2 + 0.4);
    ctx.lineWidth = Math.max(2, S * 0.014); ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(0, 0, S * 0.31, Math.PI * 0.9, Math.PI * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, S * 0.36, Math.PI * 1.1, Math.PI * 1.6); ctx.lineWidth = Math.max(1, S * 0.008); ctx.stroke();
    // 鸟首
    ctx.fillStyle = rgba("#E8C46A", 0.95);
    ctx.beginPath(); ctx.arc(S * 0.30, -S * 0.03, S * 0.02, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // 中心日轮
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, S * 0.14);
  core.addColorStop(0, "#F6DB96"); core.addColorStop(1, "#C79B3F");
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, S * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 金箔碎屑
  ctx.fillStyle = rgba("#E8C46A", 0.7);
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2, r = S * (0.42 + rnd() * 0.42);
    ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.rotate(rnd() * 3);
    ctx.fillRect(0, 0, 1 + rnd() * 2.6, 1 + rnd() * 2.2); ctx.restore();
  }
}

/* 6) 瓷器:天青釉冰裂 / 青花缠枝 */
function drawPorcelain(ctx, w, h, S, rnd, work) {
  const blueWhite = work.hue === "shanqing";
  const glaze = blueWhite ? "#EAF0EE" : "#CFDCD8";
  const gg = ctx.createLinearGradient(0, 0, 0, h);
  gg.addColorStop(0, mix(glaze, "#FFFFFF", 0.35)); gg.addColorStop(1, glaze);
  ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
  // 冰裂开片
  ctx.strokeStyle = rgba(blueWhite ? "#8C9095" : "#5E99B0", 0.22); ctx.lineWidth = 1;
  for (let i = 0; i < 46; i++) {
    let x = rnd() * w, y = rnd() * h;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      const ang = rnd() * Math.PI * 2, len = S * (0.04 + rnd() * 0.09);
      x += Math.cos(ang) * len; y += Math.sin(ang) * len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // 瓷瓶剪影
  const cx = w / 2;
  const bodyTop = h * 0.3, bodyBot = h * 0.86;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.09, h * 0.14);
  ctx.bezierCurveTo(cx - w * 0.16, h * 0.26, cx - w * 0.26, h * 0.38, cx - w * 0.24, h * 0.58);
  ctx.bezierCurveTo(cx - w * 0.23, h * 0.8, cx - w * 0.12, bodyBot, cx, bodyBot);
  ctx.bezierCurveTo(cx + w * 0.12, bodyBot, cx + w * 0.23, h * 0.8, cx + w * 0.24, h * 0.58);
  ctx.bezierCurveTo(cx + w * 0.26, h * 0.38, cx + w * 0.16, h * 0.26, cx + w * 0.09, h * 0.14);
  ctx.closePath();
  const vg = ctx.createLinearGradient(cx - w * 0.24, 0, cx + w * 0.24, 0);
  vg.addColorStop(0, mix(glaze, "#FFFFFF", 0.05));
  vg.addColorStop(0.4, mix(glaze, "#FFFFFF", 0.5));
  vg.addColorStop(1, mix(glaze, "#8C9095", 0.18));
  ctx.fillStyle = vg; ctx.fill();
  ctx.strokeStyle = rgba("#8C9095", 0.5); ctx.lineWidth = Math.max(1, S * 0.004); ctx.stroke();
  ctx.clip();
  if (blueWhite) { // 青花缠枝莲
    ctx.strokeStyle = rgba("#3A5A8C", 0.8); ctx.lineWidth = Math.max(2, S * 0.012); ctx.lineCap = "round";
    let x = cx - w * 0.22, y = h * 0.6;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 5; i++) {
      const nx = x + w * 0.1, ny = h * (0.42 + rnd() * 0.34);
      ctx.bezierCurveTo(x + w * 0.05, y - h * 0.14, nx - w * 0.05, ny + h * 0.14, nx, ny);
      // 缠枝花头
      ctx.fillStyle = rgba("#3A5A8C", 0.75);
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2 + rnd();
        ctx.beginPath(); ctx.ellipse(nx + Math.cos(a) * S * 0.035, ny + Math.sin(a) * S * 0.035, S * 0.028, S * 0.012, a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = rgba("#FFFFFF", 0.9);
      ctx.beginPath(); ctx.arc(nx, ny, S * 0.012, 0, Math.PI * 2); ctx.fill();
      x = nx; y = ny;
    }
    ctx.stroke();
  } else { // 汝窑弦纹
    ctx.strokeStyle = rgba("#5E99B0", 0.4); ctx.lineWidth = 1.5;
    for (const ry of [0.44, 0.52, 0.6]) {
      ctx.beginPath(); ctx.moveTo(cx - w * 0.21, h * ry); ctx.quadraticCurveTo(cx, h * (ry + 0.02), cx + w * 0.21, h * ry); ctx.stroke();
    }
  }
  ctx.restore();
  // 圈足阴影
  ctx.fillStyle = rgba("#8C9095", 0.25);
  ctx.beginPath(); ctx.ellipse(cx, bodyBot + h * 0.02, w * 0.2, h * 0.015, 0, 0, Math.PI * 2); ctx.fill();
}

/* 7) 唐三彩:釉色垂流 */
function drawTerracotta(ctx, w, h, S, rnd) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#E8D9C4"); bg.addColorStop(1, "#D9C4A8");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  // 骆驼载乐:驼体 + 乐人剪影
  ctx.fillStyle = rgba("#B4884F", 0.9);
  ctx.beginPath(); ctx.ellipse(cx, h * 0.62, w * 0.3, h * 0.16, 0, 0, Math.PI * 2); ctx.fill(); // 驼身
  ctx.beginPath(); ctx.moveTo(cx - w * 0.02, h * 0.5);
  ctx.bezierCurveTo(cx + w * 0.1, h * 0.42, cx + w * 0.06, h * 0.3, cx + w * 0.13, h * 0.26);
  ctx.lineTo(cx + w * 0.17, h * 0.32); ctx.bezierCurveTo(cx + w * 0.12, h * 0.36, cx + w * 0.1, h * 0.44, cx + w * 0.08, h * 0.5);
  ctx.closePath(); ctx.fill(); // 颈与头
  ctx.strokeStyle = rgba("#8C5A3C", 0.7); ctx.lineWidth = Math.max(2, S * 0.008);
  for (const lx of [-0.22, 0.22]) { ctx.beginPath(); ctx.moveTo(cx + w * lx, h * 0.72); ctx.lineTo(cx + w * lx * 1.1, h * 0.9); ctx.stroke(); } // 腿
  // 三彩釉流
  const pours = ["#C99A3B", "#7A9A6A", "#A65E3C"];
  for (let i = 0; i < 22; i++) {
    const x = cx + (rnd() - 0.5) * w * 0.62, y0 = h * (0.42 + rnd() * 0.2), len = h * (0.06 + rnd() * 0.22);
    const g = ctx.createLinearGradient(x, y0, x, y0 + len);
    g.addColorStop(0, rgba(pours[i % 3], 0.65)); g.addColorStop(1, rgba(pours[i % 3], 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y0 + len / 2, S * (0.006 + rnd() * 0.014), len / 1.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 驼峰上的乐人
  for (let i = 0; i < 4; i++) {
    const px = cx - w * 0.18 + i * w * 0.12, py = h * 0.48 - rnd() * h * 0.04;
    ctx.fillStyle = rgba(i % 2 ? "#8C5A3C" : "#B4884F", 0.95);
    ctx.beginPath(); ctx.arc(px, py, S * 0.02, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(px - S * 0.014, py + S * 0.02, S * 0.028, S * 0.06);
    ctx.strokeStyle = rgba("#40474F", 0.6); ctx.lineWidth = Math.max(1, S * 0.004);
    ctx.beginPath(); ctx.moveTo(px + S * 0.02, py - S * 0.01); ctx.lineTo(px + S * 0.05, py - S * 0.05); ctx.stroke(); // 乐器杆
  }
  ageSilk(ctx, w, h, rnd, "#D9C4A8", 0.1);
}

/* 8) 油画:厚涂色块 + 漩涡 */
function drawOil(ctx, w, h, S, rnd, work) {
  const theme = {
    tianqing: { bg: "#C8D4CC", pal: ["#7FA8A0", "#5E99B0", "#9BC2B4", "#C9D8D6", "#8C9095", "#E8E4DA"], swirl: false },
    liujin:   { bg: "#D9C896", pal: ["#D9A94A", "#AAA04D", "#C98A3B", "#8C7A3B", "#E8D8A0", "#7A6234"], swirl: false },
    yuebai:   { bg: "#D8D4CC", pal: ["#C2CCCE", "#8C9095", "#EAEAEA", "#ACB8C4", "#9A8FA0", "#40474F"], swirl: false },
    dailan:   { bg: "#2A3A5C", pal: ["#3A5A8C", "#5E7AB0", "#8CA0C8", "#E8D8A0", "#2C3E68", "#AAA04D"], swirl: true },
  }[work.hue] || { bg: "#CCC8C0", pal: ["#8C9095", "#AC8367", "#C2CCCE", "#40474F", "#AAA04D", "#5E99B0"], swirl: false };
  const linen = ctx.createLinearGradient(0, 0, w, h);
  linen.addColorStop(0, mix(theme.bg, "#FFFFFF", 0.15)); linen.addColorStop(1, mix(theme.bg, "#8C9095", 0.2));
  ctx.fillStyle = linen; ctx.fillRect(0, 0, w, h);
  // 亚麻布纹
  ctx.globalAlpha = 0.06;
  for (let y = 0; y < h; y += 3) { ctx.fillStyle = y % 6 ? "#40474F" : "#FFFFFF"; ctx.fillRect(0, y, w, 1); }
  ctx.globalAlpha = 1;
  if (theme.swirl) { // 星空式漩涡
    for (let s = 0; s < 5; s++) {
      const sx = w * (0.15 + rnd() * 0.7), sy = h * (0.12 + rnd() * 0.76), R = S * (0.12 + rnd() * 0.16);
      ctx.strokeStyle = rgba(theme.pal[s % theme.pal.length], 0.8);
      ctx.lineWidth = S * (0.012 + rnd() * 0.012); ctx.lineCap = "round";
      let ang = rnd() * Math.PI * 2;
      ctx.beginPath();
      for (let t = 0; t < 3.2; t += 0.08) {
        const r = R * (0.15 + t * 0.27);
        const x = sx + Math.cos(ang + t * 1.9) * r, y = sy + Math.sin(ang + t * 1.9) * r * 0.8;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  // 厚涂色块(impasto dabs)
  const dabs = 240;
  for (let i = 0; i < dabs; i++) {
    const x = rnd() * w, y = rnd() * h;
    const dy = (y / h - 0.5) * (theme.bg === "#2A3A5C" ? 1 : 1.4); // 下半更密
    const r = S * (0.014 + rnd() * 0.024) * (1 + Math.abs(dy) * 0.4);
    ctx.fillStyle = theme.pal[Math.floor(rnd() * theme.pal.length)];
    ctx.save(); ctx.translate(x, y); ctx.rotate(rnd() * Math.PI);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * (0.3 + rnd() * 0.3), 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba("#40474F", 0.12); ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  // 签名
  ctx.strokeStyle = rgba("#202327", 0.6); ctx.lineWidth = Math.max(1, S * 0.004);
  ctx.beginPath(); ctx.moveTo(w * 0.86, h * 0.94);
  ctx.quadraticCurveTo(w * 0.9, h * 0.9, w * 0.94, h * 0.94); ctx.stroke();
}

/* 9) 用户照片的暗房边框(上传照片归类后使用) */
function drawPhotoFrame(ctx, w, h, S, rnd) { void ctx; void w; void h; void S; void rnd; }

/* ---------- 存储层(数据全部留在本机) ---------- */
const STORE_KEY = "zaiguan.v4";
const DEFAULT_STATE = {
  likes: [], sets: [], crops: [], creations: [],
  notes: {}, photos: [], profile: { name: "观展人", initials: "观" },
};
let state = loadState();
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch { return structuredClone(DEFAULT_STATE); }
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function uid(p = "id") { return p + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------- 统一作品源:内置馆藏 + 用户上传 ---------- */
function allWorks() { return [...state.photos, ...KB]; }
function workById(id) { return allWorks().find(w => w.id === id); }
function isLiked(id) { return state.likes.includes(id); }
function toggleLike(id) {
  const i = state.likes.indexOf(id);
  if (i >= 0) state.likes.splice(i, 1); else state.likes.push(id);
  saveState();
  return i < 0;
}

/* ---------- EXIF:取拍摄时间 ---------- */
function exifDateTime(file) {
  return file.arrayBuffer().then(buf => {
    const dv = new DataView(buf);
    if (dv.byteLength < 4 || dv.getUint16(0) !== 0xFFD8) return null;
    let off = 2;
    while (off < dv.byteLength - 1) {
      if (dv.getUint8(off) !== 0xFF) { off++; continue; }
      const marker = dv.getUint8(off + 1);
      if (marker === 0xE1) { // APP1 EXIF
        const tiff = off + 10;
        const little = dv.getUint16(tiff) === 0x4949;
        const read16 = p => dv.getUint16(p, little), read32 = p => dv.getUint32(p, little);
        let dir = tiff + read32(tiff + 4);
        const n = read16(dir);
        for (let i = 0; i < n; i++) {
          const e = dir + 2 + i * 12;
          if (read16(e) === 0x9003) { // DateTimeOriginal
            const len = read32(e + 4), p = read32(e + 8) + tiff;
            let s = "";
            for (let k = 0; k < Math.min(len - 1, 24); k++) s += String.fromCharCode(dv.getUint8(p + k));
            // "YYYY:MM:DD HH:MM:SS" → "YYYY-MM-DD HH:MM"
            const m = s.match(/^(\d{4}):(\d{2}):(\d{2})[ ]?(\d{2})?:?(\d{2})?/);
            if (m) return `${m[1]}-${m[2]}-${m[3]}${m[4] ? " " + m[4] + ":" + (m[5] || "00") : ""}`;
          }
        }
        return null;
      }
      if (marker === 0xDA) break;
      off += 2 + dv.getUint16(off + 2);
    }
    return null;
  }).catch(() => null);
}

/* ---------- 主色 → 色系(Rijksstudio 式颜色自动归类) ---------- */
function nearestHue(r, g, b) {
  let best = "yuebai", bd = Infinity;
  for (const id of HUE_IDS) {
    const [hr, hg, hb] = hexToRgb(HUES[id].dot);
    const d = (r - hr) ** 2 + (g - hg) ** 2 + (b - hb) ** 2;
    if (d < bd) { bd = d; best = id; }
  }
  return best;
}
function dominantHue(canvas) {
  const c = document.createElement("canvas");
  c.width = c.height = 24;
  const x = c.getContext("2d");
  x.drawImage(canvas, 0, 0, 24, 24);
  const d = x.getImageData(0, 0, 24, 24).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return nearestHue(r / n, g / n, b / n);
}

/* ---------- 上传照片:压缩入库 ---------- */
function ingestPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 1280;
      const k = Math.min(1, maxSide / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      const hue = dominantHue(cv);
      exifDateTime(file).then(date => {
        const ph = {
          id: uid("up"), kind: "photo",
          name: file.name.replace(/\.[^.]+$/, "") || "观展照片",
          artist: "我的镜头", era: date || "拍摄时间未记录",
          medium: "数字照片", category: "我的照片",
          collection: "我的观展相册", hue, style: "photo",
          ar: img.width / img.height, data: cv.toDataURL("image/jpeg", 0.86),
          desc: "上传于 " + new Date().toLocaleString("zh-CN", { hour12: false }),
        };
        state.photos.unshift(ph); saveState();
        URL.revokeObjectURL(img.src);
        resolve(ph);
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- 作品图:优先真实影像(Wikimedia Commons,公有领域/CC),离线回退程序化生成 ---------- */
const urlCache = new Map();
function workImage(work, maxSide = 1080) {
  if (work.img) return maxSide <= 640 ? (work.imgS || work.img) : work.img;
  const key = work.id + "@" + maxSide;
  if (!urlCache.has(key)) {
    const cv = work.kind === "photo" ? photoCanvas(work) : makeWorkCanvas(work, maxSide);
    urlCache.set(key, cv.toDataURL("image/jpeg", 0.9));
  }
  return urlCache.get(key);
}
/* 程序化兜底图(真实影像加载失败时) */
function fallbackImage(work) {
  const key = work.id + "@fb";
  if (!urlCache.has(key)) {
    urlCache.set(key, makeWorkCanvas(work, 900).toDataURL("image/jpeg", 0.9));
  }
  return urlCache.get(key);
}
const photoCvCache = new Map();
function photoCanvas(work) {
  if (!photoCvCache.has(work.id)) {
    const img = new Image();
    // 同步占位:先给一张灰底,真实图异步替换后刷新(由 app 层调用 refreshPhotoImgs)
    const cv = document.createElement("canvas");
    cv.width = 640; cv.height = 640;
    const x = cv.getContext("2d");
    x.fillStyle = "#EAEAEA"; x.fillRect(0, 0, 640, 640);
    photoCvCache.set(work.id, cv);
    img.onload = () => {
      const t = document.createElement("canvas");
      t.width = img.width; t.height = img.height;
      t.getContext("2d").drawImage(img, 0, 0);
      photoCvCache.set(work.id, t);
      for (const k of [...urlCache.keys()]) if (k.startsWith(work.id + "@")) urlCache.delete(k);
      document.dispatchEvent(new CustomEvent("zaiguan:photo-ready", { detail: work.id }));
    };
    img.src = work.data;
  }
  return photoCvCache.get(work.id);
}

/* ---------- 下载 dataURL ---------- */
function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- 日期格式 ---------- */
function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
