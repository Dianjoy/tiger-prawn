/**
 * Created by meathill on 14/11/16.
 */
'use strict';
(function (ns) {
  ns.Stat = Backbone.Router.extend({
    $body: null,
    routes: {
      'stat(/)': 'showStat',
      'stat/:id': 'showADStat',
      'stat/:id/:date': 'showADStatDate',

      'invoice/': 'showInvoice',
      'invoice/detail/(:id)':'invoiceDetail',
      'invoice/apply/:start/:end/*ids': 'applyInvoice',
      'invoice/reapply/:id': 'reapplyInvoice',
      'invoice/view/:id': 'viewInvoice',

      'stat/analyse/': 'showAdminADStat',
      'stat/analyse/daily/:id/:start/:end': 'showDailyADStat'
    },
    showADStat: function (id) {
      var model = new tp.model.AD({
        id: id
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
        fresh: true,
        className: 'stat stat-date'
      });
      this.$body.setFramework('has-date-range', '单个广告一天内统计');
    },
    showStat: function () {
      this.$body.load('page/stat/list.html');
      this.$body.setFramework('has-date-range', '广告统计');
    },

    showInvoice: function () {
      this.$body.load('page/stat/invoice.html');
      this.$body.setFramework('has-date-range', '发票统计');
    },
    invoiceDetail: function (id) {
      var model = new tp.model.InvoiceDetail({
        id: id
      });
      this.$body
        .load('page/stat/invoice-detail.hbs',model, {
          className: 'invoice-detail',
          loader: tp.page.InvoiceEditor,
          fresh: true
        })
        .setFramework('invoice-detail', '发票开具申请单');
    },
    applyInvoice: function (start,end,ids) {
      var model = new tp.model.InvoiceDetail({
        init: true,
        start: start,
        end: end,
        ids: ids
      });
      this.$body
        .load('page/stat/invoice-detail.hbs',model, {
          className: 'invoice-apply',
          loader: tp.page.InvoiceEditor
        })
        .setFramework('invoice-apply', '发票开具申请单');
    },
    reapplyInvoice: function (id) {
      var model = new tp.model.InvoiceDetail({
        id: id,
        isReapply: true,
        init: true
      });
      this.$body
        .load('page/stat/invoice-detail.hbs',model, {
          className: 'invoice-reapply',
          loader: tp.page.InvoiceEditor
        })
        .setFramework('invoice-reapply', '重新申请');
    },
    viewInvoice: function (id) {
      var model = new tp.model.InvoiceDetail({
        id: id,
        view: true
      });
      this.$body
        .load('page/stat/invoice-detail.hbs',model,{
          className: 'invoice-view',
          loader: tp.page.InvoiceEditor
        })
        .setFramework('invoice-view', '发票详情');
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