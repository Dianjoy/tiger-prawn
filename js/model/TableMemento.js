/**
 * Created by 路佳 on 2015/3/11.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.TableMemento = Backbone.Model.extend({
    RESERVED: ['keyword', 'order', 'seq', 'start', 'end', 'dateFormat'],
    tags: null,
    waiting: false,
    initialize: function () {
      this.key = tp.PROJECT + location.hash;
      var storage = localStorage.getItem(this.key);
      if (storage) {
        storage = _.defaults(this.toJSON(), JSON.parse(storage)); // 需要以当前的参数为主,存储的次之
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
    getTags: function () {
      var tags = this.tags ? this.pick(this.tags) : this.omit(this.RESERVED);
      _.each(tags, function (value, key) {
        tags[key + '_label'] = this.get(key + '_label');
      }, this);
      return tags;
    },
    changeHandler: function () {
      localStorage.setItem(this.key, JSON.stringify(this.omit('page')));
    }
  });
}(Nervenet.createNameSpace('tp.model')));