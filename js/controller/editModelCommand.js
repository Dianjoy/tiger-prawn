/**
 * Created by meathill on 14-3-19.
 */
'use strict';
;(function (ns) {
  var popup;

  function callPopup(model, prop, options) {
    options.model = model;
    options.prop = prop;
    tp.popup.Manager.popupEditor(options);
  }

  ns.editModelCommand = function (model, prop, options) {
    options.value = model.get(prop) || model.get(options.display);
    callPopup(model, prop, options);
  }
}(Nervenet.createNameSpace('tp.controller')));