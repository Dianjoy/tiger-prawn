/**
 * Created by meathill on 14/11/13.
 */

'use strict';
(function (ns) {
  ns.Base = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'dashboard(/:start/:end)': 'showDashboard',
      'my/profile/': 'showMyProfile'
    },
    showDashboard: function (start, end) {
      var page = this.$me.isCP() ? '_cp' : '';
      var model = new tp.model.Dashboard({
        dashboard_start: start || moment().add(-1, 'months').format('YYYY-MM-DD'),
        dashboard_end: end || moment().format('YYYY-MM-DD'),
        is_sale: !this.$me.isCP()
      });
      this.$body.load('page/dashboard' + page + '.hbs', model);
      this.$body.setFramework('dashboard dashboard-' + (this.$me.isCP() ? 'cp' : 'sale'), '新近数据统计');
    },
    showMyProfile: function () {
      this.$body.load('page/cp/profile.hbs', this.$me, {
        data: {
          full: true
        },
        refresh: true
      });
      this.$body.setFramework('me profile', '我的账户');
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
      if (page === 'login' && this.$me.id) {
        this.navigate(tp.startPage || '#/dashboard');
        return;
      }
      tp.config.login.api = this.$me.url;
      this.$body.load(tp.path + 'page/' + page + '.hbs', tp.config.login, {
        isFull: true
      });
      this.$body.setFramework('login', '登录');
    }
  });
}(Nervenet.createNameSpace('tp.router')));