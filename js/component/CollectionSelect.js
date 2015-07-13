/**
 * Created by meathill on 15/5/19.
 */
'use strict';
(function (ns) {
  ns.CollectionSelect = ns.BaseList.extend({
    initialize: function (options) {
      var init = this.$el.data();
      this.collection = tp.model.ListCollection.getInstance(init);
      ns.BaseList.prototype.initialize.call(this, options);

      if (this.collection.length) {
        this.collection_resetHandler();
      }
      if (init.autoFetch) {
        this.collection.fetch();
      }
    },
    collection_addHandler: function (model, collection, options) {
      var item = ns.BaseList.prototype.collection_addHandler.call(this, model, collection, options);
      if (item) {
        item.prop('selected', true)
          .siblings().prop('selected', false);
      }
    },
    collection_changeHandler: function (model) {
      this.$('[value=' + model.id + ']').prop('selected', true)
        .siblings().prop('selected', false);
    }
  });
}(Nervenet.createNameSpace('tp.component')));