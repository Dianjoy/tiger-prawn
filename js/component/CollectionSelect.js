/**
 * Created by meathill on 15/5/19.
 */
'use strict';
(function (ns) {
  /**
   * @class
   * @type Backbone.View
   */
  ns.CollectionSelect = ns.BaseList.extend({
    autoFetch: true,
    refresh: function (options) {
      if (this.collection.length) {
        this.collection_resetHandler();
      } else {
        ns.BaseList.prototype.refresh.call(this, options);
      }
    },
    render: function () {
      ns.BaseList.prototype.render.call(this);
      this.$el
        .val(function () {
          var value = $(this).data('value');
          value = value || this.value;
          return value;
        })
        .prop('disabled', false);
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