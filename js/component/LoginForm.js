/**
 * Created by meathill on 14/11/18.
 */
'use strict';
(function (ns) {
  ns.LoginForm = Backbone.View.extend({
    events: {
      'click #verify-code': 'verifyCode_clickHandler',
      'success .oauth': 'oauth_successHandler'
    },
    oauth_successHandler: function () {
      this.$('input, button').prop('disabled', true);
      this.$('.btn-primary').text('跳转中，请稍候');
    },
    verifyCode_clickHandler: function (event) {
      var src = event.target.src
        , offset = src.indexOf('?ts=')
        , time = Date.now();
      src = offset === -1 ? src + '?ts=' + time : src.replace(/\?ts=\d+$/, '?ts=' + time);
      event.target.src = src;
    }
  });
}(Nervenet.createNameSpace('tp.component')));