/**
 * Created by 路佳 on 2014/11/15.
 */
'use strict';
(function (ns) {
  var OWNER = 'ad_owner';

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
    urlRoot: tp.API + 'ad/',
    initialize: function () {
      if (this.isNew()) {
        this.isEmpty = true;
        this.urlRoot += 'init';
      }
      this.on('change:id', this.id_changeHandler, this);
    },
    parse: function (response, options) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
      }
      if ('owner' in response.ad && !response.ad.owner) {
        response.ad.owner = Number(localStorage.getItem(OWNER));
      }
      return response.ad;
    },
    save: function (key, value, options) {
      if (key === 'owner' && value) {
        localStorage.setItem(OWNER, value);
      }
      if (key.owner) {
        localStorage.setItem(OWNER, key.owner);
      }
      return Backbone.Model.prototype.save.call(this, key, value, options);
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      return _.extend(json, this.options);
    },
    id_changeHandler: function (model, id) {
      location.hash = '#/ad/' + id;
      this.urlRoot = tp.API + 'ad/';
    }
  });
}(Nervenet.createNameSpace('tp.model')));