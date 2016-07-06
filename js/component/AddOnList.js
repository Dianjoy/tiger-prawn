/**
 * Created by meathill on 15/7/3.
 */
'use strict';
(function (ns, _, Backbone) {
  /**
   * @class
   */
  ns.AddOnList = ns.BaseList.extend({
    autoFetch: false,
    /**
     *
     * @param {Object} options
     * @param {Boolean} options.amount
     * @param {Array} options.omits
     */
    initialize: function (options) {
      options = _.extend({
        container: 'tbody'
      }, options, this.$el.data());
      this.options = options;
      this.collection = tp.model.ListCollection.getInstance();
      ns.BaseList.prototype.initialize.call(this, options);

      var id = this.$el.data('collection-id')
        , key = this.$el.data('key')
        , collection = tp.model.ListCollection.getInstance({
          collectionId: id
        });
      collection.on('data:' + key, this.collection_dataHandler, this);
    },
    collection_dataHandler: function (list, collection) {
      if (collection.options) {
        this.collection.model = Backbone.Model.extend({
          defaults: collection.options
        });
      }
      this.collection.reset(list);
      if (this.options.amount) {
        var data = this.collection.getAmount(this.options.omits);
        this.collection_addHandler(data, null, {immediately: true});
      }
    }
  });
}(Nervenet.createNameSpace('tp.component'), _, Backbone));