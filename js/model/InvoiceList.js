'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceList = Backbone.Collection.extend({
    getInvoiceList: function (options) {
      var store = localStorage.getItem(key)
        , options = options ? _.clone(options) : {}
        , self = this;
      if (store) {
        var invoiceList = JSON.parse(store);
        _.each(invoiceList, function (element, index, list) {
          if (index === 0 || element.channel !== list[index - 1].channel) {
            element.is_first = true;
          }
          if (!options.reset) {
            self.add(element);
          }
        });
        if (options.reset) {
          this.reset(invoiceList);
        }
        this.trigger('sync');
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));