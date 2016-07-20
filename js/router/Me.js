/**
 * Created by meathill on 15/8/26.
 */
'use strict';
(function (ns, Backbone) {
  ns.Me = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'my/finance/': 'showMyFinance',
      'my/profile/': 'showMyProfile'
    },
    showMyFinance: function () {
      this.$body.load('page/cp/finance.html');
      this.$body.setFramework('my finance', '充值历史');
    },
    showMyProfile: function () {
      this.$me.set('API', tp.API);
      this.$body.load('page/cp/profile.hbs', this.$me, {
        data: {
          full: true
        },
        refresh: true
      });
      this.$body.setFramework('me profile', '我的账户');
    },
  });
}(Nervenet.createNameSpace('tp.router'), Backbone));