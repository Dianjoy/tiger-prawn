QUnit.test('hello world', function (assert) {
  assert.ok(true, 'passed');
});

QUnit.test('end: in range', function (assert) {
  var current = '2015-05-01'
    , end = '2015-05-04'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromEnd(current, end) === current, 'passed');
});

QUnit.test('end: before start', function (assert) {
  var current = '2015-05-01'
    , end = '2015-04-28'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromEnd(current, end) === end, 'passed');
});