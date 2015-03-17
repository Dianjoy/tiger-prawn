var model = new Backbone.Model({
    'id': 1,
    'name': 'qiujuan',
    'age': 100,
    'sex': 2,
    'status': 0
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
model.urlRoot = 'http://localhost:3000/switch/';
model.options = {
  sex: [{id: 1, label: '男'}, {id: 2, label: '女'}]
};

$('#modal').on('shown.bs.modal', function () {
  $('.switch').focus()
});

QUnit.test('switch', function (assert) {
  context.trigger('edit-model', model, 'status', {
    label: '状态',
    type: 'status'
  });
  var done1 = assert.async();
  var done2 = assert.async();
  setTimeout(function (options) {
    assert.ok($('.model-editor-popup').length === 1, '弹出来了!');
    assert.ok(('input[name="status"]').value !== model.get('status'),'正确')
  },500);
});