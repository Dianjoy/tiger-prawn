/**
 * Created by chensheng on 15/5/20.
 */
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

QUnit.test('end: more than range', function (assert) {
  var current = '2015-05-01'
    , end = '2015-05-10'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromEnd(current, end) === end, 'passed');
});

QUnit.test('start: in range', function (assert) {
  var current = '2015-05-01'
    , start = '2015-04-25'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromStart(current, start) === current, 'passed');
});

QUnit.test('start: before range', function (assert) {
  var current = '2015-05-01'
    , start = '2015-04-01'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromStart(current, start) === moment(start).add(7,'days').format('YYYY-MM-DD'), 'passed');
});

QUnit.test('start: after end', function (assert) {
  var current = '2015-05-01'
    , start = '2015-05-02'
    , ranger = new tp.page.DateRange({
      el: 'body'
    });
  assert.ok(ranger.getDateFromStart(current, start) === moment(start).add(7,'days').format('YYYY-MM-DD'), 'passed');
});