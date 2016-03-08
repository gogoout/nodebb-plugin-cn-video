/**
 * Created by Koan on 2016/3/2.
 */
'use strict';
$(document).ready(function () {
	$(window).on('action:composer.loaded', function (ev, data) {
		$(window).on('action:redactor.load', function (ev, redactor) {
			var postContainer = $('div.composer[id^="cmp-uuid"]'),
				textarea = postContainer.find('textarea');

			redactor.prototype.video = function () {
				return {
					getTemplate: function () {
						return String()
						       + '<div id="redactorModalVideoInsert" class="redactorModalVideoInsert">'
						       + '<div>'
						       + '<input id="videoPath" class="videoPath" type="text" placeholder="请输入视频链接..."/>'
						       + '<div id="videoValid" class="videoValid unvalidVideoPath"></div>'
						       + '</div>'
						       + '<div id="videoContainer" class="videoContainer">'
						       + '<div id="unvalidVedioMsg" class="unvalidVedioMsg">无效的视频网站路径</div>'
						       + '</div>'
						       + '</div>';
					},
					init       : function () {
						var button = this.button.addAfter('image', 'video', this.lang.get('video'));
						this.button.addCallback(button, this.video.show);
					},
					show       : function () {
						this.modal.addTemplate('video', this.video.getTemplate());
						this.modal.load('video', this.lang.get('video'), 700);
						this.modal.createCancelButton();
						var button = this.modal.createActionButton(this.lang.get('insert'));
						button.on('click', this.video.insert);
						this.selection.save();
						this.modal.show();
						$('.videoPath').focus();
						$('.videoPath').on('input', function () {
							var videoPath = $('.videoPath').val();
							if (videoPath.length > 15) {
								videoPath = '<a href="' + videoPath + '">' + videoPath + '</a>';
								socket.emit('plugins.video.parse', {content: videoPath}, function (err, content) {
									if (content != videoPath) {
										var originSrc, newSrc;
										newSrc = $(content).find('iframe,embed').attr('src');
										originSrc = $('#videoContainer').find('iframe,embed') ? $('#videoContainer')
											.find('iframe,embed')
											.attr('src') : "";
										if (newSrc != originSrc) {
											$('#videoContainer').html(content);
											$('#videoValid')
												.removeClass('unvalidVideoPath')
												.addClass('validVideoPath');
										}
									}
									else {
										$('#videoContainer')
											.html('<div id="unvalidVedioMsg" class="unvalidVedioMsg">无效的视频网站路径</div>');
										$('#videoValid').removeClass('validVideoPath').addClass('unvalidVideoPath');
									}
								});
							}
						});
					},
					insert     : function () {
						this.placeholder.remove();
						var target = '';
						var link = $('.videoPath').val();
						var text = $('.videoPath').val();
						this.link.set(text, link, target);
						this.modal.close();
					}
				};
			};

			textarea.redactor({
				focus  : true,
				plugins: ['video']
			});
		});
	});
});