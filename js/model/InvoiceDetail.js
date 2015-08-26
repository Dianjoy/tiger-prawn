'use strict';
(function (ns) {
  ns.InvoiceDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (options) {
      if(this.isNew()){
        if(options.isReapply){
          this.urlRoot += options.invoice_id;
        } else{
          var products = options.ids.split(',');
          this.urlRoot += 'init'
            + '?start=' + options.start
            + '&end=' + options.end
            + '&adids=' + products;
        }
      }
      if(options.view){
        this.view = options.view;
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
        this.options.view = this.view;
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