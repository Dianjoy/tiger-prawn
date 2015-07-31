'use strict';
(function (ns) {
  ns.ReceiptDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function () {
      if(this.isNew()){
        this.urlRoot += 'init';
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
        if(this.isNew()){
          this.options.channel_id = localStorage.getItem('channel_id');
          this.options.full_name = localStorage.getItem('full_name');
          this.options.settle_start = localStorage.getItem('settle_start_date');
          this.options.settle_end = localStorage.getItem('settle_end_date');
          this.options.init_invoice = [];

          var products  = localStorage.getItem('products').split(',');
          var ad_name  = localStorage.getItem('ad_name').split(',');
          var self = this;
          products.forEach(function (element,index) {
            self.options.init_invoice.push({'ad_name':ad_name[index],'products':element});
          });
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