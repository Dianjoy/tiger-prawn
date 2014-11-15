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
    id_changeHandler: function (id) {
      if (id) {
        this.$body.start(true);
        if (location.hash === '#/user/login') {
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
    }
  });
}(Nervenet.createNameSpace('tp.model')));