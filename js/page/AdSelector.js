'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.AdSelector = Backbone.View.extend({
    $invoiceList: null,
    events: {
      'submit': 'submitHandler'
    },
    submitHandler: function (event) {
      var id = this.$('table').data('collection-id')
        , store = localStorage.getItem(key)
        , ids = this.getValue(this.el.elements['ids'])
        , collection = tp.model.ListCollection.getInstance({collectionId: id})
        , checked = _.filter(collection.toJSON(), function (model) {
          return ids.indexOf(model.ad_id) !== -1;
        })
        , invoiceList = store ? _.union(JSON.parse(store), checked) : checked;

      invoiceList = _.chain(invoiceList)
        .sortBy('channel')
        .map(function (value, index) {value.id = index; return value; })
        .value();
      localStorage.setItem(key, JSON.stringify(invoiceList));
      this.$invoiceList.fetch({reset: true});
      this.$el.trigger('success');
      event.preventDefault();
    },
    getValue: function (element) {
      if (element.value) {
        return $(element).is(':checked') ? [element.value] : [];
      }
      var value = _.chain(element)
        .filter(function (item) { return item.checked; })
        .map(function (item) { return item.value; })
        .value();

      return value;
    }
  })
}(Nervenet.createNameSpace('tp.page')));