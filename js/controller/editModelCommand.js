/**
 * Created by meathill on 14-3-19.
 */
'use strict';
(function (ns, _) {
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
    options.API = tp.API;
    if (options.commentName) {
      options[options.commentName] = model.get(options.commentName);
    }
    tp.popup.Manager.popupEditor(options);
  }

  ns.editModelCommand = function (model, prop, options) {
    options = _.extend({
      API: tp.API
    }, options);
    options.value = options.defaultValue ? options.defaultValue : model.get(prop);
    callPopup(model, prop, options);
  }
}(Nervenet.createNameSpace('tp.controller'), _));