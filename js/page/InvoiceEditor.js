'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    $context: null,
    render: function () {
      this.callback = _.bind(this.callback, this);
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', {url: "", autoFetch: false}, this.$('#ad_table'), this.callback);
    },
    callback: function (components) {
      var products = this.model.get('products');
      var opt = this.model.options;
      this.productList = components[0];
      products.push({amount: true});
      this.productList.collection.on('change', this.collection_changeHandler, this);
      this.productList.collection.options = this.model.get("view") ? _.extend(opt, {view: true}) : opt;
      this.productList.collection.reset(products);
      products.pop();
    },
    collection_changeHandler: function (data) {
      var product = _.findWhere(this.model.get('products'), {id: data.id});
      _.extend(product, _.omit(data.toJSON(), 'previous'));
      if (!this.model.get('init')) {
        this.model.save({
          products: this.model.get('products'),
          income: this.model.options.income_after_total,
          income_first: this.model.options.income_before_total
        }, {patch: true});
      } else {
        this.render();
      }
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.productList.collection.off();
      this.productList = null;
    }
  });
}(Nervenet.createNameSpace('tp.page')));