'use strict';
(function (ns) {
  ns.InvoiceEditor = tp.view.Loader.extend({
    $context:null,
    events: {
      'click .edit': 'edit_clickHandler',
      'click .edit-button': 'editButton_clickHandler',
      'click .invoice-button': 'invoiceButton_clickHandler',
      'click #reapply-button': 'reapplyButton_clickHandler',
      'success': 'success_handler'
    },
    render: function () {
      var products = this.model.get('products');
      var opt = this.model.options;
      var self = this;
      var rmb = '';
      var obj = {
        cpa_first_total: 0,
        cpa_after_total: 0,
        income_before_total: 0,
        income_after_total: 0,
        joy_income: 0,
        red_ad_income: 0,
        red_ios_income: 0
      };

      products = _.map(products, function (element) {
        if (!element.quote_rmb_after) {
          _.extend(element, {
            quote_rmb_after: element.quote_rmb,
            cpa_after: element.cpa,
            income_after: element.income,
            rate: ((1 - element.cpa * element.quote_rmb / element.income) * 100).toFixed(2),
            money_cut: element.income - element.income,
            remark: ''
          });
        } else{
          _.extend(element, {
            income_after: element.quote_rmb_after * element.cpa_after,
            rate: ((1 - element.cpa_after * element.quote_rmb_after / element.income) * 100).toFixed(2),
            money_cut: element.income - element.quote_rmb_after * element.cpa_after
          });
        }

        obj.cpa_first_total += Number(element.cpa);
        obj.cpa_after_total += Number(element.cpa_after);
        obj.income_after_total += element.income_after;
        obj.income_before_total += element.income;
        rmb = tp.utils.convertCurrency(obj.income_after_total);

        switch (element.sdk_type) {
          case "0":
            obj.joy_income += element.income_after;
            break;
          case "1":
            obj.red_ad_income += element.income_after;
            break;
          case "2":
            obj.red_ios_income += element.income_after;
            break;
        }
        return element;
      });
      _.extend(opt, obj);

      var callback = function (components) {
        var smartTable = components[0];
        products.push({rmb: rmb});
        smartTable.collection.on('change', self.collection_changeHandler, self);
        smartTable.collection.options = opt;
        smartTable.collection.reset(products);
        products.pop();
      };
      tp.view.Loader.prototype.render.call(this);
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', {url: "", autoFetch: false}, this.$('#ad_table'), callback);
    },
    collection_changeHandler: function (data) {
      var product = _.findWhere(this.model.get('products'), {id: data.id});
      _.extend(product, _.omit(data.toJSON(), 'previous'));
      this.render();
      if (!this.model.get('init')) {
        this.model.save({
          products: this.model.get('products'),
          income: this.model.options.income_after_total,
          income_first: this.model.options.income_before_total
        }, {patch: true});
      }
    },
    success_handler: function () {
      window.location ='#/invoice/';
    },
    invoiceButton_clickHandler: function (event) {
      var target = event.currentTarget;
      var confirm = $(target).data('confirm');
      var start = this.model.get('start');
      var end = this.model.get('end');
      var ad_id = this.$('#ad_table tbody tr').eq(0).data('id');
      var options = {
        title: target.title,
        id: ad_id,
        confirm: confirm,
        content: "page/stat/choose-ad.hbs",
        isRemote: true,
        start: start,
        end: end,
        fromInvoice: true
      };
      var popup = tp.popup.Manager.popup(options);
      popup.on('confirm', this.invoicePopup_confirmHandler, this);
    },
    invoicePopup_confirmHandler: function (popup) {
      var ids = ""
        , start = this.model.get('start')
        , end = this.model.get('end')
        , len = popup.$(':checked').length
        , self = this;

      if (len) {
        popup.$(':checked').each(function (i) {
          if(i + 1 != len){
            ids += $(this).val() + ',';
          } else{
            ids += $(this).val();
          }
        });
        this.model.save({ids:ids}, {
          patch: true,
          success: function () {
            self.render();
          }
        });
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));