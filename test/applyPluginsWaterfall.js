var Tapable = require("../lib/Tapable");
var should = require("should");

/**
 * Function designed to return a plugin handler.
 * With applyPluginsWaterfall, each plugin handler
 * has some expected arguments it will receive and an
 * optional return value. This function produces plugin
 * handler functions that perform expected arg checks and
 * returns some value (implicitly undefined if none specified).
 */
function makeTestPlugin(expectedArgs, returnVal) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		args.should.be.eql(expectedArgs);
		return returnVal;
	}
}

describe("applyPluginsWaterfall", function() {

	it("should call all handlers", function() {
		var runningSum = 0;
		var tapable = new Tapable();

		tapable.plugin('plugin', function() {
			runningSum++;
		});

		tapable.plugin('plugin', function() {
			runningSum++;
		});

		tapable.plugin('plugin', function() {
			runningSum++;
		});

		tapable.applyPluginsWaterfall('plugin');
		runningSum.should.be.eql(3);
	});

	it("should call first handler with init value", function() {
		var tapable = new Tapable();
		var pluginHandler = makeTestPlugin(['initValue']);

		tapable.plugin('plugin', pluginHandler);
		tapable.applyPluginsWaterfall('plugin', 'initValue');
	});

	it("should call subsequent handlers with previous handler return value", function() {
		var tapable = new Tapable();

		var pluginHandler1 = makeTestPlugin(['initValue'], 'handler1Return');
		var pluginHandler2 = makeTestPlugin(['handler1Return'], 'handler2Return');
		var pluginHandler3 = makeTestPlugin(['handler2Return'], 'handler3Return');
		var pluginHandler4 = makeTestPlugin(['handler3Return']);

		tapable.plugin('plugin', pluginHandler1);
		tapable.plugin('plugin', pluginHandler2);
		tapable.plugin('plugin', pluginHandler3);
		tapable.plugin('plugin', pluginHandler4);

		tapable.applyPluginsWaterfall('plugin', 'initValue');
	});

	it("should call subsequent handlers with original arguments", function() {
		var tapable = new Tapable();
		var allArgs = ['plugin', 'initValue', 'sharedArg1', 'sharedArg2', 'sharedArg3'];
		var sharedArgs = allArgs.slice(2); // arguments that each plugin handler will get

		var pluginHandler1 = makeTestPlugin(allArgs.slice(1), 'handler1Return');
		var pluginHandler2 = makeTestPlugin(['handler1Return'].concat(sharedArgs), 'handler2Return');
		var pluginHandler3 = makeTestPlugin(['handler2Return'].concat(sharedArgs), 'handler3Return');
		var pluginHandler4 = makeTestPlugin(['handler3Return'].concat(sharedArgs));

		tapable.plugin('plugin', pluginHandler1);
		tapable.plugin('plugin', pluginHandler2);
		tapable.plugin('plugin', pluginHandler3);
		tapable.plugin('plugin', pluginHandler4);

		// Calling apply to simulate ...spreadOperator
		tapable.applyPluginsWaterfall.apply(tapable, allArgs);
	});

});
