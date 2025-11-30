const User = require('../../models/user.model')
const {getUserData} = require('./userSync')

async function deleteLastMessage(ctx, current = false){
	const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id
	if(chat_id && !current){
		const {last_message_id} = await getUserData({chat_id})
		if (last_message_id?.length && last_message_id[0]) {
			for(const message of last_message_id){
				try {
					await ctx.telegram.deleteMessage(chat_id, message);
					await User.updateOne(
						{ chat_id },
						{ last_message_id: [] }
					);
				} catch (e) {
				}
			}
		}
	} else if(chat_id && current && ctx?.message?.message_id) {
		await ctx.telegram.deleteMessage(chat_id, ctx?.message?.message_id);
	}
	return;
}

async function saveLastMessage(ctx, newMessageId) {
	const chat_id = ctx?.message?.chat?.id || ctx.update?.callback_query?.message?.chat?.id
	const {last_message_id} = await getUserData({chat_id})
	
		await User.updateOne(
			{chat_id},
			{
				last_message_id: Array.isArray(last_message_id)
					? [...last_message_id, Number(newMessageId)]
					: [Number(last_message_id), Number(newMessageId)].filter(Boolean)
			}
		);
}

module.exports = {deleteLastMessage,saveLastMessage}