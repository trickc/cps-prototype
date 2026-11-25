/* =========================================================================
   mock.js —— 单一数据源（公共短剧剧库 + 平台字段映射）
   所有页面统一从这里读取；字段对齐「统一字段模型」见 contract/data-model.md
   ========================================================================= */

/* 平台定义：聚焦三渠道（微信小程序 / 抖音小程序 / OPPO端原生）；
   其余平台标记 hidden=true 仅隐藏界面，数据与字段契约保留，可随时恢复 */
const PLATFORMS = [
  { key: 'oppo',      name: 'OPPO端原生', tone: '#14574F', flow: '创建短剧 → 全量推送剧集 → 提审发布', hidden: false },
  { key: 'wechat',    name: '微信小程序', tone: '#07C160', flow: '待定', hidden: false },
  { key: 'douyin',    name: '抖音小程序', tone: '#161823', flow: '待定', hidden: false },
  { key: 'vivo',      name: 'vivo',   tone: '#5E7A8F', flow: '短剧入库 → 视频发布 → 上下架', hidden: true },
  { key: 'honor',     name: '荣耀',   tone: '#3A7D52', flow: '推剧 → 推集(触发转码) → 补偿任务拉取', hidden: true },
  { key: 'yinhe',     name: '银河',   tone: '#B08A4B', flow: '推 album → 推 video → 介质注入/转码', hidden: true },
  { key: 'sohu',      name: '搜狐',   tone: '#A06B5C', flow: '建播单 → 上传音视频 → session 提交', hidden: true },
  { key: 'baijiahao', name: '百家号', tone: '#4A6E88', flow: '创建短剧壳 → 逐集上传 → 提交发布', hidden: true },
  { key: 'alipay',    name: '支付宝', tone: '#14574F', flow: '创建短剧 → 编辑 → 提审并发布 → 查询结果', hidden: true }
];

/* 界面可见平台（聚焦三渠道；其余平台数据保留、仅隐藏界面） */
const VISIBLE_PLATFORMS = PLATFORMS.filter(function (p) { return !p.hidden; });

/* 内容分类（两级，必填单选）：一级 → 二级 */
const CONTENT_CATEGORIES = {
  '真人': ['真人短剧'],
  '动漫': ['AI漫剧', 'AI推文/解说漫剧', '沙雕动画'],
  'AI仿真漫剧': ['AI仿真漫剧', 'AI仿真推文/解说漫剧']
};

/* 中台系统项目信息（立项库，单选来源）
   新建短剧时从本列表选择「项目名称 / ID」 */
const MID_PROJECTS = [
  { id: 'R-ZR-ZZ-000463', name: '弃少不好惹' },
  { id: 'R-ZR-ZZ-000470', name: '千金归来' },
  { id: 'R-ZR-ZZ-000481', name: '龙王殿' },
  { id: 'R-ZR-ZZ-000495', name: '闪婚老公是大佬' },
  { id: 'R-ZR-ZZ-000509', name: '凤临天下' },
  { id: 'R-ZR-ZZ-000518', name: '重生后我成了学霸' },
  { id: 'R-ZR-ZZ-000529', name: '悬崖边的爱' },
  { id: 'R-ZR-ZZ-000540', name: '神医归来' }
];

/* 支付宝标签枚举（tag_list，可多选；分发时可复用给 OPPO / vivo / 支付宝 / 银河） */
const ALIPAY_TAGS = [
  '古风','科幻','魔幻','年代','都市爱情','都市家庭','都市逆袭','都市热血','都市萌宝',
  '仙侠灵异','乡村生活','校园生活','悬疑犯罪','武侠萌宝','末日求生'
];

/* 上线渠道枚举（可多选） */
const LAUNCH_CHANNELS = [
  '爱奇艺', '优酷', '腾讯视频', '红果', '抖音', '快手', '视频号', '拼多多', 'vivo', 'oppo', '小米', '其他'
];

/* 上线平台枚举（可多选，必填）：端原生/小程序两类，用于联动「端原生上架」 */
const LAUNCH_PLATFORMS = [
  '微信小程序','抖音小程序','TME端原生','搜狐端原生','B站小程序','OPPO小程序',
  '百家号端原生','支付宝端原生','支付宝小程序','支付宝生活号','银河端原生','荣耀端原生','VIVO端原生'
];

/* 剧本团队枚举（可多选，必填） */
const SCRIPT_TEAMS = [
  '念三团队','慕白团队','九天团队','星火团队','光影团队','山海团队'
];

/* 制作团队枚举（可多选，必填） */
const PRODUCTION_TEAMS = [
  '麦芽传媒','星驰影视','光影工作室','山海影业','星河制作','云帆传媒'
];

/* 合作剧类型枚举（可多选，必填） */
const COOP_TYPES = [
  '承制剧-微短剧','承制剧-数字营销中心','自制剧','外部剧','外部承制剧-承制','外部承制剧-小说'
];

/* 作品标签枚举（可多选，必填） */
const WORK_TAGS = [
  '文旅合作剧','MCN','真人','漫剧','AI真人','小说解说','批量剧','效率剧','批量剧-小说解说','批量剧-效率剧'
];

/* 备注枚举（单选，必填，默认「新剧」） */
const DRAMA_REMARKS = [
  '新剧','重剪未重拍','老剧换新名（未重剪未重拍）','老剧换配音','外部新剧','外部老剧','巨量跑微小'
];

/* 短剧角标枚举（单选，非必填） */
const DRAMA_BADGES = ['新剧','热播','独播','男频','女频'];

/* 上榜榜单枚举（荣耀 rankList 映射，1~10，可多选） */
const RANK_BOARDS = [
  { code: 1, name: '抖音热播榜' }, { code: 2, name: '红果漫剧热播榜' },
  { code: 3, name: '红果AI剧热播榜' }, { code: 4, name: '抖音漫剧热播榜' },
  { code: 5, name: '热力榜' }, { code: 6, name: '抖音真人AI剧热播榜' },
  { code: 7, name: '拼多多日榜' }, { code: 8, name: '快手热播榜' },
  { code: 9, name: '其他' }, { code: 10, name: '无' }
];

/* 荣耀题材类型枚举（genres，1~29，英文逗号分隔，可多选） */
const HONOR_GENRES = [
  { code: 1, name: '现言' }, { code: 2, name: '女性成长' }, { code: 3, name: '脑洞' },
  { code: 4, name: '奇幻' }, { code: 5, name: '玄幻' }, { code: 6, name: '古言' },
  { code: 7, name: '战神' }, { code: 8, name: '宫斗' }, { code: 9, name: '仙侠' },
  { code: 10, name: '权谋' }, { code: 11, name: '种田' }, { code: 12, name: '年代爱情' },
  { code: 13, name: '喜剧' }, { code: 14, name: '悬疑' }, { code: 15, name: '青春' },
  { code: 16, name: '民国爱情' }, { code: 17, name: '志怪' }, { code: 18, name: '家国情怀' },
  { code: 19, name: '法律' }, { code: 20, name: '刑侦' }, { code: 21, name: '抗战' },
  { code: 22, name: '武侠' }, { code: 23, name: '民国传奇' }, { code: 24, name: '动作' },
  { code: 25, name: '求生' }, { code: 26, name: '科幻' }, { code: 27, name: '恐怖' },
  { code: 28, name: '商战' }, { code: 29, name: '其他' }
];

