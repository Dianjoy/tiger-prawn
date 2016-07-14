/**
 * Created by meathill on 16/7/14.
 */
'use strict';
(function (ns, Backbone) {
  ns.CP = Backbone.Router.extend({
    $body: null,
    routes: {
      "diy/": "showDiyList",
      "diy/create/": "createDiy",
      "diy/:id": "showDiyInfo"
    },
    createDiy: function () {
      var model = new tp.model.DIY();
      this.$body.load('page/ad/edit_cp.hbs', model)
        .setFramework('diy create', '添加投放计划');
    },
    showDiyInfo: function (id) {
      var model = new tp.model.DIY({
        id: id
      });
      this.$body.load('page/cp/info.hbs', model)
        .setFramework('diy info', '投放计划详情');
    },
    showDiyList: function () {
      this.$body.load('page/cp/diy.hbs', {API: tp.API})
        .setFramework('diy list', '投放计划');
    }
  });
}(Nervenet.createNameSpace('tp.router'), Backbone));