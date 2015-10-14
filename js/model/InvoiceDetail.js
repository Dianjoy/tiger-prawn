'use strict';
(function (ns) {
  ns.InvoiceDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (attrs) {
      if (this.isNew()) {
        var products = attrs.ids.split(',');
        this.urlRoot += 'init'
          + '?start=' + attrs.start
          + '&end=' + attrs.end
          + '&adids=' + products;
        this.on('sync', this.syncHandler, this);
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
      }
      return response.invoice;
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var previous = this.previousAttributes();
      if (!_.isEmpty(previous)) {
        json.previous = previous;
      }
      var products = json.products;
      var obj = {
        cpa_first_total: 0,
        cpa_after_total: 0,
        income_before_total: 0,
        income_after_total: 0,
        joy_income: 0,
        red_ad_income: 0,
        red_ios_income: 0,
        rmb: ''
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
        } else {
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
        obj.rmb = tp.utils.convertCurrency(obj.income_after_total);
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
      _.extend(this.options, obj);
      return _.extend(json, this.options);
    },
    syncHandler: function () {
      if ('id' in this.changed) {
        var hash = '#/invoice/' + this.id;
        location.hash = hash;
        this.urlRoot = tp.API + 'invoice/';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));