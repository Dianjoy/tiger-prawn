'use strict';
(function (ns) {
  ns.ReceiptEditor = tp.view.Loader.extend({
    $context:null,
    products_copy:null,
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
        switch (element.sdk_type) {
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
          this.model.options.val = $(target).text()
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
        collectionId: 'stat',
        confirm: '确定',
        content: "page/stat/choose-ad.hbs",
        isRemote: true,
        start: start,
        end: end
      };
      var collection = tp.model.ListCollection.getInstance(options);

      options.model = collection.get(options.id);

      var popup = tp.popup.Manager.popup(options);

      popup.on('confirm', this.receiptPopup_confirmHandler, this);
    },

    receiptPopup_confirmHandler: function (popup) {
      var products = this.products_copy ? this.products_copy : this.model.get('products');
      var checked = []
        ,unchecked = [];
      if(popup.$(':checked').length){
        popup.$(':checked').each(function () {
          var ad_id = $(this).attr('id');
          var product = _.filter(products,function (product) {
            if(_.isMatch(product,{ad_id:ad_id})){
              return product;
            }
          });
          checked = _.union(checked,product);
          unchecked = _.difference(products,checked);
        });

        this.model.set('products',checked);
        this.render();
        this.products_copy =  _.union(checked,unchecked);

        if(!this.model.options.init){
          this.model.save({products:this.model.get("products")},{patch:true}); //如果是二次编辑，就直接save
        }
      }
      else{
        alert("还未选中任何广告") ;
      }
    },
    convertCurrency: function (currencyDigits) {
// Constants:
      var MAXIMUM_NUMBER = 99999999999.99;
// Predefine the radix characters and currency symbols for output:
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

// Variables:
      var integral; // Represent integral part of digit number.
      var decimal; // Represent decimal part of digit number.
      var outputCharacters; // The output result.
      var parts;
      var digits, radices, bigRadices, decimals;
      var zeroCount;
      var i, p, d;
      var quotient, modulus;

// Validate input string:
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

// Normalize the format of input digits:
      currencyDigits = currencyDigits.replace(/,/g, ""); // Remove comma delimiters.
      currencyDigits = currencyDigits.replace(/^0+/, ""); // Trim zeros at the beginning.
// Assert the number is not greater than the maximum number.
      if (Number(currencyDigits) > MAXIMUM_NUMBER) {
        alert("Too large a number to convert!");
        return "";
      }

// Process the coversion from currency digits to characters:
// Separate integral and decimal parts before processing coversion:
      parts = currencyDigits.split(".");
      if (parts.length > 1) {
        integral = parts[0];
        decimal = parts[1];
        // Cut down redundant decimal digits that are after the second.
        decimal = decimal.substr(0, 2);
      }
      else {
        integral = parts[0];
        decimal = "";
      }
// Prepare the characters corresponding to the digits:
      digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
      radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
      bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
      decimals = new Array(CN_TEN_CENT, CN_CENT);
// Start processing:
      outputCharacters = "";
// Process integral part if it is larger than 0:
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
// Process decimal part if there is:
      if (decimal != "") {
        for (i = 0; i < decimal.length; i++) {
          d = decimal.substr(i, 1);
          if (d != "0") {
            outputCharacters += digits[Number(d)] + decimals[i];
          }
        }
      }
// Confirm and return the final output string:
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