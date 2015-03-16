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
    .mapEvent('add-model', tp.controller.addModelCommand);
});