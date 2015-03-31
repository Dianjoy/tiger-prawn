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
    model.options = collection.options;
    model.urlRoot = collection.url;
    options.model = model;
    var popup = tp.popup.Manager.popup(options);
    popup.on('success', function () {
      collection.add(model, {
        immediately: true,
        prepend: true
      });
    });
  };
}(Nervenet.createNameSpace('tp.controller')));