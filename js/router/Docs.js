/**
 * Created by 路佳 on 2015/8/20.
 */
'use strict';
(function (ns) {
  ns.Docs = Backbone.Router.extend({
    $body: null,
    routes: {
      '': 'showWelcome',
      ':cate(/:sub)': 'showDocuments'
    },
    showDocuments: function (cate, sub) {
      var md = 'page/' + cate + (sub ? '/' + sub : '') + '.md';
      this.$body.load(md);
      this.$body.setFramework('doc', '文档');
    },
    showWelcome: function () {
      this.$body.load('page/welcome.md');
      this.$body.setFramework('welcome', '欢迎');
    }
  });
}(Nervenet.createNameSpace('tp.router')));