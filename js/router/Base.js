/**
 * Created by meathill on 14/11/13.
 */

'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.Base = Backbone.Router.extend({
    $ranger: null,
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'oauth/:from/': 'oauth',
      'dashboard(/:start/:end)': 'showDashboard',
      'my/profile/': 'showMyProfile'
    },
    oauth: function (from) {
      var oauth = tp.config.oauth[from];
      oauth.isOAuth = true;
      oauth.capital = oauth.logo ? '' : oauth.name.substr(0, 1).toUpperCase();
      this.showUserPage('login', oauth);
    },
    showDashboard: function (start, end) {
      var Model = Backbone.Model.extend({
        url: tp.API + 'dashboard/',
        parse: function (response) {
          return response.data;
        }
      });
      if (this.$me.isCP()) {
        return this.showCPDashboard(Model);
      }
      var range = moment.createRange(start, end)
        , model = new Model(range);
      this.$body.load('page/dashboard.hbs', model, {
        refresh: true,
        data: range,
        loader: tp.view.Dashboard
      });
      this.$body.setFramework('has-date-range dashboard dashboard-' + this.$me.getUserRole(), '欢迎你，' + this.$me.get('fullname'));
      this.$ranger.use(model);
      model.once('sync', this.$body.setLatestStat, this.$body);
    },
    showCPDashboard: function (Model) {
      var model = new Model();
      this.$body.load('page/dashboard-cp.hbs', model, {
        loader: tp.view.Dashboard
      });
      this.$body.setFramework('dashboard dashboard-cp', '欢迎你，' + this.$me.get('fullname'));
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
    showUserPage: function (page, options) {
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
      options = _.defaults(options || {}, tp.config.login, {
        api: this.$me.url
      });
      this.$body.load(tp.path + 'page/' + page + '.hbs', options, {
        isFull: true
      });
      this.$body.setFramework('login', '登录');
    }
  });
}(Nervenet.createNameSpace('tp.router')));