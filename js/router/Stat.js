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

      'receipt/': 'showReceipt',
      'receipt/detail/(:id)':'receiptDetail',
      'receipt/apply/:ad_with_agreement/:start/:end/:channel/:agreement/*ids': 'applyReceipt',
      'receipt/reapply/:receipt_id': 'reapplyReceipt',
      'receipt/view/:id': 'viewReceipt',

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

    showReceipt: function () {
      this.$body.load('page/stat/receipt.html');
      this.$body.setFramework('has-date-range', '发票统计');
    },
    receiptDetail: function (id) {
      var model = new tp.model.ReceiptDetail({
        id: id
      });
      this.$body
        .load('page/stat/new-receipt-detail.hbs',model, {
          className: 'stat stat-detail',
          loader: tp.page.ReceiptEditor,
          fresh: true
        })
        .setFramework('stat stat-detail', '发票开具申请单');
    },
    applyReceipt: function (ad_with_agreement,start,end,channel,agreement,ids) {
      var model = new tp.model.ReceiptDetail({
        ad_with_agreement:ad_with_agreement,
        start:start,
        end:end,
        channel_id:channel,
        agreement_id:agreement,
        ids: ids
      });
      this.$body
        .load('page/stat/new-receipt-detail.hbs',model, {
          className: 'stat stat-apply',
          loader: tp.page.ReceiptEditor
        })
        .setFramework('stat stat-apply', '发票开具申请单');
    },
    reapplyReceipt: function (receipt_id) {
      var model = new tp.model.ReceiptDetail({
        invoice_id: receipt_id,
        isReapply: true,
        init:true
      });
      this.$body
        .load('page/stat/new-receipt-detail.hbs',model, {
          className: 'stat stat-reapply',
          loader: tp.page.ReceiptEditor
        })
        .setFramework('stat stat-reapply', '重新申请');
    },
    viewReceipt: function (id) {
      var model = new tp.model.ReceiptDetail({
        id: id,
        view: true
      });
      this.$body
        .load('page/stat/new-receipt-detail.hbs',model,{
          className: 'stat stat-view',
          loader: tp.page.ReceiptEditor
        })
        .setFramework('stat stat-view', '发票详情');
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