'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.applyChooseAd = Backbone.View.extend({
    events: {
      'submit': 'submitHandler'
    },
    submitHandler: function () {
      var id = this.$('table').data('collection-id')
        , form = this.el
        , store = localStorage.getItem(key)
        , collection = tp.model.ListCollection.getInstance({
        collectionId: id
      });
      var ids = this.getValue(form.elements['ids']);
      var checked = _.map(ids, function (element) {
        return collection.get(element).toJSON();
      });
      if (store) {
        var invoiceList = JSON.parse(store);
        invoiceList = _.union(invoiceList, checked);
        invoiceList = _.sortBy(invoiceList, 'channel');
        localStorage.setItem(key, JSON.stringify(invoiceList));
      } else {
        _.sortBy(checked, 'channel');
        localStorage.setItem(key, JSON.stringify(checked));
      }
      this.$el.trigger('success');
    },
    getValue: function (element) {
      if (element.value) {
        return [element.value];
      }
      var value = _.chain(element)
        .filter(function (item) { return item.checked; })
        .map(function (item) { return item.value; })
        .value();

      return value;
    }
  })
}(Nervenet.createNameSpace('tp.page')));