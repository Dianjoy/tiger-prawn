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
      'receipt/view/:id': 'viewReceipt'
    },
    showADStat: function (id) {
      var model = new tp.model.AD({
        id: id
      });
      this.$body.load('page/stat/daily.hbs', model, {
        className: 'stat stat-ad'
      });
      this.$body.setFramework('has-date-range');
    },
    showADStatDate: function (id, date) {
      var model = new tp.model.AD({
        id: id,
        date: date
      });
      this.$body.load('page/stat/hourly.hbs', model, {
        className: 'stat stat-date'
      });
    },
    showStat: function () {
      this.$body.load('page/stat/list.html');
      this.$body.setFramework('has-date-range');
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
          loader: tp.page.ReceiptEditor
        })
        .setFramework('stat stat-detail', '发票开具申请单');
    },
    viewReceipt: function (id) {
      var model = new tp.model.ReceiptDetail({
        id: id,
        view: true
      });
      this.$body
        .load('page/stat/receipt-detail.hbs',model,{
          className: 'stat stat-view',
          loader: tp.page.ReceiptEditor
        })
        .setFramework('stat stat-view', '发票详情');
    }
  });
}(Nervenet.createNameSpace('tp.router')));