/* 荣耀内容属性枚举（多选：正常/血腥/暴力/暴露） */
const HONOR_CONTENT_ATTRS = ['正常', '血腥', '暴力', '暴露'];

/* 百家号短剧分类枚举（pay_playlet_sub_category：一级分类 → 二级分类编号） */
const BAIJIAO_CATEGORIES = {
  '男频': [
    { code: 1, name: '战神' }, { code: 2, name: '神医' }, { code: 3, name: '赘婿' },
    { code: 4, name: '逆袭' }, { code: 5, name: '神豪' }, { code: 6, name: '重生' },
    { code: 7, name: '校园' }, { code: 8, name: '复仇' }, { code: 9, name: '穿越' },
    { code: 10, name: '历史' }, { code: 11, name: '奇幻' }, { code: 12, name: '悬疑' },
    { code: 13, name: '其他' }, { code: 25, name: '异能' }, { code: 26, name: '系统' },
    { code: 27, name: '武侠修仙' }, { code: 28, name: '惊悚恐怖' }, { code: 29, name: '正能量' },
    { code: 30, name: '衍生同人' }, { code: 31, name: '灾难末日' }, { code: 32, name: '都市' },
    { code: 33, name: '银发' }, { code: 34, name: '乡村' }, { code: 35, name: '年代' },
    { code: 36, name: '权谋' }, { code: 37, name: '人外' }, { code: 38, name: '竞技比赛' },
    { code: 39, name: '搞笑' }
  ],
  '女频': [
    { code: 14, name: '甜宠' }, { code: 15, name: '虐恋' }, { code: 16, name: '古言' },
    { code: 17, name: '女强' }, { code: 18, name: '萌宝' }, { code: 19, name: '复仇' },
    { code: 20, name: '穿越' }, { code: 21, name: '重生' }, { code: 22, name: '校园' },
    { code: 23, name: '总裁' }, { code: 24, name: '其他' }, { code: 40, name: '异能' }
  ],
  '新增': [
    { code: 41, name: '历史架空' }, { code: 42, name: '年代' }, { code: 43, name: '团宠' },
    { code: 44, name: '明星娱乐' }, { code: 45, name: '家庭伦理' }, { code: 46, name: '都市' },
    { code: 47, name: '萌宝' }, { code: 48, name: '悬疑' }, { code: 49, name: '银发' },
    { code: 50, name: '正能量' }, { code: 51, name: '搞笑' }, { code: 52, name: '治愈' },
    { code: 53, name: '人外' }, { code: 54, name: '系统' }, { code: 55, name: '衍生同人' },
    { code: 56, name: '灾难末日' }, { code: 57, name: '真假身份' }
  ]
};

/* 百家号「标签」多选枚举：按短剧受众定位展示对应二级分类文案
   男频 → 1~13 + 25~39；女频 → 14~24 + 40~57 */
function baijiaTagsForAudience(audience) {
  if (audience === '女频') {
    return (BAIJIAO_CATEGORIES['女频'] || []).concat(BAIJIAO_CATEGORIES['新增'] || []);
  }
  return BAIJIAO_CATEGORIES['男频'] || [];
}

