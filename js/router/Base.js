/**
 * Created by meathill on 14/11/13.
 */

'use strict';
;(function (ns) {
  ns.Base = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'dashboard': 'showDashboard'
    },
    showDashboard: function () {
      this.$body.load(tp.path + 'page/dashboard.hbs', new tp.model.Dashboard());
    },
    showUserPage: function (page) {
      if (page === 'logout') {
        return this.$me.destroy({
          success: function (model) {
            model.clear();
            location.hash = '#/user/login';
          }
        });
      }
      tp.config.login.api = this.$me.url;
      this.$body.load(tp.path + 'page/' + page + '.hbs', tp.config.login, {
        isFull: true
      });
      this.$body.setFramework('login');
    }
  });
}(Nervenet.createNameSpace('tp.router')));