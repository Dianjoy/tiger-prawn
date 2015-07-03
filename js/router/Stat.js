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
      'admin/stat/': 'showAdminADStat'
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
    showAdminADStat: function () {
      this.$body.load('page/stat/admin-list.html');
      this.$body.setFramework('has-date-range', '广告数据分析');
    }
  });
}(Nervenet.createNameSpace('tp.router')));