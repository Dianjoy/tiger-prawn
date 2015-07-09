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
      'receipt/detail':'applyReceipt'
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
    applyReceipt: function () {
      this.$body.load('page/stat/receipt-detail.html');
      this.$body.setFramework('','发票开具清单');
    }
  });
}(Nervenet.createNameSpace('tp.router')));