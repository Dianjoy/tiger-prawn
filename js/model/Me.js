/**
 * Created by meathill on 14/11/13.
 */
'use strict';
(function (ns) {
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'user/',
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    fetch: function (options) {
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    parse: function (response) {
      return response.me;
    },
    id_changeHandler: function (model, id) {
      if (id) {
        this.$body.start(true);
        tp.notification.Manager.start();
        var route;
        if (!Backbone.History.started) {
          route = Backbone.history.start({
            root: tp.BASE
          });
        }
        if (!route || /^#\/user\/\w+$/.test(location.hash)) {
          var from = localStorage.getItem(tp.PROJECT + '-from');
          from = /^#\/user\/log(in|out)$/.test(from) ? '' : from;
          location.hash = from || tp.startPage || '#/dashboard';
        }
      } else {
        if (this.$body.isStart && location.hash !== '#/user/logout') {
          var login = tp.config.login;
          login.welcome = '登录已失效，请重新登录';
          login.api = this.url;
          tp.popup.Manager.popup(_.extend({
            title: '登录',
            content: 'page/login.hbs',
            confirm: '登录',
            cancel: '退出',
            isRemote: true
          }, login));
        } else {
          localStorage.setItem(tp.PROJECT + '-from', location.hash);
          location.hash = '#/user/login';
        }
      }
    },
    onError: function () {
      this.$body.start();
      localStorage.setItem(tp.PROJECT + '-from', location.hash);
      location.hash = '#/user/login';
      Backbone.history.start({
        root: tp.BASE
      });
    }
  });
}(Nervenet.createNameSpace('tp.model')));