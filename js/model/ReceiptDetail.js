'use strict';
(function (ns) {
  ns.ReceiptDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (options) {
      if(this.isNew()){
        if(options.isReapply){
          this.urlRoot += options.receipt_id;
        }
        else{
          var products = options.ids.split(',');
          this.urlRoot += 'init'
            + '?start=' + options.start
            + '&end=' + options.end
            + '&channel_id=' + options.channel_id
            + '&agreement_id=' + options.agreement_id
            + '&adids=' + products;
        }
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
        if(this.isNew()){
          this.options.init = true;
        }
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