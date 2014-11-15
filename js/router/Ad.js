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
      "ad/:id": "edit"
    },
    create: function () {
      var model = new tp.model.AD();
      this.$body.load('page/ad/edit.hbs', model);
    },
    edit: function (id) {
      var model = new tp.model.AD({
        id: id
      });
      this.$body.load('page/ad/edit.hbs', model);
    },
    list: function () {
      this.$body.load('page/ad/list.html');
    }
  });
}(Nervenet.createNameSpace('tp.router')));