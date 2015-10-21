'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceList = Backbone.Collection.extend({
      getInvoiceList: function () {
        var store = localStorage.getItem(key)
          , self = this;
        if (store) {
          var invoiceList = JSON.parse(store);
          _.map(invoiceList, function (element, index, list) {
            if (index === 0 || element.channel !== list[index - 1].channel) {
              element.is_first = true;
            }
            self.add(element);
            return element;
          });
          self.trigger('sync');
        }
      }
    }
  );
}(Nervenet.createNameSpace('tp.model')));