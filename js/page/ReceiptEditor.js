'use strict';
(function (ns) {
  ns.ReceiptEditor = tp.view.Loader.extend({
    $context:null,
    events: {
      'click .edit': 'edit_clickHandler',
      'click .edit-button': 'editButton_clickHandler',
      'click .receipt-button': 'receiptButton_clickHandler',
      'click #reapply-button': 'reapplyButton_clickHandler',
      'success':'success_handler'
    },
    render: function () {
      var self =this;
      var opt = this.model.options;
      var products = this.model.get('products');
      var cpa_first_total = 0
         ,cpa_after_total =0
         ,income_before_total = 0
         ,income_after_total = 0
         ,rmb = ''
         ,joy_income = 0
         ,red_ad_income = 0
         ,red_ios_income = 0;

      _.each(products,function (element) {
        if(!element.quote_rmb_after){
          _.extend(element,{
            quote_rmb_after:element.quote_rmb,
            cpa_after:element.cpa,
            income_after:element.income,
            rate: ((1 - element.cpa * element.quote_rmb/element.income)*100).toFixed(2),
            money_cut:element.income - element.income,
            remark:''
          });
        }
        else{
          _.extend(element,{
            income_after: element.quote_rmb_after * element.cpa_after,
            rate: ((1 - element.cpa_after * element.quote_rmb_after / element.income) * 100).toFixed(2),
            money_cut: element.income - element.quote_rmb_after * element.cpa_after
          })
        }

        cpa_first_total += Number(element.cpa);
        cpa_after_total += Number(element.cpa_after);
        income_after_total += element.income_after;
        income_before_total += element.income;
        rmb = self.convertCurrency(income_after_total);

        switch (element.sdk_type){
          case "0":
            joy_income += element.income_after;
            break;
          case "1":
            red_ad_income += element.income_after;
            break;
          case "2":
            red_ios_income += element.income_after;
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

      var smartTable = this.$context.createInstance(tp.component.SmartTable,{el:this.$('#ad_table')});
      smartTable.collection.model.prototype.toJSON = function () {
        var json = Backbone.Model.prototype.toJSON.call(this);
        _.extend(json,opt);
        return json;
      };

      products.push({rmb:rmb});
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
        content:'page/stat/receipt-detail-edit.hbs',
        isRemote: true,
        target: target,
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
          this.model.options.val = $(target).text();
          break;
      }

      var popup = tp.popup.Manager.popup(options);
      popup.on('confirm', this.editPopup_confirmHandler, this);
    },
    editPopup_confirmHandler: function (popup) {
      var val = popup.$('input').val()
         ,target = popup.options.target
         ,index = $(target).closest('tr').attr('id')
         ,product = _.findWhere(this.model.get('products'),{id:index});

      if(val){
        switch ($(target).attr('class')){
          case 'edit-button cpa-after':
            product = _.extend(product,{cpa_after:val});
            break;

          case 'edit-button price-after':
            product = _.extend(product,{quote_rmb_after:val});
            break;

          case 'edit-button comment':
            product = _.extend(product,{remark:val});
            break;
        }
      }

      this.render();

      if(!this.model.options.init){
        this.model.save({products:this.model.get('products')},{patch:true});
      }
    },
    success_handler: function () {
      window.location ='#/receipt/';
    },
    receiptButton_clickHandler: function (event) {
      var target = event.currentTarget;
      var ad_id = this.$('.ad_id').attr('id');
      var start = this.model.get('start');
      var end = this.model.get('end');
      var options = {
        title: target.title,
        id: ad_id,
        confirm: '确定',
        content: "page/stat/choose-ad.hbs",
        isRemote: true,
        start: start,
        end: end
      };


      var popup = tp.popup.Manager.popup(options);
      popup.on('confirm', this.receiptPopup_confirmHandler, this);
    },

    receiptPopup_confirmHandler: function (popup) {
      var ids = ""
        ,channel = ""
        ,agreement = ""
        ,start = this.model.get('start')
        ,end = this.model.get('end')
        ,len = popup.$(':checked').length
        ,self = this;

      if(len){
        popup.$(':checked').each(function (i) {
          if(i + 1 != len){
            ids += $(this).attr('id') + ',';
          }
          else{
            ids += $(this).attr('id');
            channel = $(this).data('channel');
            agreement = $(this).data('agreement');
          }

        });

        var newModel = new tp.model.ReceiptDetail({
          start:start,
          end:end,
          channel_id:channel,
          agreement_id:agreement,
          ids: ids
        });
        newModel.fetch({
          success: function (model,response) {
            var products = response.invoice.products;
            self.model.set('products',products);
            self.render();
            if(!self.model.options.init){
              self.model.save({products:self.model.get("products")},{patch:true}); //如果是二次编辑，就直接save
            }
          }
        });
      }
      else{
        alert("还未选中任何广告") ;
      }
    },
    convertCurrency: function (currencyDigits) {
      var MAXIMUM_NUMBER = 99999999999.99;
      var CN_ZERO = "零";
      var CN_ONE = "壹";
      var CN_TWO = "贰";
      var CN_THREE = "叁";
      var CN_FOUR = "肆";
      var CN_FIVE = "伍";
      var CN_SIX = "陆";
      var CN_SEVEN = "柒";
      var CN_EIGHT = "捌";
      var CN_NINE = "玖";
      var CN_TEN = "拾";
      var CN_HUNDRED = "佰";
      var CN_THOUSAND = "仟";
      var CN_TEN_THOUSAND = "万";
      var CN_HUNDRED_MILLION = "亿";
      var CN_DOLLAR = "元";
      var CN_TEN_CENT = "角";
      var CN_CENT = "分";
      var CN_INTEGER = "整";

      var integral;
      var decimal;
      var outputCharacters;
      var parts;
      var digits, radices, bigRadices, decimals;
      var zeroCount;
      var i, p, d;
      var quotient, modulus;

      currencyDigits = currencyDigits.toString();
      if (currencyDigits == "") {
        alert("Empty input!");
        return "";
      }
      if (currencyDigits.match(/[^,.\d]/) != null) {
        alert("Invalid characters in the input string!");
        return "";
      }
      if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
        alert("Illegal format of digit number!");
        return "";
      }

      currencyDigits = currencyDigits.replace(/,/g, "");
      currencyDigits = currencyDigits.replace(/^0+/, "");
      if (Number(currencyDigits) > MAXIMUM_NUMBER) {
        alert("Too large a number to convert!");
        return "";
      }

      parts = currencyDigits.split(".");
      if (parts.length > 1) {
        integral = parts[0];
        decimal = parts[1];

        decimal = decimal.substr(0, 2);
      }
      else {
        integral = parts[0];
        decimal = "";
      }

      digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
      radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
      bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
      decimals = new Array(CN_TEN_CENT, CN_CENT);

      outputCharacters = "";

      if (Number(integral) > 0) {
        zeroCount = 0;
        for (i = 0; i < integral.length; i++) {
          p = integral.length - i - 1;
          d = integral.substr(i, 1);
          quotient = p / 4;
          modulus = p % 4;
          if (d == "0") {
            zeroCount++;
          }
          else {
            if (zeroCount > 0)
            {
              outputCharacters += digits[0];
            }
            zeroCount = 0;
            outputCharacters += digits[Number(d)] + radices[modulus];
          }
          if (modulus == 0 && zeroCount < 4) {
            outputCharacters += bigRadices[quotient];
          }
        }
        outputCharacters += CN_DOLLAR;
      }

      if (decimal != "") {
        for (i = 0; i < decimal.length; i++) {
          d = decimal.substr(i, 1);
          if (d != "0") {
            outputCharacters += digits[Number(d)] + decimals[i];
          }
        }
      }

      if (outputCharacters == "") {
        outputCharacters = CN_ZERO + CN_DOLLAR;
      }
      if (decimal == "") {
        outputCharacters += CN_INTEGER;
      }
      outputCharacters = outputCharacters;
      return outputCharacters;
    }
  });
}(Nervenet.createNameSpace('tp.page')));