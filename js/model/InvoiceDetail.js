'use strict';
(function (ns) {
  ns.InvoiceDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (attrs) {
      if (this.isNew()) {
        var range = []
          , param = attrs.ids.split(',')
          , products =  _.map(param, function (element) {
            return tp.utils.decodeURLParam(element);
        });
        _.each(products, function (element) {
          var sameRange =  _.find(range, {start: element.start, end: element.end})
            , obj = {
              start: element.start,
              end: element.end,
              ad_ids: [element.ad_id]
            };
          if (!sameRange) {
            range.push(obj);
          } else if (!_.contains(sameRange.ad_ids, element.ad_id)) {
            sameRange.ad_ids.push(element.ad_id);
          }
        });
        this.urlRoot += 'init'
          + '?adids=' + JSON.stringify({range: range});
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
      var start = json.start ? json.start.split('-') : moment().format('YYYY-MM').split('-')
        , agreementInfo = _.pick(json, 'company', 'company_short', 'cycle', 'ad_name', 'sign_date', 'rmb', 'agreement_comment');
      json.start = start[0] + '年' + start[1] + '月';
      json.agreement_info = _.map(agreementInfo, function(element, key) {
        switch (key) {
          case 'company':
            element = '客户名称: ' + element;
            break;
          case 'company_short':
            element = '客户简称: ' + element;
            break;
          case 'cycle':
            element = '付款周期: ' + element;
            break;
          case 'ad_name':
            element = '推广产品: ' + element;
            break;
          case 'sign_date':
            element = '签约时间: ' + element;
            break;
          case 'rmb':
            element = '合作单价: ' + element;
            break;
          case 'agreement_comment':
            element = '备注: ' + element;
            break;
        }
        return element;
      });
      var products = json.products
        , obj = {
          cpa_first_total: 0,
          cpa_after_total: 0,
          income_before_total: 0,
          income_after_total: 0,
          rmb: ''
        };
      products = _.map(products, function (element) {
        if (!element.quote_rmb_after) {
          _.extend(element, {
            quote_rmb_after: element.quote_rmb,
            cpa_after: element.cpa,
            income_after: element.income,
            rate: (1 - element.cpa * element.quote_rmb / element.income) * 100,
            money_cut: element.income - element.income,
            remark: ''
          });
        } else {
          _.extend(element, {
            income_after: (element.quote_rmb_after * element.cpa_after),
            rate: (1 - element.cpa_after * element.quote_rmb_after / element.income) * 100,
            money_cut: (element.income - element.quote_rmb_after * element.cpa_after)
          });
        }
        obj.cpa_first_total += Number(element.cpa);
        obj.cpa_after_total += Number(element.cpa_after);
        obj.income_after_total += Number(element.income_after);
        obj.income_before_total += Number(element.income);
        obj.rmb = tp.utils.convertCurrency(obj.income_after_total);
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