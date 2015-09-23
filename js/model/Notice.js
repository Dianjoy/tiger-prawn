/**
 * Created by meathill on 14/12/23.
 */
'use strict';
(function (ns) {
  var TIMEOUT = 60000
    , autoNext = false; // 60s取一次

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
      var obj = JSON.parse(localStorage.getItem(tp.PROJECT + '#/notice/'));
      if (obj) {
        if (moment().diff(obj.time) > TIMEOUT) {
          obj.time = moment().format();
          localStorage.setItem(tp.PROJECT + '#/notice/', JSON.stringify(obj));
          Backbone.Collection.prototype.fetch.call(this, options);
        } else {
          this.trigger('sync');
          this.reset(obj.notice);
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
      localStorage.setItem(tp.PROJECT + '#/notice/', JSON.stringify({
        notice: response.list,
        time: moment().format()
      }));
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
    }
  });
}(Nervenet.createNameSpace('tp.model')));