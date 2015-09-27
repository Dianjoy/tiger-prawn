/**
 * Created by meathill on 14/12/23.
 */
'use strict';
(function (ns) {
  var TIMEOUT = 60000
    , autoNext = false // 60s取一次
    , key = tp.PROJECT + '-notice-cache'
    , cache = null;

  ns.Notice = Backbone.Collection.extend({
    latest: 0,
    url: tp.API + 'notice/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
      this.fetch = _.bind(this.fetch, this);
    },
    fetch: function (options) {
      autoNext = true;
      var store = localStorage.getItem(key);
      if (store) {
        var noticeList = JSON.parse(store);
        if (Date.now() - noticeList.time < TIMEOUT) {
          setTimeout(this.fetch, TIMEOUT);
          this.set(noticeList.notice);
          this.trigger('sync');
          return;
        }

        noticeList.time = Date.now();
        localStorage.setItem(key, JSON.stringify(noticeList));
      }
      options = _.extend({
        data: {
          latest: this.latest
        },
        remove: false
      }, options);
      Backbone.Collection.prototype.fetch.call(this, options);
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
    syncHandler: function (collection) {
      if (autoNext) {
        setTimeout(this.fetch, TIMEOUT);
      }
      if (collection) {
        localStorage.setItem(key, JSON.stringify({
          notice: cache,
          time: Date.now()
        }));
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));