/* 平台特有字段（分发时需在公共字段之外补充） */
const PLATFORM_SPECIAL = {
  wechat: [],
  douyin: [],
  oppo: [
    { label: '短剧类型', key: 'dramaType', control: 'radio', options: ['普通短剧', '快应用短剧'], default: '普通短剧', note: 'dramaType · normal-普通短剧 / quick-快应用短剧', required: true },
    { label: '版权到期时间', key: 'copyrightExpiry', control: 'datetime', note: '版权授权到期时间', required: true },
    { label: '节目热度', note: '热度值，推荐分发排序用', required: false },
    { label: '节目评分', note: '0-10 分', required: false },
    { label: '是否转授权', key: 'isTransfer', control: 'radio', options: ['是', '否'], default: '是', note: '是否转授权，默认是', required: true },
    { label: '播出情况', key: 'premiereStatus', control: 'select', options: ['全网首轮独播', '全网首轮联播', '非首轮播出'], default: '全网首轮独播', note: '是否首轮播出 · 独播 / 联播 / 非首轮', required: true }
  ],
  vivo: [
    { label: '付费类型', key: 'chargeType', control: 'vivo-charge', options: ['免费', '整部付费', '按集付费'], default: '免费', note: '免费 / 整部付费 / 按集付费，默认免费', required: true },
    { label: '合作方备案号', key: 'coopRecordNo', control: 'text', note: '合作方备案号，非必填', required: false },
    { label: '版权到期时间', key: 'copyrightExpiry', control: 'datetime', note: '版权授权到期时间', required: true },
    { label: '授权发布日期', key: 'licenseDate', control: 'datetime', note: '版权授权发布日期，非必填', required: false },
    { label: '分成比例', note: '0-10 整数', required: false },
    { label: '播出情况', key: 'broadcast', control: 'select', options: ['全网首轮独播', '全网首轮联播', '非首轮播出'], default: '全网首轮独播', note: '播出情况 · 独播 / 联播 / 非首轮', required: true }
  ],
  honor: [
    { label: '题材类型', key: 'genres', control: 'honor-genres', note: '1~29 英文逗号分隔，可多选', required: true },
    { label: 'CP侧备案号', key: 'cpRecordNo', control: 'text', note: 'CP侧备案号', required: true },
    { label: '版权到期时间', key: 'copyrightExpiry', control: 'datetime', note: '版权授权到期时间', required: true },
    { label: '授权发布日期', key: 'licenseDate', control: 'datetime', note: '版权授权发布日期，非必填', required: false },
    { label: '上线渠道', key: 'launchChannels', control: 'honor-launch-channels', note: '可多选：爱奇艺 / 优酷 / 腾讯视频 / 红果 / 抖音 / 快手 / 视频号 / 拼多多 / vivo / oppo / 小米 / 其他', required: false },
    { label: '上榜榜单', key: 'rankBoards', control: 'honor-rank-boards', note: '荣耀 rankList 映射（1~10），可多选', required: false },
    { label: '历史播放量', key: 'historyViews', control: 'honor-number', note: '计算抖音内的数据', required: true },
    { label: '历史点赞量', key: 'historyLikes', control: 'honor-number', note: '计算抖音内的数据', required: true },
    { label: '历史追剧/收藏量', key: 'historyFollows', control: 'honor-number', note: '计算抖音内的数据', required: true },
    { label: '历史评论数', key: 'historyComments', control: 'honor-number', note: '计算抖音内的数据', required: true },
    { label: '内容属性', key: 'contentAttrs', control: 'honor-attrs', note: '多选：正常 / 血腥 / 暴力 / 暴露，默认不选', required: false },
    { label: '是否凤标', key: 'hasFengBiao', control: 'honor-fengbiao', options: ['是', '否'], default: '否', note: '选「是」时填写凤标备案号', required: false },
    { label: '付费类型', key: 'chargeType', control: 'honor-charge', options: ['1 免费', '2 整部购买', '3 按集购买'], note: '整部购买→整部总价 / 按集购买→收费卡点集数+单集价格', required: true },
    { label: '播出类型', key: 'broadcastType', control: 'select', options: ['全网首轮独播', '全网首轮联播', '非首轮播出'], default: '全网首轮独播', note: '播出类型 · 独播 / 联播 / 非首轮', required: true }
  ],
  yinhe: [
    { label: '频道名称', key: 'chnName', control: 'yinhe-channel', options: ['微短剧', '漫剧', '健康', '儿童', '动漫', '戏曲', '教育', '生活', '电影', '电视剧', '纪录片'], note: '下拉单选，默认微短剧', required: true },
    { label: '是否多集', key: 'isMulti', control: 'radio', options: ['是', '否'], default: '是', note: '是否多集，默认是', required: true },
    { label: '是否付费', key: 'isPay', control: 'yinhe-charge', options: ['免费', '付费'], note: '免费 / 付费 · 付费时填收费卡点集数', required: true },
    { label: '内容类型', key: 'contentType', control: 'radio', options: ['正片', '片花', '预告片', '其他'], default: '正片', note: '正片 / 片花 / 预告片 / 其他', required: true },
    { label: '地区', key: 'region', control: 'yinhe-select', options: ['中国大陆', '中国台湾', '中国澳门', '美国', '韩国', '日本', '英国', '其他'], note: '下拉单选，默认中国大陆', required: true },
    { label: '语种', key: 'language', control: 'yinhe-select', options: ['中文', '英文', '日文', '韩语', '粤语', '其他'], note: '下拉单选，默认中文', required: true },
    { label: '版本', key: 'version', control: 'yinhe-select', options: ['AI仿真人', 'AI3D', 'AI2D', '真人剧'], note: '下拉单选，默认 AI仿真人', required: true },
    { label: '广电备案号', key: 'recordNo', control: 'text', note: '广电备案号', required: true }
  ],
  sohu: [
    { label: '搜狐账号', key: 'sohuAccount', control: 'sohu-account', note: '下拉单选，来自账号管理的搜狐账号', required: true },
    { label: '隐私设置', key: 'privacy', control: 'select', options: ['公开', '仅好友', '私享'], default: '私享', note: '公开 / 仅好友 / 私享 · 默认私享', required: false },
    { label: '播单类型', key: 'mediaType', control: 'select', options: ['视频', '音频'], default: '视频', note: '0 视频 / 1 音频 · 默认视频', required: true },
    { label: '横/竖版播单', key: 'orientation', control: 'select', options: ['横版播单', '竖版播单'], default: '竖版播单', note: '横版播单 / 竖版播单 · 默认竖版播单', required: false },
    { label: '升/降序排序', key: 'sortOrder', control: 'radio', options: ['升序', '降序'], default: '升序', note: '升序 / 降序 · 默认升序', required: false }
  ],
  baijiahao: {
    account: { label: '百家号', key: 'account', control: 'baijia-multi-account', note: '多选，来自账号管理的百家号账号', required: true },
    shared: [
      { label: '标签', key: 'tags', control: 'baijia-tags', note: '公用，按受众定位展示对应二级分类文案，可多选', required: true }
    ],
    perAccount: [
      { label: '备案号', key: 'recordNo', control: 'text', condRequired: 'baijia-cost30', note: '制作成本<30万元选填；≥30万元必填', required: false },
      { label: '成本配置', key: 'costConfig', control: 'upload', note: '成本配置附件，非必填', required: false },
      { label: '承诺书', key: 'commitment', control: 'upload', note: '承诺书附件，非必填', required: false },
      { label: '版权认证材料', key: 'copyrightCert', control: 'upload', note: '版权认证材料附件，非必填', required: false },
      { label: '付费类型', key: 'pay_type', control: 'baijia-pay-type', options: ['免费短剧', '广告解锁短剧', '付费短剧'], default: '免费短剧', note: '免费短剧 / 广告解锁短剧 / 付费短剧', required: true },
      { label: '收费卡点集数', key: 'freeEpisodes', control: 'baijia-free-episodes', note: '从本集开始收费；付费类型非免费短剧时必填', required: false },
      { label: '短剧付费模板', key: 'payTemplates', control: 'baijia-pay-templates', note: '来自账号管理；至少选一个并设为默认', required: true },
      { label: '收益方案', key: 'revenue', control: 'select', options: ['不设播放目标', '播放目标：前2周达20万'], default: '不设播放目标', note: '下拉单选', required: false },
      { label: '全场景展示', key: 'fullScreen', control: 'radio', options: ['是', '否'], default: '是', note: '全场景展示，默认是', required: true }
    ]
  },
  alipay: [
    { label: '渠道', key: 'channels', control: 'alipay-channel', note: '多选：生活号 / 商家小程序-麦萌短剧', required: true },
    { label: '短剧分类', key: 'programCategory', control: 'alipay-category', note: '一类 / 二类 / 三类，按投资额自动判定', required: true },
    { label: '演员片酬占比', note: '0~1', required: true },
    { label: '主演片酬占比', note: '0~1', required: true },
    { label: '广电备案号', key: 'recordNo', control: 'text', condRequired: 'alipay-record', note: '真人微短剧且制作费用≥100万、或非真人微短剧且≥30万、或商家小程序，必填', required: false },
    { label: '是否全网首轮播出', key: 'firstBroadcast', control: 'select', options: ['是', '否'], default: '是', note: '是否全网首轮播出 · 是 / 否', required: true },
    { label: '特殊申明', key: 'specialStatement', control: 'radio', options: ['无', '该剧内容由AI生成', '该剧有未成年出演'], default: '无', note: '单选，默认无', required: true },
    { label: '承诺函及完整授权链', key: 'commitmentChain', control: 'upload', note: '承诺函及完整授权链', required: true },
    { label: '版权归属证明', key: 'copyrightOwnership', control: 'upload', note: '版权归属证明，非必填', required: false },
    { label: '版权授权证明', key: 'copyrightAuth', control: 'upload', note: '版权授权证明，非必填', required: false },
    { label: '剧名变更申明', key: 'nameChangeStatement', control: 'upload', note: '剧名变更申明，非必填', required: false }
  ]
};

