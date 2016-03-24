/**
 * Created by meathill on 14/11/13.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'auth/',
    defaults: {
      face: 'img/logo.png'
    },
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    fetch: function (options) {
      if (location.hash && /^#\/oauth\/[\w_-]+\/$/.test(location.hash)) {
        var oauth = location.hash.split('/')[2];
        options = options || {};
        options.data = _.defaults({
          oauth: oauth,
          backURL: tp.config.oauth[oauth].backURL
        }, options.data);
      }
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    /**
     *
     * @param response
     * @param {object} response.me
     * @param {number} response.me.balance
     * @param {number} response.me.amount
     * @returns {object}
     */
    parse: function (response) {
      var me = response.me;
      if ('balance' in me) {
        me.amount = me.balance + me.lock;
        me.money_percent = Math.round(me.balance / me.amount * 10000) / 100;
      }
      return me;
    },
    getUserRole: function () {
      return this.get('role');
    },
    id_changeHandler: function (model, id) {
      if (id) {
        // 如果是外部登录,直接跳转
        if (model.get('signature')) {
          location.href = model.get('backURL') + '?data=' + encodeURIComponent(JSON.stringify(model.pick('id', 'user', 'fullname', 'role'))) + '&sign=' + model.get('signature');
          $('#page-preloader').append('<p>即将跳转到目标平台，请稍候</p>');
          return;
        }
        
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
            localStorage.removeItem(tp.PROJECT + '-from');
            location.hash = from || tp.startPage || '#/dashboard';
          }
        }, 10);
      } else {
        if (this.$body.isStart && location.hash !== '#/user/logout') {
          var login = _.defaults({
            title: '登录已失效，请重新登录',
            content: 'page/login.hbs',
            isRemote: true,
            api: this.url
          }, tp.config.login);
          tp.popup.Manager.popup(login);
        } else {
          localStorage.setItem(tp.PROJECT + '-from', location.hash);
          location.hash = '#/user/login';
        }
      }
    },
    onError: function () {
      this.$body.start();
      if (location.hash && !/^#\/user\/log(in|out)$/.test(location.hash)) {
        localStorage.setItem(tp.PROJECT + '-from', location.hash);
      }
      if (!/^#\/oauth\/[\w+_-]+\/$/.test(location.hash)) {
        location.hash = '#/user/login';
      }
      Backbone.history.start({
        root: tp.BASE
      });
    }
  });
}(Nervenet.createNameSpace('tp.model')));