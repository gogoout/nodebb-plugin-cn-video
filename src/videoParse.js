/**
 * Created by Koan on 2016/3/2.
 */
var VideoParse = {};

var nodebb = require('./nodebb'),
	_ = nodebb.underscore;
//	winston = nodebb.winston;

var VIDEO_CONTAINER_START = '<div class="video-container">',
	VIDEO_CONTAINER_END = '</div>',
	VIDEO_FRAME_ATTRS = 'allowtransparency="true" allowfullscreen="true"  scrolling="no" border="0" frameborder="0"';


var embeds = {
	tudou: '<iframe class="tudou-plugin" src="http://www.tudou.com/programs/view/html5embed.action?type=0&code=$2&lcode=$1&resourceId=339959839_06_05_99" ' + VIDEO_FRAME_ATTRS + '></iframe>',
	youku: '<iframe class="youku-plugin" src="http://player.youku.com/player.php/sid/$1==/v.swf" ' + VIDEO_FRAME_ATTRS + '></iframe>',
	qq   : '<iframe class="qq-plugin" src="http://v.qq.com/iframe/player.html?vid=$1&tiny=0&auto=0" ' + VIDEO_FRAME_ATTRS + '></iframe>',
//		sohu: '<embed src="http://share.vrs.sohu.com/my/v.swf&topBar=1&id=81762952&autoplay=false&from=page" type="application/x-shockwave-flash"  wmode="Transparent" allowscriptaccess="always" quality="high" ' + VIDEO_FRAME_ATTRS + '/></embed>'
//		sohu : '<iframe class="sohu-plugin" src="http://tv.sohu.com/upload/static/share/share_play.html#$1_$2_0_9001_0" ' + VIDEO_FRAME_ATTRS + '></iframe>',
	sohu : '<embed src="http://share.vrs.sohu.com/$1/v.swf&topBar=1&autoplay=false&plid=$2&pub_catecode=0&from=page" ' + VIDEO_FRAME_ATTRS + '></embed>',
	letv : '<embed src="http://i7.imgs.letv.com/player/swfPlayer.swf?autoplay=0&id=$1" type="application/x-shockwave-flash" ' + VIDEO_FRAME_ATTRS + '></embed>',
	iqiyi: '<embed src="$1" ' + VIDEO_FRAME_ATTRS + '></embed>'
};
embeds = _(embeds).mapObject(function (value, key) {
	return VIDEO_CONTAINER_START + value + VIDEO_CONTAINER_END;
});

var regexs = {

	tudou: [
		//http://www.tudou.com/programs/view/(nCGEaJXy-Xg)
		/<a href="(?:http?:\/\/)?www\.tudou\.com\/programs\/view\/([^\/]*)\/.[^<]*<\/a>/gm,
		//http://www.tudou.com/albumplay/lJ5ODFpiYr8/be6QwcbxIQs.html
		/<a href="(?:http?:\/\/)?www\.tudou\.com\/albumplay\/([^\/]*)\/([^\/]*)\.html(\?.*)?"[^<]*?>.[^<]*<\/a>/gm
	],
	//http://v.youku.com/v_show/id_(XNTExOTQxOTI4).html
	//http://v.youku.com/v_show/id_(XNTExOTQxOTI4==).html
	youku: /<a href="(?:http?:\/\/)?(?:v\.)youku.com\/v_show\/id_([\w\-_=]+)\.html(\?.[^<]*)?"[^<]*?>.[^<]*<\/a>/gm,
	qq   : [
		//http://v.qq.com/cover/d/dx0qrf7tskzdprn.html?vid=(c0170z7ahr8)
		/<a href="(?:http?:\/\/)?v.qq.com\/cover\/\w\/\w*.html\?vid=(\w*)(&.*)?"[^<]*?>.[^<]*<\/a>/gm,
		//http://v.qq.com/cover/n/nwpc69jp1freit0/(j0018p8jjv9).html
		//http://v.qq.com/page/n/n/9/(n0157o4ddn9).html
		//http://v.qq.com/boke/page/o/0/9/(o0170u5gah9).html
		/<a href="(?:http?:\/\/)?v.qq.com(?:\/\w*){3,5}\/(\w*).html(\?.*)?"[^<]*?>.[^<]*<\/a>/gm
	],
	sohu : [
		//http://my.tv.sohu.com/us/(240033200)/(81568145).shtml
		/<a href="(?:http?:\/\/)?my.tv.sohu.com\/\w+\/(\d*)\/(\d*)\.shtml(\?.*)?"[^<]*?>.[^<]*<\/a>/gm,
		//http://share.vrs.sohu.com/(2911400)/v.swf&topBar=1&autoplay=false&plid=(9090903)&pub_catecode=0&from=page
		/<a href="(?:http?:\/\/)?share.vrs.sohu.com\/(\d*)\/.[^<]*plid=(\d*)[^<]*?>.[^<]*<\/a>/gm
	],
	letv : [
		//http://www.letv.com/ptv/vplay/(23212663).html
		/<a href="(?:http?:\/\/)?www\.letv\.com\/ptv\/vplay\/(\d*).html(\?.[^<]*)?"[^<]*?>.[^<]*<\/a>/gm,
		//http://www.letv.com/ptv/vplay/(24720802).html#vid=24720802
		/<a href="(?:http?:\/\/)?www\.letv\.com\/ptv\/vplay\/(\d*).html(#.[^<]*)?"[^<]*?>.[^<]*<\/a>/gm
	],
	//(http://player.video.qiyi.com/a8b09f0f71fd62a3feaafbcf622ec768/0/493/v_19rrkxax2c.swf-albumId=455057800-tvId=455057800-isPurchase=0-cnId=7)
	iqiyi: /<a href="((?:http?:\/\/)?player.video.qiyi.com\/.[^<]*)"[^<]*?>.[^<]*<\/a>/gm
};

VideoParse.parse = function (content, callback) {
//	winston.info('[cn-video] start parsing');
	_(regexs).each(function (regex, key) {
//		winston.info('[cn-video] test ' + key);
		if (!_.isArray(regex)) {
			regex = [regex];
		}
		regex.forEach(function (eachRegex) {
			if (eachRegex.test(content)) {
//				winston.info('[cn-video] test pass: ' + key);
				content = content.replace(eachRegex, embeds[key]);
			}
		})
	});
	callback(null, content);
};

module.exports = VideoParse;