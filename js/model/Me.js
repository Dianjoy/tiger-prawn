/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'user/',
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    parse: function (response) {
      return response.me;
    },
    check: function () {
      this.fetch({
        error: _.bind(this.onError, this)
      });
    },
    id_changeHandler: function (id) {
      if (id) {
        this.$body.start(true);
        tp.notification.Manager.start();
        var route = Backbone.history.start({
          root: '/tiger-prawn/'
        });
        if (!route) {
          location.hash = '#/dashboard';
        }
      } else {
        if (this.$body.isStart) {
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
          location.hash = '#/user/login';
        }
      }
    },
    onSuccess: function () {
      this.$body.start(true);
      if (!route) {
        location.hash = '#/dashboard';
      }
    },
    onError: function () {
      this.$body.start();
      location.hash = '#/user/login';
      Backbone.history.start({
        root: '/tiger-prawn'
      });
    }
  });
}(Nervenet.createNameSpace('tp.model')));