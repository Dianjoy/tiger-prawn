/**
 * Created by 路佳 on 2014/11/15.
 */
'use strict';
(function (ns) {
  ns.AD = Backbone.Model.extend({
    className: 'ad ad-edit',
    defaults: {
      ad_app_type: 1,
      ad_type: 0,
      cate: 0,
      cpc_cpa: 'cpa',
      put_net: 0,
      province_type: 0,
      put_jb: 0,
      put_ipad: 0,
      net_type: 0,
      down_type: 0,
      feedback: 2,
      cycle: 2
    },
    url: tp.API + 'ad/',
    initialize: function () {
      if (this.isNew()) {
        this.isEmpty = true;
        this.url += 'init';
      }
      this.on('change:id', this.id_changeHandler, this);
    },
    parse: function (response, options) {
      this.url = this.url.replace('init', '');
      this.options = response.options;
      this.options.API = tp.API;
      return response.ad;
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      return _.extend(json, this.options);
    },
    id_changeHandler: function (id) {
      location.hash = '#/ad/' + id;
    }
  });
}(Nervenet.createNameSpace('tp.model')));