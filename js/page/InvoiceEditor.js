'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    $context: null,
    render: function () {
      this.getProductList = _.bind(this.getProductList, this);
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', {url: this.model.isNew() ? "" : tp.API + 'invoice/ad/', autoFetch: false}, this.$('#ad_table'), this.getProductList);
    },
    getProductList: function (components) {
      var products =  this.model.get('products');
      var opt = this.model.options;
      this.productList = components[0];
      products.push({amount: true});
      this.productList.collection.on('change', this.collection_changeHandler, this);
      this.productList.collection.options = opt;
      this.productList.collection.reset(products);
      products.pop();
    },
    collection_changeHandler: function (data) {
      var product = _.findWhere(this.model.get('products'), {id: data.id});
      _.extend(product, _.omit(data.toJSON(), 'previous'));
      this.render();
      if (this.model.isNew()) {
        $(".modal").modal('hide');
      }
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.productList.collection.off();
      this.productList = null;
    }
  });
}(Nervenet.createNameSpace('tp.page')));