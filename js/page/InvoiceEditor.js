'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    $invoiceList: null,
    events: _.extend({
      'click .export-button': 'exportButton_clickHandler',
      'blur [name=header]': 'header_blurHandler',
      'change .charger': 'charger_changeHandler',
      'success form': 'form_successHandler'
    }, tp.view.Loader.prototype.events),
    $context: null,
    render: function () {
      this.getProductList = _.bind(this.getProductList, this);
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', this.$('#ad_table'), this.getProductList);
      $.get(tp.path + 'template/table-to-excel.hbs', _.bind(this.tableToExcel, this), 'html');
      $('.invalid-' + this.model.get('channel')).addClass('invalid');
      $('.invoice-list form').removeClass('processing');
      $('.apply .fa-spinner').remove();
    },
    exportButton_clickHandler: function (event) {
      event.currentTarget.href = this.exportHref;
    },
    tableToExcel: function (template) {
      var tables = []
        , uri = 'data:application/vnd.ms-excel;base64,'
        , tableList = this.$('.print-table').clone()
        , html = Handlebars.compile(template)
        , acceptAccount = '~' + this.$('#accept-account').text();

      for (var i = 0; i < tableList.length; i++) {
        tableList.find('a').replaceWith(function (i) {
          return this.innerHTML;
        });
        if (i === 2) {
          tableList.find('#accept-account').text(acceptAccount);
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
      var products =  this.model.get('products')
        , opt = this.model.options;
      this.productList = components[0];
      products.push({amount: true});
      this.productList.collection.on('change', this.collection_changeHandler, this);
      this.productList.collection.options = opt;
      this.productList.collection.reset(products);
      products.pop();
    },
    collection_changeHandler: function (data) {
      var products = this.model.get('products')
        , product = _.findWhere(products, {id: data.id});
      _.extend(product, _.omit(data.toJSON(), 'previous'));
      this.model_changeHandler();
      if (this.model.isNew()) {
        $(".modal").modal('hide');
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
        , models = this.$invoiceList.where({channel: channel});
      this.$invoiceList.remove(models);
    },
    header_blurHandler: function (event) {
      this.$('.header').text(event.target.value);
    },
    charger_changeHandler: function (event) {
      var target = $(event.target)
        , index = parseInt(target.find('option:selected').data('index'))
        , charger = this.model.options.chargers[index]
        , size = charger.size
        , department = charger.department;
      this.$('.size').text(size);
      this.$('.department').text(department);
    }
  });
}(Nervenet.createNameSpace('tp.page')));