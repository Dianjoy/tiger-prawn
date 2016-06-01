'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    $invoiceList: null,
    events: _.extend({
      'click .export-button': 'exportButton_clickHandler',
      'blur [name=header]': 'header_blurHandler',
      'success form': 'form_successHandler'
    }, tp.view.Loader.prototype.events),
    $context: null,
    render: function () {
      this.getProductList = _.bind(this.getProductList, this);
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', this.$('#ad_table'), this.getProductList);
      $('.invalid-' + this.model.get('channel')).addClass('invalid');
      $('.invoice-list form').removeClass('processing');
      $('.apply .fa-spinner').remove();
    },
    exportButton_clickHandler: function (event) {
      event.currentTarget.href = this.exportHref;
    },
    tableToExcel: function (template) {
      this.excelTemplate = template;
      var tables = []
        , uri = 'data:application/vnd.ms-excel;base64,'
        , tableList = this.$('.print-table').clone()
        , html = Handlebars.compile(template)
        , acceptAccount = '~' + this.$('#accept-account').text();

      for (var i = 0; i < tableList.length; i++) {
        tableList.eq(i).find('a').replaceWith(function () {
          return this.innerHTML;
        });
        if (i === 0) {
          var table = tableList.eq(i);
          table.find('.do-not-print').remove();
          table.find('.print-title').text(function () {
            return $(this).data('printTitle');
          });
          table.find('#rmb,#reason,#income-total').attr('colspan', function () {
            return $(this).data('colspan');
          });
          table.find('th,td').attr('style', 'border:1px solid #ddd; mso-number-format:"\@";');
        }
        if (i === 2) {
          tableList.eq(i).find('#accept-account').text(acceptAccount);
        }
        tables.push(tableList[i].innerHTML);
      }
      var data = {
        worksheet: '对账单',
        tables: tables,
        agreement_number: this.$('#agreement-number').text(),
        invoice_title: this.$('#invoice-title').text()
      };
      this.exportHref = uri + this.base64(html(data));
    },
    base64: function (str) {
      return window.btoa(unescape(encodeURIComponent(str)));
    },
    getProductList: function (components) {
      var products = this.model.get('products')
        , options = this.model.options;
      this.productList = components[0];
      products.push({amount: true});
      this.productList.collection.on('change', this.collection_changeHandler, this);
      this.productList.collection.options = options;
      this.productList.collection.reset(products);
      products.pop();
      $.get(tp.path + 'template/table-to-excel.hbs', _.bind(this.tableToExcel, this), 'html');
    },
    collection_changeHandler: function (data) {
      var model = this.model
        , products = model.get('products')
        , product = _.findWhere(products, {id: data.id});
      _.extend(product, data.toJSON());
      products = model.toJSON().products;
      products.push({amount: true});
      data.collection.reset(products);
      products.pop();
      this.$('#ad_income').text(model.get('ad_income'));
      this.$('#ios_income').text(model.get('ios_income'));
      this.tableToExcel(this.excelTemplate);
      if (model.isNew()) {
        $('.modal').modal('hide');
      }
    },
    remove: function () {
      $('.invalid-' + this.model.get('channel')).removeClass('invalid');
      Backbone.View.prototype.remove.call(this);
      if (this.productList) {
        this.productList.collection.off();
        this.productList = null;
      }
    },
    form_successHandler: function () {
      var channel = this.model.get('channel')
        , models = this.$invoiceList.where({channel: _.isString(channel) ? channel : channel.toString()});
      this.$invoiceList.remove(models);
    },
    header_blurHandler: function (event) {
      this.$('.header').text(event.target.value);
    }
  });
}(Nervenet.createNameSpace('tp.page')));