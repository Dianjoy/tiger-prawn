/**
 * Created by 路佳 on 2015/3/11.
 */
'use strict';
(function (ns) {
  ns.TableMemento = Backbone.Model.extend({
    waiting: false,
    _validate: function (attr, options) {
      if (!('validate' in options)) {
        options.validate = true;
      }
      Backbone.Model.prototype._validate.call(this, attr, options);
    },
    validate: function (attr, options) {
      if (this.waiting || ('ignore' in options && !options.ignore)) {
        return '表格正在更新数据，请稍候。';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));