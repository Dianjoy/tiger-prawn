/**
 * Created by meathill on 15/7/3.
 */
'use strict';
(function (ns) {
  ns.AddOnList = ns.BaseList.extend({
    autoFetch: false,
    initialize: function (options) {
      options = _.extend({
        container: 'tbody'
      }, options);
      this.collection = new Backbone.Collection();
      ns.BaseList.prototype.initialize.call(this, options);

      var id = this.$el.data('collection-id')
        , key = this.$el.data('key')
        , collection = tp.model.ListCollection.getInstance({
          collectionId: id
        });
      collection.on('data:' + key, this.collection_dataHandler, this);
    },
    collection_dataHandler: function (list) {
      this.collection.reset(list);
    }
  });
}(Nervenet.createNameSpace('tp.component')));