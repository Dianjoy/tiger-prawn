'use strict';
(function (ns) {
  ns.InvoiceNoticeEditor = Backbone.View.extend({
    initialize: function () {
      var collection = tp.model.ListCollection.getInstance({collectionId: this.$el.data('collectionId')})
        , id = this.$el.data('id')
        , model = collection.get(id);
      if (!model.get('is_read')) {
        tp.service.Manager.call(tp.API + 'invoice/comment/' + id, {}, {
          method: 'patch',
          context: this
        });
        model.set('is_read', true);
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));