'use strict';
(function (ns) {
  ns.InvoiceDetail = Backbone.Model.extend({
    urlRoot: tp.API + 'invoice/',
    initialize: function (attrs) {
      if (this.isNew()) {
        var range = []
          , param = attrs.ids.split(',')
          , products =  _.map(param, function (element) {
            var url = element.split('|')
              , obj = {
                ad_id: url[0],
                start: url[1],
                end: url[2]
              };
            return obj;
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
    fetch: function (options) {
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
      }
      if (response.invoice.products) {
        var android, ios = false;
        _.each(response.invoice.products, function (product) {
          product.ad_app_type == 1 ? android = true : ios = true;
          response.invoice.kind = android && ios ? 2 : !android ? 1 : 0;
        });
      }
      response.invoice.attachment = response.invoice.attachment || '';
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
        , agreementInfo = json.agreement_info
        , archive = Number(agreementInfo.archive) === 1 ? '是' : '否'
        , range = agreementInfo.start + '/' + agreementInfo.end + (agreementInfo.over ? ' 到期' : '')
        , products = json.products
        , obj = {
          ad_income: 0,
          ios_income: 0,
          income_before_total: 0,
          income_after_total: 0,
          rmb: ''
        };
      json.start = start[0] + '年' + start[1] + '月';
      json.agreement_info = {
        company: '客户名称: ' + agreementInfo.company,
        business_license_record: '是否备案营业执照: ' + this.options.business_license_records[agreementInfo.business_license_record],
        company_short: '客户简称: ' + agreementInfo.company_short,
        cycle: '付款周期: ' + agreementInfo.cycle,
        ad_name: '推广产品: ' + agreementInfo.ad_name,
        sign_date: '签约时间: ' + agreementInfo.sign_date,
        rmb: '合作单价: ' + agreementInfo.rmb,
        archive: '是否归档: ' + archive,
        range: '合作期限: ' + range,
        comment: '备注: ' + agreementInfo.comment
      };
      if (json.attachment) {
        json.attachment = _.map(json.attachment.split(','), function (item) {
          var index = item.lastIndexOf('.')
            , type = item.substr(index + 1).toLocaleLowerCase();
          return {
            fileName: item,
            isImage: type === 'jpg' || type === 'png'
          }
        });
      }
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
        var income_type = element.ad_app_type == 1 ? 'ad_income' : 'ios_income';
        obj[income_type] += Number(element.income_after);
        obj.income_after_total += Number(element.income_after);
        obj.income_before_total += Number(element.income);
        obj.rmb = tp.utils.convertCurrency(obj.income_after_total);
        return element;
      });
      this.set({
        income: obj.income_after_total,
        income_first: obj.income_before_total,
        ad_income: obj.ad_income,
        ios_income: obj.ios_income
      }, {silent: true});
      _.extend(this.options, obj);
      return _.extend(json, this.options);
    },
    syncHandler: function () {
      if ('id' in this.changed) {
        var hash = '#/invoice/' + this.id;
        location.hash = hash;
        this.urlRoot = tp.API + 'invoice/';
      }
    },
    onError: function (model, response) {
      var msg = JSON.parse(response.responseText).msg;
      if (confirm(msg)) {
        window.location.hash = '#/invoice/';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));