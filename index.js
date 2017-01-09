'use strict';
/**
 * Created by gogoout on 15/10/25.
 */
var videoParse = require('./src/videoParse'),
	SocketPlugins = require.main.require('./src/socket.io/plugins');

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
		videoParse.parse(data.postData.content, null, function (err, content) {
			data.postData.content = content;
			callback(null, data);
		});
	};

	plugin.parseToConstant = function (content, constant, callback) {
		if(!content){
			return callback(null, content);
		}
		videoParse.parse(content, constant, function (err, content) {
			callback(null, content);
		});
	}

	function handleSocketIO() {
		SocketPlugins.video = {};

		SocketPlugins.video.parse = function (socket, data, callback) {
			videoParse.parse(data.content, null, callback);
		};
	}

}(module.exports));