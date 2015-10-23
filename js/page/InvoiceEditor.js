'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    events: _.extend({
      'click .export-button': 'exportButton_clickHandler'
    }, tp.view.Loader.prototype.events),
    $context: null,
    render: function () {
      this.getProductList = _.bind(this.getProductList, this);
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', {url: this.model.isNew() ? "" : tp.API + 'invoice/ad/', autoFetch: false}, this.$('#ad_table'), this.getProductList);
      $.get(tp.path + 'template/table-to-excel.hbs', _.bind(this.tableToExcel, this), 'html');
    },
    exportButton_clickHandler: function (event) {
      event.currentTarget.href = this.export_href;
    },
    tableToExcel: function (template) {
      var tables = []
        , uri = 'data:application/vnd.ms-excel;base64,'
        , tableList = this.$('table').clone()
        , html = Handlebars.compile(template);

      for (var i = 0; i < tableList.length - 1; i++) {
        tableList.find('a').replaceWith(function (i) {
          return this.innerHTML;
        });
        tables.push(tableList[i].innerHTML);
      }
      var data = {
        worksheet: '对账单',
        tables: tables,
        agreement_number: this.$('#agreement-number').text(),
        invoice_title: this.$('#invoice-title').text(),
      };
      this.export_href = uri + this.base64(html(data));
    },
    base64: function (str) {
      return window.btoa(unescape(encodeURIComponent(str)));
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