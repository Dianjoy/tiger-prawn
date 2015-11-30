/**
 * Created by meathill on 15/3/16.
 */
'use strict';
(function (ns) {
  ns.addModelCommand = function (options, context) {
    var collection = tp.model.ListCollection.getInstance(options)
      , model = new collection.model(null, options);
    options.isRemote = true;
    options.content = 'page/' + options.template;
    model.options = collection.options;
    model.urlRoot = collection.url;
    model.key = collection.key;
    if (options.name) {
      context.mapValue(options.name, model, true);
    }
    options.model = model;
    var popup = tp.popup.Manager.popup(options);
    popup.on('success', function () {
      collection.add(model, {
        immediately: true,
        prepend: true,
        merge: true
      });
      if (options.name) {
        context.removeValue(options.name);
      }
    });
  };
}(Nervenet.createNameSpace('tp.controller')));