	const User = require('../../models/user.model')
	const {deleteLastMessage, saveLastMessage} = require('./deleteLastMessage')
	const {audioConvert} = require('./audioConvert')
	
	function resolveSource(input) {
		if (!input) return null;
		
		if (/^https?:\/\//i.test(input)) {
			return { url: input };
		}
		
		return { file_id: input };
	}
	
	async function sendMessage({ ctx, image, video, audio, message, button, save = false }) {
		try {
			const imageSource = resolveSource(image);
			const videoSource = resolveSource(video);
			const audioSource = resolveSource(audio);
			
			let sentMessage = null;

			if (imageSource && !videoSource) {
				if(message?.length <= 768){
					sentMessage = await ctx.replyWithPhoto(
						imageSource.file_id,
						{
							caption: message || '',
							parse_mode: 'HTML',
							reply_markup: button,
							disable_web_page_preview: true, one_time_keyboard: true
						}
					);
				} else {
					const {message_id} = await ctx.replyWithPhoto(
						imageSource.file_id,
						{
							parse_mode: 'HTML'
						}
					);
					
					sentMessage = await ctx.replyWithHTML(message, {disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button});
					await deleteLastMessage(ctx)
					
					if(save){
						await saveLastMessage(ctx, message_id)
					}
				}
			}
			else if (!imageSource && videoSource) {
				if (message?.length <= 768) {
					sentMessage = await ctx.replyWithVideo(
						videoSource.file_id,
						{
							caption: message || '',
							parse_mode: 'HTML',
							reply_markup: button,
							disable_web_page_preview: true, one_time_keyboard: true
						}
					);
					await deleteLastMessage(ctx)
				} else {
					const {message_id} = await ctx.replyWithVideo(
						videoSource.file_id,
						{
							caption: message || '',
							parse_mode: 'HTML',
							reply_markup: button,
							disable_web_page_preview: true, one_time_keyboard: true
						}
					);
					sentMessage = await ctx.replyWithHTML(message, {disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button});
					
					await deleteLastMessage(ctx)
					
					if (save) {
						await saveLastMessage(ctx, message_id)
					}
				}
			}
			else if (audioSource && !imageSource && !videoSource) {
					const {message_id} = await ctx.replyWithVoice(audioSource.file_id);
					
					sentMessage = await ctx.replyWithHTML(message, {disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button});
					
				await deleteLastMessage(ctx)
				
				if (save) {
					await saveLastMessage(ctx, message_id)
				}
			}
			else if (!imageSource && !videoSource && message) {
				sentMessage = await ctx.replyWithHTML(message, {disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button});
				await deleteLastMessage(ctx)
			}
			else if (imageSource && videoSource) {
				if (message?.length <= 768) {
					const {message_id} = await ctx.replyWithVideo(
						videoSource.file_id,
						{parse_mode: 'HTML', disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button}
					);
					sentMessage = await ctx.replyWithPhoto(
						imageSource.file_id,
						{caption: message || '', parse_mode: 'HTML', disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button}
					);
					await deleteLastMessage(ctx)
					if (save) {
						await saveLastMessage(ctx, message_id)
					}
				} else{
					const sendVideo = await ctx.replyWithVideo(
						videoSource.file_id,
						{parse_mode: 'HTML', disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button}
					);
					const sendPhoto = await ctx.replyWithPhoto(
						imageSource.file_id,
						{caption: message || '', parse_mode: 'HTML', disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button}
					);
					sentMessage = await ctx.replyWithHTML(message, {disable_web_page_preview: true, one_time_keyboard: true, reply_markup: button});
					await deleteLastMessage(ctx)
					if (save) {
						await saveLastMessage(ctx, sendPhoto?.message_id)
						await saveLastMessage(ctx, sendVideo?.message_id)
					}
				}
				
			}
			else {
				console.warn('Немає контенту для відправки');
			}
	
			if (save) {
				await saveLastMessage(ctx, sentMessage?.message_id)
			}
			
			return sentMessage;
			
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	
	async function sendMessageDefault({ bot, chat_id, image, video, audio, message, button, save = false }) {
		try {
			const imageSource = resolveSource(image);
			const videoSource = resolveSource(video);
			const audioSource = resolveSource(audio);
			
			let sentMessage = null;
			
			if (imageSource && !videoSource) {
				if (message?.length <= 768) {
					sentMessage = await bot.telegram.sendPhoto(
						chat_id,
						imageSource.file_id,
						{
							caption: message || '',
							parse_mode: 'HTML',
							reply_markup: button,
							disable_web_page_preview: true, one_time_keyboard: true
						}
					);
				} else {
					const photoMsg = await bot.telegram.sendPhoto(chat_id, imageSource.file_id, { parse_mode: 'HTML' });
					sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					
					await deleteLastMessage(bot, chat_id);
					
					if (save) {
						await saveLastMessage(bot, chat_id, photoMsg.message_id);
					}
				}
			} else if (!imageSource && videoSource) {
				if (message?.length <= 768) {
					sentMessage = await bot.telegram.sendVideo(
						chat_id,
						videoSource.file_id,
						{ caption: message || '', parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true }
					);
					await deleteLastMessage(bot, chat_id);
				} else {
					const videoMsg = await bot.telegram.sendVideo(chat_id, videoSource.file_id, { caption: message || '', parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					
					await deleteLastMessage(bot, chat_id);
					
					if (save) {
						await saveLastMessage(bot, chat_id, videoMsg.message_id);
					}
				}
			} else if (audioSource && !imageSource && !videoSource) {
				const audioMsg = await bot.telegram.sendVoice(chat_id, audioSource.file_id);
				sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
				
				await deleteLastMessage(bot, chat_id);
				
				if (save) {
					await saveLastMessage(bot, chat_id, audioMsg.message_id);
				}
			} else if (!imageSource && !videoSource && message) {
				sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
				await deleteLastMessage(bot, chat_id);
			} else if (imageSource && videoSource) {
				if (message?.length <= 768) {
					const videoMsg = await bot.telegram.sendVideo(chat_id, videoSource.file_id, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					const photoMsg = await bot.telegram.sendPhoto(chat_id, imageSource.file_id, { caption: message || '', parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					
					await deleteLastMessage(bot, chat_id);
					
					if (save) {
						await saveLastMessage(bot, chat_id, photoMsg.message_id);
						await saveLastMessage(bot, chat_id, videoMsg.message_id);
					}
				} else {
					const videoMsg = await bot.telegram.sendVideo(chat_id, videoSource.file_id, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					const photoMsg = await bot.telegram.sendPhoto(chat_id, imageSource.file_id, { caption: message || '', parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					sentMessage = await bot.telegram.sendMessage(chat_id, message, { parse_mode: 'HTML', reply_markup: button, disable_web_page_preview: true, one_time_keyboard: true });
					
					await deleteLastMessage(bot, chat_id);
					
					if (save) {
						await saveLastMessage(bot, chat_id, photoMsg.message_id);
						await saveLastMessage(bot, chat_id, videoMsg.message_id);
					}
				}
			} else {
				console.warn('Немає контенту для відправки');
			}
			
			if (save) {
				await saveLastMessage(bot, chat_id, sentMessage?.message_id);
			}
			
			return sentMessage;
			
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	
	module.exports = { sendMessage, sendMessageDefault };