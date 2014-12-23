/**
 * Created by meathill on 14/12/23.
 */
'use strict';
(function (ns) {
  var TIMEOUT = 60000; // 60s取一次

  ns.Notice = Backbone.Collection.extend({
    latest: 0,
    url: tp.API + 'notice/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
      this.refresh();
      this.refresh = _.bind(this.refresh, this);
    },
    parse: function (response) {
      for (var i = 0, len = response.list.length; i < len; i++) {
        response.list[i].create_time = response.list[i].create_time.substr(5, 11);
        this.latest = response.list[i].id > this.latest ? response.list[i].id : this.latest;
      }
      return response.list;
    },
    refresh: function () {
      this.fetch({
        data: {
          latest: this.latest
        },
        remove: false
      });
    },
    syncHandler: function () {
      setTimeout(this.refresh, TIMEOUT);
    }
  });
}(Nervenet.createNameSpace('tp.model')));