/* 公共字段 → 各平台字段名的映射样例（自动映射展示用） */
const PLATFORM_MAPPING = {
  oppo: [
    { f: '短剧名称', to: 'title', example: '弃少不好惹' },
    { f: '短剧简介', to: 'desc', example: '都市逆袭题材…' },
    { f: '题材分类', to: 'categories', example: '都市,重生' },
    { f: '总集数', to: 'total', example: '80' },
    { f: '封面', to: 'coverImageUrl', example: 'https://…/cover.jpg' },
    { f: '导演', to: 'director', example: '张晓' },
    { f: '演员', to: 'actors', example: '刘洋,陈默' },
    { f: '平均单集时长', to: 'avgVideoDuration', example: '2.5' },
    { f: '版权方', to: 'copyright', example: '麦芽传媒' },
    { f: '投资额', to: 'investment', example: '27.9' }
  ],
  vivo: [
    { f: '短剧名称', to: 'name', example: '弃少不好惹' },
    { f: '短剧简介', to: 'introduction', example: '都市逆袭题材…' },
    { f: '总集数', to: 'totalNum', example: '80' },
    { f: '封面', to: 'cover', example: 'https://…/cover.jpg' },
    { f: '导演', to: 'directorList', example: '["张晓"]' },
    { f: '制片人', to: 'producerList', example: '["王强"]' },
    { f: '演员', to: 'actorList', example: '["刘洋","陈默"]' },
    { f: '制作机构', to: 'productionInstitutionList', example: '["麦芽传媒"]' },
    { f: '版权方', to: 'copyrightHolderList', example: '["麦芽传媒"]' },
    { f: '制作成本', to: 'productionCost', example: '120' }
  ],
  honor: [
    { f: '短剧名称', to: 'title', example: '弃少不好惹' },
    { f: '短剧简介', to: 'synopsis', example: '都市逆袭题材…' },
    { f: '封面', to: 'coverUrl', example: 'https://…/cover.jpg' },
    { f: '题材', to: 'genres', example: '1,7' },
    { f: '总集数', to: 'episodeCount', example: '80' },
    { f: '更新状态', to: 'cpUpdateStatus', example: '1' },
    { f: '导演/制片/主演', to: 'director / producer / actors', example: '张晓,王强,刘洋' },
    { f: '制作机构/版权方', to: 'productionCompany / copyrightHolder', example: '麦芽传媒' },
    { f: '备案号', to: 'recordNo', example: '(麦芽)网微剧备字…' }
  ],
  yinhe: [
    { f: '短剧名称', to: 'album_name', example: '弃少不好惹' },
    { f: '短剧简介', to: 'album_desc', example: '都市逆袭题材…' },
    { f: '分类', to: 'genre', example: '奇幻;悬疑' },
    { f: '竖海报', to: 'album_verpic', example: 'https://…' },
    { f: '横海报', to: 'album_horpic', example: 'https://…' },
    { f: '总集数', to: 'episode_total', example: '80' },
    { f: '导演', to: 'director', example: '张晓' },
    { f: '演员', to: 'actor', example: '刘洋;陈默' },
    { f: '广电审核编号', to: 'auditNumber', example: '电审故字…' }
  ],
  sohu: [
    { f: '短剧名称', to: 'title(播单)', example: '弃少不好惹' },
    { f: '短剧简介', to: 'introduction', example: '都市逆袭题材…' },
    { f: '横版封面', to: 'coverurlNew', example: 'https://…' },
    { f: '竖版封面', to: 'coverurlNewVer', example: 'https://…' },
    { f: '版式', to: 'rotationType', example: '2(竖版)' }
  ],
  baijiahao: [
    { f: '短剧名称', to: 'title', example: '弃少不好惹' },
    { f: '短剧简介', to: 'abstract', example: '都市逆袭题材…' },
    { f: '方封面', to: 'square_image', example: '1:1' },
    { f: '横封面', to: 'width_cover', example: '16:9' },
    { f: '竖封面', to: 'high_cover', example: '3:4' },
    { f: '总集数', to: 'pay_playlet_total_num', example: '80' },
    { f: '分类', to: 'pay_playlet_sub_category', example: '男频-战神(1)' },
    { f: '导演/制片/演员', to: 'director / producer / actor', example: '张晓,王强,刘洋' },
    { f: '制作机构', to: 'organization', example: '麦芽传媒' },
    { f: '备案号', to: 'record_number', example: '(麦芽)微短剧备字…' }
  ],
  alipay: [
    { f: '短剧名称', to: 'title', example: '弃少不好惹' },
    { f: '封面', to: 'cover', example: 'file_id' },
    { f: '节目分类', to: 'program_category', example: '0(真人微短剧)' },
    { f: '版权方', to: 'copyright_holder', example: '麦芽传媒' },
    { f: '总集数', to: 'seqs_count', example: '80' },
    { f: '短剧简介', to: 'summary', example: '都市逆袭题材(≥200字)' },
    { f: '导演/编剧', to: 'director / screen_writer', example: '张晓,李明' },
    { f: '制作费用', to: 'playlet_production_cost', example: '1200000' },
    { f: '平均单集时长', to: 'avg_duration', example: '3' }
  ]
};

/* =========================================================================
   分发状态同步 —— 各平台独立状态流转（stage：状态枚举；extra：平台特有状态字段）
   每个平台状态体系不同，分发管理页按平台 Tab 展示不同状态字段。
   ========================================================================= */
