/**
 * Created by meathill on 14-3-19.
 */
'use strict';
(function (ns) {
  /**
   *
   * @param {Backbone.Model} model
   * @param {string} prop
   * @param {object} options
   * @param {string} options.commentName 备注的字段名
   */
  function callPopup(model, prop, options) {
    options.model = model;
    options.prop = prop;
    if (options.commentName) {
      options[options.commentName] = model.get(options.commentName);
    }
    tp.popup.Manager.popupEditor(options);
  }

  ns.editModelCommand = function (model, prop, options) {
    options = _.extend({}, options);
    options.value = model.get(prop);
    callPopup(model, prop, options);
  }
}(Nervenet.createNameSpace('tp.controller')));