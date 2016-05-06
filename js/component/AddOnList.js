/**
 * Created by meathill on 15/7/3.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.AddOnList = ns.BaseList.extend({
    autoFetch: false,
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
      if (this.options.sum) {
        var sum = [];
        _.each(list, function (element) {
          if(element.data) {
            this.collection.reset(element.data, { silent: true });
            var total = _.reduce(element.filters, function (memo, filter) {
              return memo + this.collection.getAmount()[filter];
            }, 0, this);
            sum.push(_.extend(element, { total: total }));
          }
        }, this);
        this.collection.reset(sum);
      } else {
        this.collection.reset(list);
      }

      if (this.options.amount) {
        var data = this.collection.getAmount(this.options.omits);
        this.collection_addHandler(data, null, {immediately: true});
      }
    }
  });
}(Nervenet.createNameSpace('tp.component')));