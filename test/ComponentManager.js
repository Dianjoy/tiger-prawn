var context = Nervenet.createContext()
  , model = new Backbone.Model();
context.inject(tp.component.Manager);
tp.component.Manager.check($('#check-me'), model);

QUnit.test('date-time-picker', function (assert) {
  var today = moment().format('YYYY-MM-DD');
  assert.ok($('.datetimepicker').val() === today);
});