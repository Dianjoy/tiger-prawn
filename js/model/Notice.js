/**
 * Created by meathill on 14/12/23.
 */
'use strict';
(function (ns) {
  var TIMEOUT = 60000
    , autoNext = false // 60s取一次
    , key = tp.PROJECT + ' notice'
    , cache = [];

  ns.Notice = Backbone.Collection.extend({
    latest: 0,
    url: tp.API + 'notice/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
      this.fetch = _.bind(this.fetch, this);
    },
    fetch: function (options) {
      autoNext = true;
      options = _.extend({
        data: {
          latest: this.latest
        },
        remove: false
      }, options);
      var obj = localStorage.getItem(key);
      if (obj) {
        var noticeList = JSON.parse(obj);
        if (Date.now() - noticeList.time > TIMEOUT) {
          noticeList.time = Date.now();
          localStorage.setItem(key, JSON.stringify(noticeList));
          Backbone.Collection.prototype.fetch.call(this, options);
        } else {
          setTimeout(this.fetch, TIMEOUT);
          this.reset(noticeList.notice);
        }
      } else {
        Backbone.Collection.prototype.fetch.call(this, options);
      }
    },
    parse: function (response) {
      for (var i = 0, len = response.list.length; i < len; i++) {
        response.list[i].create_time = response.list[i].create_time.substr(5, 11);
        this.latest = response.list[i].id > this.latest ? response.list[i].id : this.latest;
      }
      cache = response.list;
      return response.list;
    },
    stop: function () {
      autoNext = false;
      clearTimeout(TIMEOUT);
    },
    syncHandler: function () {
      if (autoNext) {
        setTimeout(this.fetch, TIMEOUT);
      }
      localStorage.setItem(key, JSON.stringify({
        notice: cache,
        time: Date.now()
      }));
    }
  });
}(Nervenet.createNameSpace('tp.model')));