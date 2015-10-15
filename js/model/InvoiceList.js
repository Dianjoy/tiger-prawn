'use strict';
(function (ns) {
  ns.InvoiceList = Backbone.Collection.extend({
      url: tp.API + 'stat/',
      parse: function (response, options) {
        if (response.options) {
          this.options = response.options;
          this.options.API = tp.API;
          this.options.UPLOAD = tp.UPLOAD;
        }
        return response.list;
      }
    }
  );
}(Nervenet.createNameSpace('tp.model')));