// TDOO remove me when Node.js@6 will be dropped
/* eslint-disable */
if (!Object.entries) {
	Object.entries = function (obj) {
		const ownProps = Object.keys(obj);
		let i = ownProps.length;
		const resArray = new Array({ length: i }); // Preallocate the array

		while (i--) {
			resArray[i] = [ownProps[i], obj[ownProps[i]]];
		}
		return resArray;
	};
}
/* eslint-enable */

module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: {
					node: "current"
				}
			}
		]
	]
};
