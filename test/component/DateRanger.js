/**
 * Created by meathill on 16/9/1.
 */
"use strict";
QUnit.test('start,end', function (assert) {
  var dateFormat = tp.component.DateRanger.prototype.formatDate;
  assert.deepEqual(dateFormat(0), dateFormat(0));
  assert.deepEqual(dateFormat(-1), dateFormat(-1));
});