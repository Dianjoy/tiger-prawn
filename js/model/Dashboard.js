/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns) {
  ns.Dashboard = Backbone.Model.extend({
    className: 'dashboard',
    url: tp.API + 'dashboard/',
    initialize: function (attrs) {
      var start = attrs.dashboard_start;
      var end = attrs.dashboard_end;
      this.url  += '?start=' + start + '&end=' + end;
    },
    parse: function (resposne) {
      if ('record' in resposne.data) {
        _.each(resposne.data.record, function (item, i) {
          item.is_checked = item.status < 2;
        });
      }
      return resposne.data;
    }
  });
}(Nervenet.createNameSpace('tp.model')));