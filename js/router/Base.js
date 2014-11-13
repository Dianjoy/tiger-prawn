/**
 * Created by meathill on 14/11/13.
 */

'use strict';
;(function (ns) {
  ns.Base = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage'
    },
    showUserPage: function (page) {
      if (page === 'logout') {
        return this.$me.destroy();
      }
      tp.config.login.api = this.$me.url;
      this.$body.load('page/' + page + '.hbs', tp.config.login, true);
    }
  });
}(Nervenet.createNameSpace('tp.router')));