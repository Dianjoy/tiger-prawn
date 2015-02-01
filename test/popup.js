var model = new Backbone.Model({
    'id': 1,
    'name': 'meathill',
    'age': 30,
    'sex': 1
  })
  , Buttons = Backbone.View.extend({
    events: {
      'click .edit': 'edit_clickHandler'
    },
    edit_clickHandler: function (event) {
      var prop = event.currentTarget.hash.substr(1)
        , options = $(event.currentTarget).data();
      context.trigger('edit-model', model, prop, options);
    }
  })
  , context = Nervenet.createContext()
  , buttons = new Buttons({
    el: '#buttons',
    model: model
  });
context.inject(tp.popup.Manager);
context.mapEvent('edit-model', tp.controller.editModelCommand);
tp.path = '../';
model.urlRoot = 'http://localhost:3000/popup/';
model.options = {
  sex: [{id: 1, label: '男'}, {id: 2, label: '女'}]
};

QUnit.test('popup', function (assert) {
  context.trigger('edit-model', model, 'name', {
    label: '名字'
  });
  var done1 = assert.async();
  var done2 = assert.async();
  setTimeout(function () {
    assert.ok($('.model-editor-popup').length === 1, 'popup!');
    assert.ok($('.model-editor-popup table').length === 1, 'info in it');
  }, 0);
});