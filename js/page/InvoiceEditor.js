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
      var cpa_first_total = 0
        , cpa_after_total =0
        , income_before_total = 0
        , income_after_total = 0
        , rmb = ''
        , joy_income = 0
        , red_ad_income = 0
        , red_ios_income = 0;

      _.each(products,function (e) {
        if(!e.quote_rmb_after){
          _.extend(e,{
            quote_rmb_after: e.quote_rmb,
            cpa_after: e.cpa,
            income_after: e.income,
            rate: ((1 - e.cpa * e.quote_rmb / e.income) * 100).toFixed(2),
            money_cut: e.income - e.income,
            remark: ''
          });
        } else{
          _.extend(e,{
            income_after: e.quote_rmb_after * e.cpa_after,
            rate: ((1 - e.cpa_after * e.quote_rmb_after / e.income) * 100).toFixed(2),
            money_cut: e.income - e.quote_rmb_after * e.cpa_after
          })
        }

        cpa_first_total += Number(e.cpa);
        cpa_after_total += Number(e.cpa_after);
        income_after_total += e.income_after;
        income_before_total += e.income;
        rmb = tp.utils.convertCurrency(income_after_total);

        switch (e.sdk_type){
          case "0":
            joy_income += e.income_after;
            break;
          case "1":
            red_ad_income += e.income_after;
            break;
          case "2":
            red_ios_income += e.income_after;
            break;
        }
      });

      _.extend(this.model.options,{
        cpa_first_total: cpa_first_total,
        cpa_after_total: cpa_after_total,
        income_after_total: income_after_total,
        income_before_total: income_before_total,
        joy_income: joy_income,
        red_ad_income: red_ad_income,
        red_ios_income:red_ios_income
      });

      tp.view.Loader.prototype.render.call(this);

      var smartTable = this.$context.createInstance(tp.component.SmartTable,{el:this.$('#ad_table'),url: " "});

      products.push({rmb:rmb});
      smartTable.collection.options = opt;
      smartTable.collection.reset(products);
      products.pop();
    },
    reapplyButton_clickHandler: function () {
      this.model.id = null;
      this.model.urlRoot = tp.API + 'invoice/init';
    },
    editButton_clickHandler: function (event) {
      var target = event.currentTarget;
      var options = {
        model:this.model,
        title:'编辑',
        confirm: '确定',
        content:'page/stat/invoice-detail-edit.hbs',
        isRemote: true,
        target: target
      };
      switch ($(target).attr('class')){
        case 'edit-button cpa-after':
          this.model.options.val = $(target).text();
          break;

        case 'edit-button price-after':
          this.model.options.val = $(target).text().substr(1);
          break;

        case 'edit-button comment':
          this.model.options.isComment = true;
          this.model.options.val = $(target).text() == '编辑' ? '' : $(target).text();
          break;
      }

      var popup = tp.popup.Manager.popup(options);
      popup.on('confirm', this.editPopup_confirmHandler, this);
    },
    editPopup_confirmHandler: function (popup) {
      var val = popup.$('input').val()
         ,target = popup.options.target
         ,ad_id = $(target).closest('tr').attr('id')
         ,product = _.findWhere(this.model.get('products'),{ad_id: ad_id});

      if(val){
        switch ($(target).attr('class')){
          case 'edit-button cpa-after':
            product = _.extend(product,{cpa_after: val});
            break;

          case 'edit-button price-after':
            product = _.extend(product,{quote_rmb_after: val});
            break;

          case 'edit-button comment':
            product = _.extend(product,{remark: val.trim()});
            break;
        }
      }
      this.render();

      if(!this.model.get('init')){
        this.model.save({
          products: this.model.get('products'),
          income: this.model.options.income_after_total,
          income_first: this.model.options.income_before_total
        },{patch:true});
      }
    },
    success_handler: function () {
      window.location ='#/invoice/';
    },
    invoiceButton_clickHandler: function (event) {
      var target = event.currentTarget;
      var start = this.model.get('start');
      var end = this.model.get('end');
      var ad_id = this.$('#ad_table tbody tr').eq(0).attr('id');
      var options = {
        title: target.title,
        id: ad_id,
        confirm: '确定',
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

      if(len){
        popup.$(':checked').each(function (i) {
          if(i + 1 != len){
            ids += $(this).val() + ',';
          } else{
            ids += $(this).val();
          }
        });
        var newModel = new tp.model.InvoiceDetail({
          start:start,
          end:end,
          ids: ids
        });
        newModel.fetch({
          success: function (model,response) {
            var products = response.invoice.products;
            self.model.set('products',products);
            self.render();
            if(!self.model.get('init')){
              self.model.save({products:self.model.get("products")},{patch:true}); //如果是二次编辑，就直接save
            }
          }
        });
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));