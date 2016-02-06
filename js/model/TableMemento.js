/**
 * Created by 路佳 on 2015/3/11.
 */
'use strict';
(function (ns) {
  ns.TableMemento = Backbone.Model.extend({
    waiting: false,
    initialize: function () {
      this.key = tp.PROJECT + location.hash;
      var storage = localStorage.getItem(this.key);
      if (storage) {
        storage = JSON.parse(storage);
        this.set(storage, {silent: true});
      }
      this.on('change', this.changeHandler, this);
    },
    _validate: function (attr, options) {
      if (!('validate' in options)) {
        options.validate = true;
      }
      return Backbone.Model.prototype._validate.call(this, attr, options);
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      return _.omit(json, function (value, key) {
        return /_label$/.test(key);
      });
    },
    validate: function (attr, options) {
      if (this.waiting || ('ignore' in options && !options.ignore)) {
        return '表格正在更新数据，请稍候。';
      }
    },
    changeHandler: function () {
      localStorage.setItem(this.key, JSON.stringify(this.omit('page', 'keyword')));
    }
  });
}(Nervenet.createNameSpace('tp.model')));