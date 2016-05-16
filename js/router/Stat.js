/**
 * Created by meathill on 14/11/16.
 */
'use strict';
(function (ns) {
  ns.Stat = Backbone.Router.extend({
    $body: null,
    $me: null,
    $context: null,
    routes: {
      'stat/(:ad_type)': 'showStat',
      'stat/:id/:start/:end': 'showADStat',
      'stat/:id/:date': 'showADStatDate',
      'stat-dj/(:adType)': 'showDianjoyStat',
      'invoice/': 'showInvoice',
      'invoice/:id': 'invoiceDetail',
      'invoice/apply/:channel/:ids': 'applyInvoice',
      'stat/analyse/': 'showAdminADStat',
      'stat/analyse/:start/:end': 'showAdminADStatTime',
      'stat/analyse/daily/:id/:start/:end': 'showDailyADStat'
    },
    showADStat: function (id, start, end) {
      var page = this.$me.isCP() ? '_cp' : ''
        , model = new tp.model.AD({
          API: tp.API,
          id: id,
          start: start,
          end: end
        }, { simple: true });
      this.$body.load('page/stat/daily' + page + '.hbs', model, {
        className: 'stat stat-ad'
      });
      this.$body.setFramework('has-date-range', '单个广告按日期统计');
    },
    showADStatDate: function (id, date) {
      if (this.$body.page && this.$body.page.$el.is('.stat.stat-date')) {
        this.$body.page.model.set('date', date);
      }
      var page = this.$me.isCP() ? '_cp' : ''
        , model = new tp.model.AD({
          API: tp.API,
          id: id,
          date: date
        });
      this.$body.load('page/stat/hourly' + page + '.hbs', model, {
        refresh: true,
        className: 'stat stat-date'
      });
      this.$body.setFramework('stat-ad-date', '单个广告一天内统计');
    },
    showStat: function (ad_type) {
      var page = this.$me.isCP() ? '_cp' : ''
        , range = moment.createRange(null, null, true)
        , obj = _.extend(range, {
          API: tp.API,
          ad_type: ad_type,
          is_android: ad_type === 'android'
        });
      this.$body.load('page/stat/list' + page + '.hbs', obj);
      this.$body.setFramework('has-date-range stat ' + (this.$me.isCP() ? 'stat-cp' : ad_type + '-stat'), '我的投放效果');
    },
    showDianjoyStat: function (adType) {
      var range = moment.createRange(null, null, true)
        , obj = _.extend(range, {
          API: tp.API,
          ad_type: adType,
          isDianjoy: true
        });
      this.$body.load('page/stat/list_cp.hbs', obj);
      this.$body.setFramework('has-date-range stat-dj', '点乐投放效果');
    },
    showInvoice: function () {
      this.$body.load('page/stat/invoice.html');
      this.$body.setFramework('has-date-range', '我的发票');
    },
    invoiceDetail: function (id) {
      var model = new tp.model.InvoiceDetail({
        id: id
      });
      this.$body
        .load('page/stat/invoice-detail.hbs', model, {
          className: 'invoice-detail',
          loader: tp.page.InvoiceEditor,
          refresh: true
        })
        .setFramework('invoice invoice-detail', '发票开具申请单');
    },
    applyInvoice: function (channel, ids) {
      var model = new tp.model.InvoiceDetail({
        init: true,
        channel: channel,
        ids: ids
      });
      this.$context.mapValue('invoiceDetail', model, true);
      this.$body
        .load('page/stat/apply-invoice-detail.hbs', model, {
          className: 'invoice-apply',
          loader: tp.page.InvoiceEditor
        })
        .setFramework('invoice invoice-apply', '发票开具申请单');
    },
    showAdminADStat: function () {
      var range = moment.createRange(null, null, true);
      range.API = tp.API;
      this.$body.load('page/stat/analyse.hbs', range);
      this.$body.setFramework('has-date-range daily', '广告数据分析');
    },
    showAdminADStatTime: function (start, end) {
      this.$body.load('page/stat/analyse.hbs', {
        start: start,
        end: end,
        API: tp.API
      });
      this.$body.setFramework('has-date-range daily', '广告数据分析');
    },
    showDailyADStat: function (id, start, end) {
      var range = moment.createRange(start, end);
      range = _.extend(range, {
        id: id,
        API: tp.API
      });
      this.$body.load('page/stat/analyse-daily.hbs', range);
      this.$body.setFramework('has-date-range daily-ad', '广告统计/广告数据分析');
    }
  });
}(Nervenet.createNameSpace('tp.router')));