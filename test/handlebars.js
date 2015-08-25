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