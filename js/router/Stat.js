/**
 * Created by meathill on 14/11/16.
 */
'use strict';
(function (ns) {
  ns.Stat = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'stat/(:ad_type)': 'showStat',
      'stat/ad_type/:id/:start/:end': 'showADStat',
      'stat/:id/:date': 'showADStatDate',
      'invoice/': 'showInvoice',
      'invoice/:id': 'invoiceDetail',
      'invoice/apply/:channel/:ids': 'applyInvoice',
      'stat/analyse/': 'showAdminADStat',
      'stat/analyse/daily/:id/:start/:end': 'showDailyADStat'
    },
    showADStat: function (id, start, end) {
      var model = new tp.model.AD({
        id: id,
        start: start,
        end: end
      });
      this.$body.load('page/stat/daily.hbs', model, {
        className: 'stat stat-ad'
      });
      this.$body.setFramework('has-date-range', '单个广告按日期统计');
    },
    showADStatDate: function (id, date) {
      if (this.$body.page && this.$body.page.$el.is('.stat.stat-date')) {
        this.$body.page.model.set('date', date);
      }
      var model = new tp.model.AD({
        id: id,
        date: date
      });
      this.$body.load('page/stat/hourly.hbs', model, {
        refresh: true,
        className: 'stat stat-date'
      });
      this.$body.setFramework('has-date-range', '单个广告一天内统计');
    },
    showStat: function (ad_type) {
      var page = this.$me.isCP() ? '_cp.html' : '.hbs';
      var obj = {
        API: tp.API,
        ad_type: ad_type,
        start: moment().startOf('month').format(moment.DATE_FORMAT),
        end: moment().format(moment.DATE_FORMAT),
        is_android: ad_type === 'android'
      };
      this.$body.load('page/stat/list' + page, this.$me.isCP() ? null : obj);
      this.$body.setFramework('has-date-range stat ' + (this.$me.isCP() ? 'stat-cp' : ad_type + '-stat'), '投放结果统计');
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
      this.$body
        .load('page/stat/apply-invoice-detail.hbs', model, {
          className: 'invoice-apply',
          loader: tp.page.InvoiceEditor
        })
        .setFramework('invoice invoice-apply', '发票开具申请单');
    },
    showAdminADStat: function () {
      this.$body.load('page/stat/analyse.hbs', {
        start: moment().startOf('month').format(moment.DATE_FORMAT),
        end: moment().format(moment.DATE_FORMAT),
        API: tp.API
      });
      this.$body.setFramework('has-date-range daily', '广告数据分析');
    },
    showDailyADStat: function (id, start, end) {
      end = end || moment().format(moment.DATE_FORMAT);
      start = start || moment().startOf('month').format(moment.DATE_FORMAT);
      this.$body.load('page/stat/analyse-daily.hbs', {id: id, start: start, end: end, API: tp.API});
      this.$body.setFramework('has-date-range daily-ad', '广告统计/广告数据分析');
    }
  });
}(Nervenet.createNameSpace('tp.router')));