'use strict';
/**
 * Created by gogoout on 15/10/25.
 */
var videoParse = require('./src/videoParse'),
	SocketPlugins = module.parent.require('./socket.io/plugins');

(function (plugin) {
	"use strict";
	plugin.init = function (params, callback) {
		handleSocketIO();
		callback(null);
	};

	plugin.parse = function (data, callback) {
		if (!data || !data.postData || !data.postData.content) {
			return callback(null, data);
		}
		videoParse.parse(data.postData.content, function (err, content) {
			data.postData.content = content;
			callback(null, data);
		});
	};

	function handleSocketIO() {
		SocketPlugins.video = {};

		SocketPlugins.video.parse = function (socket, data, callback) {
			videoParse.parse(data.content, callback);
		};
	}

}(module.exports));