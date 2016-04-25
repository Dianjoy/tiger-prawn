/**
 * Created by 路佳 on 2014/11/15.
 */
'use strict';
(function (ns) {
  var CONFIRM_MSG = '您刚刚上传的包和之前的报名不同，可能有误。您确定要保存么？';

  /**
   * @class
   */
  ns.AD = Backbone.Model.extend({
    $me: null,
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
    initialize: function (attrs, options) {
      Backbone.Model.prototype.initialize.call(this, attrs, options);
      if (this.isNew()) {
        this.urlRoot += 'init';
        this.on('sync', this.syncHandler, this);
      }
    },
    parse: function (response) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
      }
      var has_ad = response.ad && _.isObject(response.ad);
      return has_ad ? response.ad : response;
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
      return _.extend(json, this.options, this.collection ? this.collection.options : null);
    },
    validate: function (attrs) {
      var pack_name = this.get('pack_name');
      if (pack_name && attrs.pack_name !== pack_name && !confirm(CONFIRM_MSG)) {
        return '新包名与之前不一致，请检查后重新上传。';
      }
    },
    syncHandler: function () {
      if ('id' in this.changed) {
        var hash = '#/ad/' + (this.$me.isCP() ? '' : this.id);
        setTimeout(function () {
          location.hash = hash;
        }, 3000);
        this.urlRoot = tp.API + 'ad/';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));