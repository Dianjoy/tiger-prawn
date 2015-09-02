'use strict';
(function (ns) {
  ns.InvoiceDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (attrs) {
      if (this.isNew()) {
        var products = attrs.ids.split(',');
        this.urlRoot += 'init'
          + '?start=' + attrs.start
          + '&end=' + attrs.end
          + '&adids=' + products;
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
        this.options.view = this.get('view');
      }
      return response.invoice;
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var previous = this.previousAttributes();
      if (!_.isEmpty(previous)) {
        json.previous = previous;
      }
      return _.extend(json, this.options);
    },
  });
}(Nervenet.createNameSpace('tp.model')));