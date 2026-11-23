/* =========================================================================
   api.js —— API 桩层（前端未来接后端的唯一接缝）
   签名/耗时/加载态对齐真实后端；替换实现只需改本文件内部。
   ========================================================================= */

function delay(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

const API = {
  /* 短剧列表
     TODO: replace with GET /shortplay/library?page=&kw=&platform=
     response: { code, data: Drama[], total } */
  async fetchDramaList({ page = 1, pageSize = 8, kw = '', platform = '' } = {}) {
    await delay(420);
    let list = DB.dramas.slice();
    if (kw) {
      list = list.filter(function (d) { return d.title.indexOf(kw) > -1 || d.id.indexOf(kw) > -1; });
    }
    if (platform === '__none__') {
      list = list.filter(function (d) { return !d.platforms.length; });
    } else if (platform) {
      list = list.filter(function (d) { return d.platforms.indexOf(platform) > -1; });
    }
    return { code: 0, data: list, total: list.length };
  },

  /* 短剧详情
     TODO: replace with GET /shortplay/library/:id */
  async fetchDrama(id) {
    await delay(320);
    const d = DB.dramas.find(function (x) { return x.id === id; });
    return { code: 0, data: d || null };
  },

  /* 创建/更新短剧（统一字段模型）
     TODO: replace with POST /shortplay/library  body: UnifiedDrama */
  async saveDrama(payload) {
    await delay(520);
    return { code: 0, data: { id: payload.id || 'D2026-10' + Math.floor(1000 + Math.random() * 9000) } };
  },

  /* 剧集列表
     TODO: replace with GET /shortplay/:id/episodes */
  async fetchEpisodes(dramaId) {
    await delay(380);
    return { code: 0, data: DB.episodes.slice(), total: DB.episodes.length };
  },

  /* 保存剧集
     TODO: replace with POST /shortplay/:id/episodes  body: Episode[] */
  async saveEpisodes(dramaId, episodes) {
    await delay(480);
    return { code: 0, data: episodes.length };
  },

  /* 一键分发（平台路由 + 字段映射）
     TODO: replace with POST /shortplay/:id/distribute  body: { platformKeys: string[] } */
  async distribute(dramaId, platformKeys) {
    await delay(680);
    return { code: 0, data: { dramaId, targets: platformKeys.length, submittedAt: '2026-10-28 16:52' } };
  },

  /* 分发状态
     TODO: replace with GET /shortplay/:id/distribute/status */
  async fetchDistributionStatus(dramaId) {
    await delay(300);
    return { code: 0, data: DB.dramas.find(function (d) { return d.id === dramaId; }) || null };
  },

  /* 分发记录列表（分发状态同步）
     TODO: replace with GET /distribution/records?platform=&status=&kw=
     response: { code, data: DistributionRecord[], total } */
  async fetchDistributionRecords({ platform = '', status = '', kw = '', page = 1, pageSize = 20 } = {}) {
    await delay(420);
    let list = (DB.distributionRecords || []).slice();
    if (platform) list = list.filter(function (r) { return r.platform === platform; });
    if (status) list = list.filter(function (r) { return r.status === status; });
    if (kw) {
      list = list.filter(function (r) {
        var d = dramaById(r.dramaId);
        return d && (d.title.indexOf(kw) > -1 || d.id.indexOf(kw) > -1);
      });
    }
    // 按更新时间倒序
    list = list.sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
    return { code: 0, data: list, total: list.length };
  },

  /* 重新推送：把该平台分发记录从「失败/驳回」重置为重新提交流转首个状态
     TODO: replace with POST /distribution/:id/resubmit */
  async resubmitDistribution(recordId) {
    await delay(560);
    var r = (DB.distributionRecords || []).find(function (x) { return x.id === recordId; });
    if (!r) return { code: 1, msg: '记录不存在' };
    var now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    var stages = (DIST_STATUS[r.platform] || {}).stages || [];
    var first = stages.length ? stages[0] : null;
    r.status = first ? first.code : 'pending';
    r.updatedAt = now;
    return { code: 0, data: r };
  },

  /* 上下架：切换上线终端态与下线态
     TODO: replace with POST /distribution/:id/online  body: { online: boolean } */
  async toggleDistributionOnline(recordId) {
    await delay(480);
    var r = (DB.distributionRecords || []).find(function (x) { return x.id === recordId; });
    if (!r) return { code: 1, msg: '记录不存在' };
    var now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    if (isOnlineState(r.platform, r.status)) {
      r.status = 'offline';
      r.updatedAt = now;
      return { code: 0, data: r, action: 'offline' };
    }
    if (isOfflineState(r.platform, r.status)) {
      // 上架回到各平台「已上架/已发布」终态
      var online = { oppo: 'online', vivo: 'online', honor: 'done', yinhe: 'online', sohu: 'online', baijiahao: 'online', alipay: 'published' }[r.platform] || 'online';
      r.status = online;
      r.updatedAt = now;
      return { code: 0, data: r, action: 'online' };
    }
    return { code: 1, msg: '当前状态不可上下架' };
  }
};