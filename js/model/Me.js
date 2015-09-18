/**
 * Created by meathill on 14/11/13.
 */
'use strict';
(function (ns) {
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'user/',
    defaults: {
      face: 'img/logo.png'
    },
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    fetch: function (options) {
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    parse: function (response) {
      var me = response.me;
      if ('balance' in me) {
        me.amount = me.balance + me.lock;
        me.money_percent = Math.round(me.balance / me.amount * 10000) / 100;
      }
      return me;
    },
    isCP: function () {
      return this.get('role') === 'cp';
    },
    id_changeHandler: function (model, id) {
      if (id) {
        this.$body.start(true);
        tp.notification.Manager.start();

        // 延迟10ms，避免事件顺序导致问题
        setTimeout(function () {
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
        }, 10);
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