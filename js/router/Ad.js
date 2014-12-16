/**
 * Created by meathill on 14/11/15.
 * router for ads
 */
'use strict';
(function (ns) {
  ns.AD = Backbone.Router.extend({
    $body: null,
    routes: {
      "ad(/)": "list",
      "ad/create": "create",
      "ad/:id": "edit",
      "apply(/)": "listApplies"
    },
    create: function () {
      var model = new tp.model.AD();
      this.$body
        .load('page/ad/edit.hbs', model)
        .setFramework('ad ad-new', '创建广告');
    },
    edit: function (id) {
      if (this.$body.$el.hasClass('ad-new')) {
        return;
      }
      var model = new tp.model.AD({
        id: id
      });
      this.$body
        .load('page/ad/edit.hbs', model)
        .setFramework('ad', '编辑广告');
    },
    list: function () {
      this.$body
        .load('page/ad/list.html')
        .setFramework('ad ad-list', '我的广告');
    },
    listApplies: function () {
      this.$body
        .load('page/ad/apply.html')
        .setFramework('apply', '我的申请');
    }
  });
}(Nervenet.createNameSpace('tp.router')));