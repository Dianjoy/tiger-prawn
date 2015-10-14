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
    },
    exportButton_clickHandler: function (event) {
      var tables = this.$('table');
      event.currentTarget.href = this.tableToExcel(tables, '对账单');
    },
    tableToExcel: function (tableList, name) {
      var tables = []
        , uri = 'data:application/vnd.ms-excel;base64,'
        , template = Handlebars.compile('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{{worksheet}}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><h3 style="text-align: center;">{{invoice_title}}</h3><h4 style="text-align: center;">{{invoice_time}}</h4><p style="text-align:right;">{{agreement_number}}</p>{{#each tables}}<table style="border:1px solid #000;">{{{this}}}</table>{{/each}}</body></html>');

      for (var i = 0; i < tableList.length - 1; i++) {
        tableList.find('a').replaceWith(function (i) {
          return this.innerHTML;
        });
        tables.push(tableList[i].innerHTML);
      }
      var data = {
        worksheet: name || 'Worksheet',
        tables: tables,
        agreement_number: this.$('#agreement-number').text(),
        invoice_title: this.$('#invoice-title').text(),
        invoice_time: this.$('#invoice-time').text()
      };
      return uri + this.base64(template(data));
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