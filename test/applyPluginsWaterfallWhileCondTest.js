var Tapable = require("../lib/Tapable");
var should = require("should");

/* eslint-disable no-undefinedined */

describe("applyPluginsWaterfallWhileCond", function() {
  it("applies all when cond is always true", function() {
    var t = new Tapable();
    var log = [];    

    t.plugin("p", function() { log.push(1); });
    t.plugin("p", function() { log.push(2); });
    t.plugin("p", function() { log.push(3); });

    var result = t.applyPluginsWaterfallWhileCond("p", undefined, function() { return true; });

    should.equal(result, undefined);
    should.deepEqual(log, [1, 2, 3]);
  });
  it("applies none when cond is initially falsey", function() {
    var t = new Tapable();
    var log = [];
    t.plugin("p", function() { log.push(1); });
    var result = t.applyPluginsWaterfallWhileCond("p", undefined, function() { return undefined; });
    should.equal(result, undefined);
    should.deepEqual(log, []);
  });
  it("bails when cond is falsey", function() {
    var t = new Tapable();
    var log = [];

    t.plugin("p", function() { log.push(1); return 2; });
    t.plugin("p", function() { log.push(2); return 3; });
    t.plugin("p", function() { log.push(3); return 4; });
    t.plugin("p", function() { log.push(4); return 5; });

    var result = t.applyPluginsWaterfallWhileCond("p", 1, function(a) { return a < 3; });

    should.equal(result, 3);
    should.deepEqual(log, [1, 2]);
  });
  it("applies all when cond is first falsey for last plugin output", function() {
    var t = new Tapable();
    var log = [];

    t.plugin("p", function() { log.push(1); return 2; });
    t.plugin("p", function() { log.push(2); return 3; });
    t.plugin("p", function() { log.push(3); return 4; });
    t.plugin("p", function() { log.push(4); return 5; });

    var result = t.applyPluginsWaterfallWhileCond("p", 1, function(a) { return a < 5; });

    should.equal(result, 5);
    should.deepEqual(log, [1, 2, 3, 4]);    
  });
  it("returns result of last plugin", function() {
    var t = new Tapable();
    t.plugin("p", function() { return 1; });
    t.plugin("p", function() { return 2; });
    t.plugin("p", function() { return 3; });

    var result = t.applyPluginsWaterfallWhileCond("p", undefined, function() { return true; });

    should.equal(result, 3);
  });
  it("defaults cond to the identity", function() {
    var t = new Tapable();
    var log = [];

    t.plugin("p", function() { log.push(1); return 1; });
    t.plugin("p", function() { log.push(2); return 2; });
    t.plugin("p", function() { log.push(""); return ""; });
    t.plugin("p", function() { log.push(4); return 4; });
    t.plugin("p", function() { log.push(5); return 5; });

    var result = t.applyPluginsWaterfallWhileCond("p", 1);

    should.equal(result, "");
    should.deepEqual(log, [1, 2, ""]);

    t = new Tapable();
    log = [];

    t.plugin("p", function() { log.push(1); return 1; });
    t.plugin("p", function() { log.push(2); return 2; });
    t.plugin("p", function() { log.push(0); return 0; });
    t.plugin("p", function() { log.push(4); return 4; });
    t.plugin("p", function() { log.push(5); return 5; });

    result = t.applyPluginsWaterfallWhileCond("p", 1);

    should.equal(result, 0);
    should.deepEqual(log, [1, 2, 0]);
  });
  it("returns init when there are no plugins", function() {
    var t = new Tapable();
    var result = t.applyPluginsWaterfallWhileCond("p", 3, function() { return true; });
    should.equal(result, 3);
  });
  it("returns init even when cond is initially falsey", function() {
    var t = new Tapable();
    var result = t.applyPluginsWaterfallWhileCond("p", 3, function() { return false; });
    should.equal(result, 3);
  });
  it("passes previous value to next plugin", function() {
    var t = new Tapable();
    var log = [];

    t.plugin("p", function(a) { log.push(a); return 2; });
    t.plugin("p", function(a) { log.push(a); return 3; });
    t.plugin("p", function(a) { log.push(a); return 4; });

    var result = t.applyPluginsWaterfallWhileCond("p", 1, function() { return true; });

    should.equal(result, 4);
    should.deepEqual(log, [1, 2, 3]);
  });
});
