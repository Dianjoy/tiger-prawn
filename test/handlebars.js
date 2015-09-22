/**
 * Created by meathill on 15/1/29.
 */
QUnit.test('pick', function (assert) {
  var html = '{{pick num "meat" "hill" "haha"}}'
    , html2 = '{{pick num data}}'
    , template = Handlebars.compile(html)
    , template2 = Handlebars.compile(html2)
    , obj = {
      num: 1
    }
    , obj2 = {
      num: 2
    }
    , obj3 = {
      num: 4,
      data: {
        4: 'heihei',
        23: 'jordan'
      }
    }
    , result = template(obj)
    , result2 = template(obj2)
    , result3 = template2(obj3);
  assert.ok(result === 'hill', 'oyeah');
  assert.ok(result2 === 'haha', 'yeah');
  assert.ok(result3 === 'heihei', 'ok');
});

QUnit.test('pick in', function (assert) {
  var html = '{{pick key arr}}'
    , template = Handlebars.compile(html)
    , obj = {
      arr: ['m', 'e', 'a', 't', 'h', 'i', 'l'],
      key: 3
    }
    , result = template(obj);
  assert.ok(result === 't', 'yes');
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

QUnit.test('path', function (assert) {
  var data = {
      prop: 'abc',
      value: 'Hello',
      list: [
        {
          key: 1,
          value: 'a'
        },
        {
          key: 2,
          value: 'b'
        },
        {
          key: 3,
          value: 'c'
        },
        {
          id: 4,
          value: 'd'
        }
      ]
    }
    , template = '[start]' +
      '{{#each list}}' +
      '  <p>' +
      '    {{#if key}}' +
      '      {{../../prop}} | {{key}} {{value}}' +
      '    {{else}}' +
      '      {{../../prop}} | {{id}}-{{value}}' +
      '    {{/if}}' +
      '  </p>' +
      '{{/each}}' +
      '{{#if prop}} {{value}}, world {{/if}}' +
      '[end]'
    , html;
  template = Handlebars.compile(template);
  html = template(data);
  console.log(html);
  assert.ok(html);
});

QUnit.test('readable_n', function (assert) {
  var html = '{{readable_n num}}'
    , template = Handlebars.compile(html)
    , obj = {
      num: null
    }
    , obj2 = {
      num: '1234.567'
    }
    , obj3 = {
      num: -1234.567
    }
    , obj4 = {
      num: 123456
    }
    , result = template(obj)
    , result2 = template(obj2)
    , result3 = template(obj3)
    , result4 = template(obj4);
  assert.ok(result === '0');
  assert.ok(result2 === '1,234.57');
  assert.ok(result3 === '-1,234.57');
  assert.ok(result4 === '123,456');
});