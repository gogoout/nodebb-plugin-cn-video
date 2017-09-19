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
	youku: '<iframe class="youku-plugin" src="http://player.youku.com/embed/$1" ' + VIDEO_FRAME_ATTRS + '></iframe>',
	qq   : '<iframe class="qq-plugin" src="https://v.qq.com/iframe/player.html?vid=$1&auto=0" ' + VIDEO_FRAME_ATTRS + '></iframe>',
//		sohu: '<embed src="http://share.vrs.sohu.com/my/v.swf&topBar=1&id=81762952&autoplay=false&from=page" type="application/x-shockwave-flash"  wmode="Transparent" allowscriptaccess="always" quality="high" ' + VIDEO_FRAME_ATTRS + '/></embed>'
//		sohu : '<iframe class="sohu-plugin" src="http://tv.sohu.com/upload/static/share/share_play.html#$1_$2_0_9001_0" ' + VIDEO_FRAME_ATTRS + '></iframe>',
//	sohu : '<embed src="http://share.vrs.sohu.com/$1/v.swf&topBar=1&autoplay=false&plid=$2&pub_catecode=0&from=page" ' + VIDEO_FRAME_ATTRS + '></embed>',
	sohu : '<embed src="http://share.vrs.sohu.com/$1/v.swf&amp;topBar=1&amp;id=$2&amp;autoplay=false&amp;from=page" ' + VIDEO_FRAME_ATTRS + '></embed>',
	letv : '<embed src="http://i7.imgs.le.com/player/swfPlayer.swf?autoplay=0&id=$1" type="application/x-shockwave-flash" ' + VIDEO_FRAME_ATTRS + '></embed>',
	iqiyi: '<embed src="$1" ' + VIDEO_FRAME_ATTRS + '></embed>',
	sketchfab: '<iframe class="sketchfab-plugin" src="https://sketchfab.com/models/$1/embed?autostart=0" ' + VIDEO_FRAME_ATTRS + '></iframe>'
};
embeds = _(embeds).mapObject(function (value, key) {
	return VIDEO_CONTAINER_START + value + VIDEO_CONTAINER_END;
});

var regexs = {

	tudou    : [
		//http://www.tudou.com/programs/view/(nCGEaJXy-Xg)
		/<a href="(?:http?:\/\/)?www\.tudou\.com\/programs\/view\/()([^\/]*)"[^<]*?>.[^<]*<\/a>/gm,
		//http://www.tudou.com/albumplay/lJ5ODFpiYr8/be6QwcbxIQs.html
		/<a href="(?:http?:\/\/)?www\.tudou\.com\/albumplay\/([^\/]*)\/([^\/]*)\.html(\?.*)?"[^<]*?>.[^<]*<\/a>/gm
	],
	//http://v.youku.com/v_show/id_(XNTExOTQxOTI4).html
	//http://v.youku.com/v_show/id_(XNTExOTQxOTI4==).html
	//http://v.youku.com/v_show/id_(XMTc2MTc5Mzk2NA==).html#paction
	youku    : /<a href="(?:http?:\/\/)?(?:v\.)youku.com\/v_show\/id_([\w\-_=]+)\.html(\?.[^<]*)?(#.[^<]*)?"[^<]*?>.[^<]*<\/a>/gm,
	qq       : [
		//http://v.qq.com/cover/d/dx0qrf7tskzdprn.html?vid=(c0170z7ahr8)
		//http://v.qq.com/x/cover/dx0qrf7tskzdprn.html?vid=(c0170z7ahr8)
		/<a href="(?:https?:\/\/)?v.qq.com(?:\/\w*){1,3}\/\w*.html\?vid=(\w*)(&.*)?"[^<]*?>.[^<]*<\/a>/gm,
		//http://v.qq.com/cover/n/nwpc69jp1freit0/(j0018p8jjv9).html
		//http://v.qq.com/page/n/n/9/(n0157o4ddn9).html
		//http://v.qq.com/boke/page/o/0/9/(o0170u5gah9).html
		//http://v.qq.com/x/page/(o0170u5gah9).html
		/<a href="(?:https?:\/\/)?v.qq.com(?:\/\w*){2,5}\/(\w*).html(\?.*)?"[^<]*?>.[^<]*<\/a>/gm
	],
	sohu     : [
		//http://my.tv.sohu.com/us/(240033200)/(81568145).shtml
		/<a href="(?:http?:\/\/)?(my).tv.sohu.com\/\w+\/\d*\/(\d*)\.shtml(\?.*)?"[^<]*?>.[^<]*<\/a>/gm,
		//http://share.vrs.sohu.com/(2911400)/v.swf&topBar=1&autoplay=false&plid=(9090903)&pub_catecode=0&from=page
		/<a href="(?:http?:)?(?:\/\/)?share.vrs.sohu.com\/(\d*)\/.[^<]*plid=(\d*)[^<]*?>.[^<]*<\/a>/gm
	],
	//http://www.letv.com/ptv/vplay/(23212663).html
	//http://www.letv.com/ptv/vplay/(24720802).html#vid=24720802
	letv : /<a href="(?:http?:\/\/)?www\.le\.com\/ptv\/vplay\/(\d*).html(\?.[^<]*)?(#.[^<]*)?"[^<]*?>.[^<]*<\/a>/gm,
	//(http://player.video.qiyi.com/a8b09f0f71fd62a3feaafbcf622ec768/0/493/v_19rrkxax2c.swf-albumId=455057800-tvId=455057800-isPurchase=0-cnId=7)
	iqiyi    : /<a href="((?:http?:\/\/)?player.video.qiyi.com\/.[^<]*)"[^<]*?>.[^<]*<\/a>/gm,
	//https://sketchfab.com/models/(0561106591244353a3ef573fe4e1f7a8)
	sketchfab: /<a href="(?:https?:\/\/)?sketchfab\.com\/models\/(\w*)">.[^<]*<\/a>/gm
};

VideoParse.parse = function (content, constant, callback) {
//	winston.info('[cn-video] start parsing');
	_(regexs).each(function (regex, key) {
//		winston.info('[cn-video] test ' + key);
		if (!_.isArray(regex)) {
			regex = [regex];
		}
		regex.forEach(function (eachRegex) {
			if (eachRegex.test(content)) {
//				winston.info('[cn-video] test pass: ' + key);
				content = content.replace(eachRegex, constant || embeds[key]);
			}
		})
	});
	callback(null, content);
};

module.exports = VideoParse;