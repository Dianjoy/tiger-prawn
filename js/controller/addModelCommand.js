/**
 * Created by meathill on 15/3/16.
 */
'use strict';
(function (ns) {
  ns.addModelCommand = function (options) {
    var collection = tp.model.ListCollection.createInstance(null, options)
      , model = new collection.model(null, options);
    options.isRemote = true;
    options.content = tp.path + 'page/' + options.template;
    options.model = model;
    var popup = tp.popup.Manager.popup(options);
    popup.on('confirm', function () {
      collection.add(model, {immediately: true});
    });
  };
}(Nervenet.createNameSpace('tp.controller')));