const DIST_STATUS = {
  oppo: {
    stages: [
      { code: 'pending', label: '待创建', tone: 'neutral' },
      { code: 'created', label: '已创建', tone: 'info' },
      { code: 'pushing', label: '推送剧集中', tone: 'warning' },
      { code: 'pushed', label: '已推送', tone: 'info' },
      { code: 'reviewing', label: '提审中', tone: 'warning' },
      { code: 'success', label: '成功', tone: 'success' },
      { code: 'online', label: '已上架', tone: 'success' },
      { code: 'offline', label: '已下架', tone: 'neutral' },
      { code: 'failed', label: '失败', tone: 'error' }
    ],
    extra: [ { k: 'pushed', label: '已推集数' }, { k: 'reviewNo', label: '提审单号' } ]
  },
  vivo: {
    stages: [
      { code: 'pending', label: '待入库', tone: 'neutral' },
      { code: 'importing', label: '入库中', tone: 'warning' },
      { code: 'import_failed', label: '入库失败', tone: 'error' },
      { code: 'imported', label: '已入库', tone: 'info' },
      { code: 'publishing', label: '发布中', tone: 'warning' },
      { code: 'published', label: '已发布', tone: 'success' },
      { code: 'online', label: '已上架', tone: 'success' },
      { code: 'offline', label: '已下架', tone: 'neutral' }
    ],
    extra: [ { k: 'importState', label: '入库状态' }, { k: 'publishState', label: '发布状态' } ]
  },
  honor: {
    stages: [
      { code: 'pending', label: '待推剧', tone: 'neutral' },
      { code: 'pushing_album', label: '推剧中', tone: 'warning' },
      { code: 'transcoding', label: '推集转码中', tone: 'warning' },
      { code: 'compensating', label: '补偿拉取中', tone: 'info' },
      { code: 'done', label: '已完成', tone: 'success' },
      { code: 'failed', label: '失败', tone: 'error' }
    ],
    extra: [ { k: 'pushAlbum', label: '推剧状态' }, { k: 'transcode', label: '转码状态' } ]
  },
  yinhe: {
    stages: [
      { code: 'pending', label: '待建专辑', tone: 'neutral' },
      { code: 'album_created', label: '专辑已建', tone: 'info' },
      { code: 'pushing_media', label: '推介质中', tone: 'warning' },
      { code: 'transcoding', label: '转码中', tone: 'warning' },
      { code: 'online', label: '已上线', tone: 'success' },
      { code: 'failed', label: '失败', tone: 'error' }
    ],
    extra: [ { k: 'albumId', label: '专辑ID' }, { k: 'mediaState', label: '介质状态' } ]
  },
  sohu: {
    stages: [
      { code: 'pending', label: '待建播单', tone: 'neutral' },
      { code: 'playlist_created', label: '播单已建', tone: 'info' },
      { code: 'uploading', label: '上传中', tone: 'warning' },
      { code: 'submitted', label: '已提交', tone: 'success' },
      { code: 'online', label: '已上架', tone: 'success' },
      { code: 'failed', label: '失败', tone: 'error' }
    ],
    extra: [ { k: 'playlistId', label: '播单ID' }, { k: 'uploadState', label: '上传状态' } ]
  },
  baijiahao: {
    stages: [
      { code: 'pending', label: '待建壳', tone: 'neutral' },
      { code: 'shell_created', label: '壳已建', tone: 'info' },
      { code: 'uploading', label: '上传中', tone: 'warning' },
      { code: 'submitted', label: '已提交', tone: 'info' },
      { code: 'reviewing', label: '审核中', tone: 'info' },
      { code: 'approved', label: '审核通过', tone: 'success' },
      { code: 'rejected', label: '审核驳回', tone: 'error' },
      { code: 'online', label: '已上架', tone: 'success' },
      { code: 'offline', label: '已下架', tone: 'neutral' }
    ],
    extra: [ { k: 'shellId', label: '短剧壳nid' }, { k: 'uploaded', label: '已传集数' } ]
  },
  alipay: {
    stages: [
      { code: 'pending', label: '待创建', tone: 'neutral' },
      { code: 'created', label: '已创建', tone: 'info' },
      { code: 'reviewing', label: '提审中', tone: 'warning' },
      { code: 'approved', label: '审核通过', tone: 'success' },
      { code: 'rejected', label: '审核驳回', tone: 'error' },
      { code: 'published', label: '已发布', tone: 'success' },
      { code: 'offline', label: '已下架', tone: 'neutral' }
    ],
    extra: [ { k: 'lifeId', label: '生活号' }, { k: 'audit', label: '审核结果' } ]
  }
};

/* 取某平台某状态码对应的 { label, tone } */
function distStatusInfo(platform, code) {
  var meta = DIST_STATUS[platform] || {};
  var st = (meta.stages || []).find(function (s) { return s.code === code; });
  return st || { label: code, tone: 'neutral' };
}

/* 各平台「可上架/已上架」终态码（用于上下架操作） */
function isOnlineState(platform, code) {
  return code === 'online' || code === 'published' || code === 'done' || code === 'approved' || code === 'submitted';
}
function isOfflineState(platform, code) {
  return code === 'offline';
}

