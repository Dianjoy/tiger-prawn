/**
 * Created by 路佳 on 2015/8/20.
 */
'use strict';
(function (ns) {
  ns.Docs = Backbone.Router.extend({
    $body: null,
    routes: {
      '': 'showWelcome',
      ':cate/:sub': 'showDocuments'
    },
    showDocuments: function (cate, sub) {

    },
    showWelcome: function () {
      this.$body.load('page/welcome.md');
      this.$body.setFramework('welcome', '欢迎');
    }
  });
}(Nervenet.createNameSpace('tp.router')));