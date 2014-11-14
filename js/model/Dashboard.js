/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns) {
  ns.Dashboard = Backbone.Model.extend({
    className: 'dashboard',
    url: tp.API + 'dashboard/',
    parse: function (resposne) {
      return resposne.data;
    }
  });
}(Nervenet.createNameSpace('tp.model')));