/* 短剧数据（统一字段模型） */
const DB = {
  dramas: [
    {
      id: 'D2026-1001', title: '弃少不好惹', project: 'R-ZR-ZZ-000463', source: 'mid',
      cover: '#14574F', category: '都市·逆袭', shortplayType: '真人短剧', tags: ['逆袭', '战神', '都市'],
      totalEpisodes: 80, updateStatus: '已完结', chargeType: '免费', audience: '男频',
      chargeEpisode: 10, debutPlatforms: ['微信小程序', '抖音小程序'], coopTypes: ['承制剧-微短剧'], highlights: '10:35, 45:20',
      launchPlatforms: ['微信小程序', '支付宝小程序', '抖音小程序'], workTags: ['真人', 'AI真人'], totalDuration: 200, orientation: '竖屏',
      synopsis: '落魄少爷陈凡遭家族与未婚妻联手构陷，被逐出豪门后隐姓埋名归隐山野，习得一身绝世医术与武艺。多年后，他以神秘医者的身份重返都市，逆袭翻盘，夺回属于自己的一切，也最终认清谁才是真心相待之人。全剧节奏明快、爽点密集，适合喜欢逆袭成长与快意恩仇的观众。',
      platforms: ['oppo', 'vivo', 'alipay', 'yinhe'], status: '已分发', completeness: 100,
      director: '张晓', producer: '王强', actors: '刘洋、陈默', copyright: '麦芽传媒',
      productionCost: '120万', investment: 120, recordNumber: '(麦芽)网微剧备字(2024)第120067号',
      avgDuration: '2.5分钟', broadcast: '全网首轮独播', firstReleaseDate: '2026-09-30', updatedAt: '2026-10-26 14:30'
    },
    {
      id: 'D2026-1002', title: '重生之千金归来', project: 'R-ZR-ZZ-000470', source: 'mid',
      cover: '#B08A4B', category: '女频·重生', shortplayType: '真人短剧', tags: ['重生', '甜宠', '女强'],
      totalEpisodes: 96, updateStatus: '已完结', chargeType: '按集付费', audience: '女频',
      chargeEpisode: 12, debutPlatforms: ['微信小程序'], coopTypes: ['承制剧-微短剧', '自制剧'], highlights: '',
      launchPlatforms: ['微信小程序'], workTags: ['真人'], totalDuration: 269, orientation: '竖屏',
      platforms: ['oppo', 'baijiahao'], status: '已分发', completeness: 100,
      director: '陈思', producer: '赵蕾', actors: '林雨、周深', copyright: '麦芽传媒',
      productionCost: '85万', investment: 85, recordNumber: '(麦芽)网微剧备字(2024)第120098号',
      avgDuration: '2.8分钟', broadcast: '全网首轮联播', firstReleaseDate: '2026-09-15', updatedAt: '2026-10-27 09:12'
    },
    {
      id: 'D2026-1003', title: '龙王殿', project: 'R-ZR-ZZ-000481', source: 'mid',
      cover: '#5E7A8F', category: '男频·战神', shortplayType: '真人短剧', tags: ['战神', '逆袭', '爽文'],
      totalEpisodes: 100, updateStatus: '更新中', chargeType: '按集付费', audience: '男频',
      chargeEpisode: 15, debutPlatforms: ['VIVO端原生', '荣耀端原生'], coopTypes: ['自制剧'], highlights: '20:15, 60:30',
      launchPlatforms: ['VIVO端原生', '荣耀端原生'], workTags: ['真人', '效率剧'], totalDuration: 300, orientation: '竖屏',
      platforms: ['vivo', 'honor'], status: '已分发', completeness: 92,
      director: '李政', producer: '郑昊', actors: '韩东、吴霜', copyright: '麦芽传媒',
      productionCost: '150万', investment: 350, recordNumber: '(麦芽)网微剧备字(2024)第121345号',
      avgDuration: '3分钟', broadcast: '非首轮播出', firstReleaseDate: '2026-10-01', updatedAt: '2026-10-27 18:44'
    },
    {
      id: 'D2026-1004', title: '闪婚老公是大佬', project: 'R-ZR-ZZ-000495', source: 'mid',
      cover: '#14574F', category: '都市·甜宠', shortplayType: '真人短剧', tags: ['甜宠', '都市', '总裁'],
      totalEpisodes: 72, updateStatus: '更新中', chargeType: '广告解锁', audience: '女频',
      chargeEpisode: 8, debutPlatforms: ['微信小程序', '支付宝小程序'], coopTypes: ['承制剧-数字营销中心'], highlights: '',
      launchPlatforms: ['微信小程序', '支付宝生活号'], workTags: ['真人', 'MCN'], totalDuration: 187, orientation: '横屏',
      platforms: [], status: '已完善', completeness: 88,
      director: '周静', producer: '孙琪', actors: '王悦、徐峰', copyright: '麦芽传媒',
      productionCost: '68万', investment: 68, recordNumber: null, avgDuration: '2.6分钟', broadcast: '全网首轮独播', firstReleaseDate: '2026-09-20', updatedAt: '2026-10-28 08:20'
    },
    {
      id: 'D2026-1005', title: '凤临天下', project: 'R-ZR-ZZ-000509', source: 'mid',
      cover: '#A06B5C', category: '古言·权谋', shortplayType: '真人短剧', tags: ['古言', '权谋', '大女主'],
      totalEpisodes: 60, updateStatus: '已完结', chargeType: '免费', audience: '女频',
      chargeEpisode: 6, debutPlatforms: ['搜狐端原生'], coopTypes: ['承制剧-微短剧'], highlights: '15:05, 40:30',
      launchPlatforms: ['搜狐端原生'], workTags: ['真人'], totalDuration: 144, orientation: '竖屏',
      platforms: ['yinhe', 'sohu'], status: '已分发', completeness: 81,
      director: '吴雪', producer: '冯瑾', actors: '宋锦、陆离', copyright: '麦芽传媒',
      productionCost: '95万', investment: 95, recordNumber: '(麦芽)网微剧备字(2024)第120200号',
      avgDuration: '2.4分钟', broadcast: '全网首轮联播', firstReleaseDate: '2026-08-28', updatedAt: '2026-10-25 11:02'
    },
    {
      id: 'D2026-1006', title: '重生后我成了学霸', project: 'R-ZR-ZZ-000518', source: 'mid',
      cover: '#3A7D52', category: '校园·逆袭', shortplayType: '真人短剧', tags: ['校园', '逆袭', '重生'],
      totalEpisodes: 88, updateStatus: '更新中', chargeType: '按集付费', audience: '通用',
      chargeEpisode: 20, debutPlatforms: [], coopTypes: ['自制剧'], highlights: '',
      launchPlatforms: [], workTags: ['小说解说'], totalDuration: 220, orientation: '竖屏',
      platforms: [], status: '待完善', completeness: 45,
      director: '许晨', producer: '何静', actors: '顾言、苏芮', copyright: '麦芽传媒',
      productionCost: null, investment: 0, recordNumber: null, avgDuration: null, broadcast: '全网首轮独播', firstReleaseDate: '2026-10-10', updatedAt: '2026-10-23 16:40'
    },
    {
      id: 'D2026-1007', title: '悬崖边的爱', project: 'R-ZR-ZZ-000529', source: 'mid',
      cover: '#4A6E88', category: '悬疑', shortplayType: '真人短剧', tags: ['悬疑', '情感'],
      totalEpisodes: 48, updateStatus: '已完结', chargeType: '广告解锁', audience: '通用',
      chargeEpisode: 5, debutPlatforms: ['搜狐端原生', '银河端原生'], coopTypes: ['外部剧', '外部承制剧-承制'], highlights: '12:00',
      launchPlatforms: ['搜狐端原生', '银河端原生'], workTags: ['真人', '批量剧'], totalDuration: 149, orientation: '横屏',
      platforms: ['sohu'], status: '已分发', completeness: 76,
      director: '高远', producer: '程琳', actors: '白露、江南', copyright: '麦芽传媒',
      productionCost: '55万', investment: 55, recordNumber: null, avgDuration: '3.1分钟', broadcast: '非首轮播出', firstReleaseDate: '2026-09-05', updatedAt: '2026-10-22 10:15'
    },
    {
      id: 'D2026-1008', title: '神医归来', project: 'R-ZR-ZZ-000540', source: 'manual',
      cover: '#B08A4B', category: '男频·神医', shortplayType: 'AI漫剧', tags: ['神医', '爽文', 'AI'],
      totalEpisodes: 64, updateStatus: '更新中', chargeType: '免费', audience: '男频',
      chargeEpisode: 9, debutPlatforms: [], coopTypes: ['外部承制剧-小说'], highlights: '',
      launchPlatforms: [], workTags: ['效率剧', '漫剧', 'AI真人'], totalDuration: 141, orientation: '竖屏',
      platforms: [], status: '待完善', completeness: 38,
      director: '—', producer: '罗丹', actors: '配音:周杨', copyright: '麦芽传媒',
      productionCost: '32万', investment: 32, recordNumber: null, avgDuration: '2.2分钟', broadcast: '全网首轮独播', firstReleaseDate: '2026-08-18', updatedAt: '2026-10-21 20:30'
    }
  ],

  /* 全部剧集（全局媒资清单，仅存文件级字段；剧集标题与归属在 episodeLinks 关联表维护） */
  episodes: [
    { id: 'E1001-01', seq: 1, cover: '#CFE0DA', fileName: '弃少不好惹-第1集.mp4', duration: 150, size: '28.4MB', width: 720, height: 1280, definition: '720P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1001-02', seq: 2, cover: '#CFE0DA', fileName: '弃少不好惹-第2集.mp4', duration: 148, size: '27.9MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1001-03', seq: 3, cover: '#CFE0DA', fileName: '弃少不好惹-第3集.mp4', duration: 152, size: '29.1MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1001-04', seq: 4, cover: '#CFE0DA', fileName: '弃少不好惹-第4集.mp4', duration: 146, size: '28.0MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1001-05', seq: 5, cover: '#CFE0DA', fileName: '弃少不好惹-第5集.mp4', duration: 155, size: '30.2MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1002-01', seq: 1, cover: '#E8D5B5', fileName: '重生之千金归来-第1集.mp4', duration: 162, size: '31.5MB', width: 720, height: 1280, definition: '4K', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1002-02', seq: 2, cover: '#E8D5B5', fileName: '重生之千金归来-第2集.mp4', duration: 158, size: '30.8MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行中', videoStatus: '启用' },
    { id: 'E1002-03', seq: 3, cover: '#E8D5B5', fileName: '重生之千金归来-第3集.mp4', duration: 160, size: '31.2MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1003-01', seq: 1, cover: '#CBD6DF', fileName: '龙王殿-第1集.mp4', duration: 170, size: '35.0MB', width: 720, height: 1280, definition: '2K', orientation: '竖视频', charge: true, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1003-02', seq: 2, cover: '#CBD6DF', fileName: '龙王殿-第2集.mp4', duration: 168, size: '34.6MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1003-03', seq: 3, cover: '#CBD6DF', fileName: '龙王殿-第3集.mp4', duration: 172, size: '35.4MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '执行中', videoStatus: '禁用' },
    { id: 'E1004-01', seq: 1, cover: '#CFE0DA', fileName: '闪婚老公是大佬-第1集.mp4', duration: 154, size: '29.6MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1004-02', seq: 2, cover: '#CFE0DA', fileName: '闪婚老公是大佬-第2集.mp4', duration: 156, size: '30.0MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '执行失败', videoStatus: '禁用' },
    { id: 'E1005-01', seq: 1, cover: '#E6D2C0', fileName: '凤临天下-第1集.mp4', duration: 144, size: '27.5MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E1005-02', seq: 2, cover: '#E6D2C0', fileName: '凤临天下-第2集.mp4', duration: 146, size: '28.2MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '启用' },
    { id: 'E0001-01', seq: 1, cover: '#D9E4E0', fileName: '都市风云-第1集.mp4', duration: 155, size: '30.1MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '超时', videoStatus: '启用' },
    { id: 'E0001-02', seq: 2, cover: '#D9E4E0', fileName: '都市风云-第2集.mp4', duration: 153, size: '29.7MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: false, transcode: '执行成功', videoStatus: '禁用' },
    { id: 'E0002-01', seq: 1, cover: '#E0D3C0', fileName: '快剑恩仇-第1集.mp4', duration: 161, size: '32.0MB', width: 720, height: 1280, definition: '1080P', orientation: '竖视频', charge: true, transcode: '取消', videoStatus: '启用' }
  ],

  /* 短剧 ↔ 剧集 关联关系（多对多：同一剧集可被多个短剧关联；
     title / seq 为该剧集「在某短剧下」的标题与集数） */
  episodeLinks: [
    { dramaId: 'D2026-1001', episodeId: 'E1001-01', seq: 1, title: '弃少华丽归来', description: '弃少回归家族，开启逆袭之路。' },
    { dramaId: 'D2026-1001', episodeId: 'E1001-02', seq: 2, title: '逆袭第一步', description: '男主初露锋芒，赢得第一场较量。' },
    { dramaId: 'D2026-1001', episodeId: 'E1001-03', seq: 3, title: '商场风云', description: '商战升级，多方势力暗流涌动。' },
    { dramaId: 'D2026-1001', episodeId: 'E1001-04', seq: 4, title: '暗中布局', description: '男主暗中布局，反击旧敌。' },
    { dramaId: 'D2026-1001', episodeId: 'E1001-05', seq: 5, title: '首次交锋', description: '与宿敌首次正面交锋。' },
    { dramaId: 'D2026-1002', episodeId: 'E1002-01', seq: 1, title: '重生归来' },
    { dramaId: 'D2026-1002', episodeId: 'E1002-02', seq: 2, title: '逆袭复仇' },
    { dramaId: 'D2026-1002', episodeId: 'E1002-03', seq: 3, title: '身份揭晓' },
    { dramaId: 'D2026-1003', episodeId: 'E1003-01', seq: 1, title: '龙王归来' },
    { dramaId: 'D2026-1003', episodeId: 'E1003-02', seq: 2, title: '战神之怒' },
    { dramaId: 'D2026-1003', episodeId: 'E1003-03', seq: 3, title: '王者降临' },
    { dramaId: 'D2026-1004', episodeId: 'E1004-01', seq: 1, title: '闪婚约定' },
    { dramaId: 'D2026-1004', episodeId: 'E1004-02', seq: 2, title: '隐藏大佬' },
    { dramaId: 'D2026-1005', episodeId: 'E1005-01', seq: 1, title: '凤临天下' },
    { dramaId: 'D2026-1005', episodeId: 'E1005-02', seq: 2, title: '权谋初现' },
    { dramaId: 'D2026-1004', episodeId: 'E1001-01', seq: 1, title: '闪婚老公是大佬第1集' }
  ],

  /* 各平台账号（账号管理）：alipay / sohu / baijiahao（百家号含付费模板配置） */
  accounts: {
    alipay: [
      { id: 'AL-001', name: '麦芽短剧生活号', type: '生活号', appid: '2021099168950123', lifeId: '6228001234567', status: '启用', createdAt: '2026-11-02 10:12:30' },
      { id: 'AL-002', name: '麦芽漫剧生活号', type: '生活号', appid: '2021099168950789', lifeId: '', status: '禁用', createdAt: '2026-10-28 15:40:05' }
    ],
    sohu: [
      { id: 'SH-001', name: '麦秀短剧', uid: '44541843', passport: 'maixiu@sohu.com', status: '启用', createdAt: '2026-11-04 09:15:22' },
      { id: 'SH-002', name: '麦芽小剧场', uid: '44541901', passport: 'maiya@sohu.com', status: '禁用', createdAt: '2026-10-29 14:03:41' }
    ],
    baijiahao: [
      { id: 'BJ-001', name: '麦芽剧集', accountId: '1835872414223020', secret: '51fafasa21c80c9e', status: '启用', templateEnabled: true, createdAt: '2026-10-30 09:00:00',
        templates: [ { name: '模板1', templateId: 'tmpl_1001', playletPayType: '现金' } ] },
      { id: 'BJ-002', name: '麦芽漫剧号', accountId: '1835872414223099', secret: '03ab214929D8191f', status: '启用', templateEnabled: false, createdAt: '2026-10-25 16:20:18',
        templates: [ { name: '模板1', templateId: 'tmpl_2001', playletPayType: '剧豆' }, { name: '模板2', templateId: 'tmpl_2002', playletPayType: '现金' } ] }
    ]
  },

  /* 分发记录：一份短剧 × 一个平台 = 一条记录。status 为该平台流转码，extra 为平台特有状态字段 */
  distributionRecords: [
    { id: 'DR-9001', dramaId: 'D2026-1001', platform: 'oppo', status: 'success', oppoTitle: '弃少不好惹·剧场版', oppoSpid: 'OP-882371', extra: { pushed: '80 / 80', reviewNo: 'OPPO-20261101-008', dramaType: '普通短剧', jumpLink: '', premiereStatus: '全网首轮独播', isTransfer: '是', copyrightExpiry: '2027-09-30T00:00', onlineStatus: '上架' }, submittedAt: '2026-10-26 14:32', updatedAt: '2026-11-01 09:20' },
    { id: 'DR-9002', dramaId: 'D2026-1001', platform: 'vivo', status: 'publishing', extra: { importState: '已入库', publishState: '发布中' }, submittedAt: '2026-10-27 09:05', updatedAt: '2026-11-02 11:40' },
    { id: 'DR-9003', dramaId: 'D2026-1001', platform: 'alipay', status: 'reviewing', extra: { lifeId: '麦芽短剧生活号', audit: '一审中' }, submittedAt: '2026-10-27 10:22', updatedAt: '2026-11-03 15:18' },
    { id: 'DR-9004', dramaId: 'D2026-1001', platform: 'yinhe', status: 'transcoding', extra: { albumId: 'YH-1024', mediaState: '第 60/80 集转码中' }, submittedAt: '2026-10-28 08:50', updatedAt: '2026-11-04 16:02' },
    { id: 'DR-9005', dramaId: 'D2026-1002', platform: 'oppo', status: 'failed', oppoTitle: '千金归来（重生）', oppoSpid: 'OP-882502', extra: { pushed: '96 / 96', reviewNo: 'OPPO-20261102-021', dramaType: '快应用短剧', jumpLink: 'https://oppo.example.com/p/882502', premiereStatus: '全网首轮联播', isTransfer: '是', copyrightExpiry: '2027-05-20T00:00', onlineStatus: '下架' }, submittedAt: '2026-10-27 09:12', updatedAt: '2026-11-02 10:05' },
    { id: 'DR-9006', dramaId: 'D2026-1002', platform: 'baijiahao', status: 'online', extra: { shellId: 'BJ-8831', uploaded: '96 / 96' }, submittedAt: '2026-10-28 13:17', updatedAt: '2026-11-01 14:30' },
    { id: 'DR-9007', dramaId: 'D2026-1003', platform: 'vivo', status: 'online', extra: { importState: '已入库', publishState: '已上架' }, submittedAt: '2026-10-28 15:44', updatedAt: '2026-11-02 09:12' },
    { id: 'DR-9008', dramaId: 'D2026-1003', platform: 'honor', status: 'transcoding', extra: { pushAlbum: '推剧完成', transcode: '第 80/100 集' }, submittedAt: '2026-10-29 07:31', updatedAt: '2026-11-04 10:48' },
    { id: 'DR-9009', dramaId: 'D2026-1005', platform: 'yinhe', status: 'online', extra: { albumId: 'YH-1051', mediaState: '全部转码完成' }, submittedAt: '2026-10-25 11:02', updatedAt: '2026-10-30 08:15' },
    { id: 'DR-9010', dramaId: 'D2026-1005', platform: 'sohu', status: 'online', extra: { playlistId: 'SH-2204', uploadState: '上传完成' }, submittedAt: '2026-10-26 09:33', updatedAt: '2026-10-31 13:50' },
    { id: 'DR-9011', dramaId: 'D2026-1007', platform: 'sohu', status: 'failed', extra: { playlistId: 'SH-2218', uploadState: '第 12 集上传失败' }, submittedAt: '2026-10-22 10:15', updatedAt: '2026-10-23 17:02' },
    { id: 'DR-9012', dramaId: 'D2026-1004', platform: 'oppo', status: 'failed', oppoTitle: '我的大佬老公', oppoSpid: 'OP-882903', extra: { pushed: '待推送', reviewNo: '—', dramaType: '普通短剧', jumpLink: '', premiereStatus: '非首轮播出', isTransfer: '否', copyrightExpiry: '2027-01-15T00:00', onlineStatus: '上架' }, submittedAt: '2026-11-05 09:00', updatedAt: '2026-11-05 09:00' },
    { id: 'DR-9013', dramaId: 'D2026-1001', platform: 'oppo', status: 'reviewing', oppoTitle: '弃少不好惹·快看版', oppoSpid: 'OP-882455', extra: { pushed: '40 / 80', reviewNo: 'OPPO-20261110-033', dramaType: '快应用短剧', jumpLink: 'https://oppo.example.com/p/882455', premiereStatus: '非首轮播出', isTransfer: '否', copyrightExpiry: '2027-09-30T00:00', onlineStatus: '上架' }, submittedAt: '2026-11-09 16:20', updatedAt: '2026-11-10 10:08' }
  ]
};

/* 字段分组（用于新建短剧向导与 PRD 对齐） */
const FIELD_GROUPS = [
  { key: 'basic',   title: '基础信息', desc: '各平台均需的剧级元数据', icon: 'info' },
  { key: 'making',  title: '制作信息', desc: '主创团队、成本与版权', icon: 'users' },
  { key: 'license', title: '备案与版权', desc: '备案号与版权材料（付费/高成本更严格）', icon: 'shield-check' },
  { key: 'episode', title: '关联剧集', desc: '从系统剧集池勾选并关联，统一剧集字段', icon: 'film' }
];

/* 关联短剧查询（供剧集页 / 新增剧集页使用） */
function dramaById(id) {
  return DB.dramas.find(function (d) { return d.id === id; });
}

/* 某条分发记录的「平台侧短剧名称」：模板复用，OPPO 等支持改名时用独立名。
   每次分发都是一次新的平台剧，故这里读记录自身的名称而非模板名 */
function recordPlatformTitle(r) {
  if (!r) return '';
  if (r.platform === 'oppo' && r.oppoTitle) return r.oppoTitle;
  var d = dramaById(r.dramaId);
  return d ? d.title : '';
}

/* 某条分发记录的「平台侧短剧 ID / 外部标识」 */
function recordPlatformRef(r) {
  if (!r) return '';
  var ex = r.extra || {};
  switch (r.platform) {
    case 'oppo': return r.oppoSpid || '';
    case 'yinhe': return ex.albumId || '';
    case 'sohu': return ex.playlistId || '';
    case 'baijiahao': return ex.shellId || '';
    case 'alipay': return ex.lifeId || '';
    default: return '';
  }
}

/* 剧集媒资查询 */
function episodeById(id) {
  return DB.episodes.find(function (e) { return e.id === id; });
}

/* 某短剧下的关联关系（按集数升序） */
function linksForDrama(dramaId) {
  return DB.episodeLinks
    .filter(function (l) { return l.dramaId === dramaId; })
    .sort(function (a, b) { return a.seq - b.seq; });
}

/* 某剧集被哪些短剧关联（返回 dramaId 数组，可空） */
function dramasForEpisode(episodeId) {
  return DB.episodeLinks
    .filter(function (l) { return l.episodeId === episodeId; })
    .map(function (l) { return l.dramaId; });
}

/* 查询某短剧与某剧集的关联关系（可能不存在） */
function linkFor(dramaId, episodeId) {
  return DB.episodeLinks.find(function (l) { return l.dramaId === dramaId && l.episodeId === episodeId; });
}