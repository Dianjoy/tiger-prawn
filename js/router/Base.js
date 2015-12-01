/**
 * Created by meathill on 14/11/13.
 */

'use strict';
(function (ns) {
  ns.Base = Backbone.Router.extend({
    $ranger: null,
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'dashboard(/:start/:end)': 'showDashboard',
      'my/profile/': 'showMyProfile'
    },
    showDashboard: function (start, end) {
      var range = moment.createRange(start, end)
        , page = this.$me.isCP() ? '_cp' : ''
        , Model = Backbone.Model.extend({
          url: tp.API + 'dashboard/',
          parse: function (response) {
            return response.data;
          }
        })
        , model = new Model(range);
      this.$body.load('page/dashboard' + page + '.hbs', model, {
        refresh: true,
        data: range,
        loader: tp.view.Dashboard
      });
      this.$body.setFramework('has-date-range dashboard dashboard-' + (this.$me.isCP() ? 'cp' : 'sale'), '新近数据统计');
      this.$ranger.use(model);
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