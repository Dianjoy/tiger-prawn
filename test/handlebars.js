/**
 * Created by meathill on 15/1/29.
 */
QUnit.test('pick', function (assert) {
  var html = '{{pick num "meat" "hill" "haha"}}'
    , template = Handlebars.compile(html)
    , obj = {
      num: 1
    }
    , obj2 = {
      num: 2
    }
    , result = template(obj)
    , result2 = template(obj2);
  assert.ok(result === 'hill', 'oyeah');
  assert.ok(result2 === 'haha', 'yeah');
});

QUnit.test('substring', function (assert) {
  var html = '{{substring name "2" "5"}}'
    , template = Handlebars.compile(html)
    , me = {
        name: 'meathill'
      }
    , result = template(me);
  assert.ok(result === 'athil', 'oyeah');
});

QUnit.test('pick in', function (assert) {
  var html = '{{#pick_in arr}}{{../key}}{{/pick_in}}'
    , template = Handlebars.compile(html)
    , obj = {
      arr: ['m', 'e', 'a', 't', 'h', 'i', 'l'],
      key: 3
    }
    , result = template(obj);
  assert.ok(result === 't', 'yes');
});
