/**
 * Created by 路佳 on 2014/11/15.
 */
'use strict';
(function (ns) {
  ns.AD = Backbone.Model.extend({
    className: 'ad ad-edit',
    defaults: {
      ad_type: 0,
      cate: 0,
      cpc_cpa: 'cpa',
      put_net: 0,
      province_type: 0,
      pub_jb: 0,
      put_ipad: 0,
      down_type: 0,
      feedback: 2,
      cycle: 2,
      job_h: 12,
      job_i: 0
    },
    url: tp.API + 'ad/',
    initialize: function (attr, options) {
      if (attr === null) {
        this.isEmpty = true;
        this.url += 'init';
      }
    },
    parse: function (response, options) {
      this.url = this.url.replace('init', '');
      return response.data;
    }
  });
}(Nervenet.createNameSpace('tp.model')));