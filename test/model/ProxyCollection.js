/**
 * Created by meathill on 2016/9/28.
 */
"use strict";

QUnit.test('event proxy', function (assert) {
  var done = assert.async()
    , proxy = new tp.model.ProxyCollection({
    collectionType: 'tp.model.ListCollection'
  });
  proxy.on('change', function (param) {
    assert.equal(param, 'abc');
    done();
  });
  proxy.on('ready', function () {
    proxy.real.trigger('change', 'abc');
  });
});