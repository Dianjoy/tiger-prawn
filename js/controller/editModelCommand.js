/**
 * Created by meathill on 14-3-19.
 */
;(function (ns) {
  'use strict';

  var collection
    , params
    , popup;

  function apply(attr) {
    params.model.save(attr, {
      patch: true,
      wait: true,
      success: onSuccess,
      error: onError
    });
  }
  function callPopup(model, options, collection) {
    popup = tp.popup.Manager.popupEditor(model, options, collection);
    if (model) {
      popup.on('submit', onSubmit);
      popup.once('hidden', onHidden);
    }
  }
  function clear() {
    if (collection) {
      collection.off(null, collection_addHandler);
      collection.off(null, collection_resetHandler);
    }
    if (popup) {
      popup.off('submit', onSubmit);
      popup.off('hidden', onHidden);
    }
    collection = params = null;
  }
  function collection_addHandler(model) {
    if (model.get('code') !== 0) {
      onError(model.get('msg'));
    } else {
      apply(_.omit(model.toJSON(), 'id', 'code', 'msg'));
    }
  }
  function collection_resetHandler(collection) {
    if (params) {
      params.options.options = collection.toJSON();
      callPopup(params.model, params.options);
    }
  }
  function onHidden() {
    clear();
  }
  function onSubmit() {
    var value = popup.value()
      , attr = {};
    popup.displayProcessing();
    // 没有选项集，就不需要转化
    if (params.options.type === 'tags' || !collection) {
      attr[params.prop] = value;
      apply(attr);
      return;
    }
    // 用户选择了集合里有的
    if (collection.get(value)) {
      attr[params.prop] = value;
      if (params.options.display) {
        attr[params.options.display] = collection.get(value).get('label');
      }
      apply(attr);
      return;
    }
    // 用户输入了集合里有的
    var model = collection.find(function (model) {
      return model.get('label') === value;
    });
    if (model) {
      attr[params.prop] = model.id;
      attr[params.options.display] = value;
      apply(attr);
      return;
    }
    // 娘滴，真没有，只好新建了
    attr[params.options.display || params.options.prop] = value;
    collection.create(attr, {wait: true});
  }
  function onError(error) {
    console.log(error);
    popup.displayResult(false, '修改失败，请稍后重试', 'fa-frown-o');
    popup.reset();
  }
  function onSuccess () {
    popup.displayResult(true, '修改成功', 'fa-smile-o');
    popup.hide();
  }

  ns.editModelCommand = function (model, prop, options) {
    clear();
    options.prop = prop;
    options.value = model.get(prop) || model.get(options.display);
    params = {
      model: model,
      prop: prop,
      options: options
    };
    // 有可能需要从远程取数据
    if (options.url || options.searchUrl) {
      var init = _.isArray(options.value) ? options.value : null;
      collection = tp.model.ListCollection.createInstance(init, {url: options.url || options.searchUrl});
      if (options.url && options.autoLoad && !init) {
        collection.pagesize = 0;
        collection.on('reset', collection_resetHandler, this);
        collection.on('add', collection_addHandler, this);
        collection.fetch();
        callPopup();
        return;
      }
      callPopup(model, options, collection);
      return;
    }
    callPopup(model, options);
  }
}(Nervenet.createNameSpace('tp.controller')));