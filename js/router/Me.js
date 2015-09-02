/**
 * Created by meathill on 15/8/26.
 */
'use strict';
(function (ns) {
  ns.Me = Backbone.Router.extend({
    $body: null,
    routes: {
      'my/finance/': 'showMyFinance'
    },
    showMyFinance: function () {
      this.$body.load('page/cp/finance.html');
      this.$body.setFramework('my finance', '充值历史');
    }
  });
}(Nervenet.createNameSpace('tp.router')));