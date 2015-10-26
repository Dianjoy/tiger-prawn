'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceList = Backbone.Collection.extend({
    fetch: function (options) {
      var store = localStorage.getItem(key)
        , options = options ? _.clone(options) : {};
      if (store) {
        var invoiceList = JSON.parse(store);
        _.each(invoiceList, function (element, index, list) {
          if (index === 0 || element.channel !== list[index - 1].channel) {
            element.is_first = true;
          }
        });
        options.reset ? this.reset(invoiceList) : this.set(invoiceList);
        this.trigger('sync');
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));