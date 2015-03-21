$(function () {
  var context = Nervenet.createContext()
    , model = new Backbone.Model()
    , body = new tp.view.Body({
      el: 'body',
      model: model
    })
    , table = new tp.component.SmartTable({
      el: 'table'
    });

  // map values
  context
    .mapValue('body', body);
  context
    .inject(body)
    .inject(tp.popup.Manager)
    .inject(tp.component.Manager)
    .mapEvent('add-model', tp.controller.addModelCommand);
});

var count = 0;
tp.MockModel = Backbone.Model.extend({
  save: function (attr, options) {
    attr.id = count;
    this.set(attr);
    count++;
    options.success(null, {
      code: 0,
      msg: '啦啦啦，成功了'
    });
  }
});