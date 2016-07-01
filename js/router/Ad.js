/**
 * Created by meathill on 14/11/15.
 * router for ads
 */
'use strict';
(function (ns) {
  ns.AD = Backbone.Router.extend({
    $body: null,
    $context: null,
    $me: null,
    routes: {
      "ad(/)": "list",
      "ad/create(/)": "create",
      "agreement/": "listAgreements",
      "ad/:id": "edit",
      "apply/(:id)": "listApplies",
      "channel(/)": "listChannel",
      "channel/:id": "listChannelPrepaid",
      "channel/:id/feedback/": "listChannelFeedback",
      "info/(:query)": "showHistoryInfo",
      "competitor_ad/": "listCompetitorAds",
      "payment/": "listAdPayments"
    },
    create: function () {
      var model = this.$context.createInstance(tp.model.AD)
        , page = this.$me.isCP() ? '_cp' : ''
        , options = {
          className: 'ad ad-new',
          loader: this.$me.isCP() ? null : tp.page.AdEditor
        };
      this.$context.mapValue('ad', model, true);
      this.$body
        .load('page/ad/edit' + page + '.hbs', model, options)
        .setFramework('ad ad-new', '创建投放计划');
    },
    edit: function (id) {
      var model = new tp.model.AD({
        id: id
      });
      this.$body
        .load('page/ad/ad.hbs', model, {
          className: 'ad ad-detail',
          refresh: true
        })
        .setFramework('ad', '{{agreement}} {{channel_alias}} {{ad_name}} {{cid}}', '广告详情', model);
      this.$context.mapValue('model', model);
    },
    list: function () {
      var page = 'page/ad/list' + (this.$me.isCP() ? '_cp.hbs' : '.html')
        , range = moment.createRange()
        , classes = 'ad ad-list' + (this.$me.isCP() ? ' has-date-range' : '');
      range.API = tp.API;
      this.$body
        .load(page, range)
        .setFramework(classes, '我的投放计划');
    },
    listApplies: function () {
      this.$body
        .load('page/ad/apply.html')
        .setFramework('apply', '我的申请');
    },
    listChannel: function () {
      this.$body
        .load('page/channel/list.hbs', {
          API: tp.API
        })
        .setFramework('channel', '我的广告主');
    },
    listChannelFeedback: function (id) {
      var Model = tp.model.Model.extend({
          urlRoot: tp.API + 'channel/'
        })
        , model = new Model({
          API: tp.API,
          id: id
        });
      this.$body.load('page/channel/feedback.hbs', model)
        .setFramework('channel feedback', '设置广告数据反馈');
    },
    listChannelPrepaid: function (id) {
      var Model = tp.model.Model.extend({
          urlRoot: tp.API + 'channel/'
        })
        , model = new Model({
          API: tp.API,
          id: id
        });
      this.$body
        .load('page/channel/prepaid.hbs', model)
        .setFramework('channel prepaid', '广告主预收款明细');
    },
    listCompetitorAds: function () {
      this.$body
        .load('page/ad/competitor.html')
        .setFramework('competitor', '竞品广告状态');
    },
    showHistoryInfo: function (query) {
      var data = {
        query: query,
        API: tp.API
      };
      this.$body
        .load('page/info.hbs', data)
        .setFramework('info', '广告投放情报');
    },
    listAgreements: function () {
      this.$body
        .load('page/agreement/agreement.html')
        .setFramework('agreement', '我的合同');
    },
    listAdPayments: function () {
      this.$body
        .load('page/ad/payment.html')
        .setFramework('agreement has-date-range', '我的回款状况')
    }
  });
}(Nervenet.createNameSpace('tp.router')));