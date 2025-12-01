const { getUserData, setUserAction } = require('./userSync');
const { sendMessage } = require('./sendMessage');
const { getOptionCourse } = require('./courseSync');
const { findTextButton } = require('./buttonController');
const { selectButton } = require('../keyboards/keyboard');
const User = require('../../models/user.model');

async function handleBack(ctx) {
	try{
		const chat_id = ctx.message.chat.id;
		const user = await getUserData({ chat_id });
		const action = user?.action ? user?.action?.split("_") : [null,null,null,null,null];
		
		const parts = action.split('_');
		
		// Якщо нічого або на першому рівні — повертаємо в головне меню
		if (!action || parts.length === 1) {
			const message = await findTextButton('start_message');
			const button = await selectButton('start_bot');
			await setUserAction({ chat_id, action: '' });
			await sendMessage({ ctx, ...message, button, save: false });
			return;
		}
		
		// Видаляємо останній сегмент
		const newAction = parts.slice(0, -1).join('_');
		await setUserAction({ chat_id, action: newAction });
		
		const newParts = newAction.split('_');
		
		// Повертаємось на рівень courses
		if (newParts.length === 1 && newParts[0] === 'courses') {
			
			const message = await findTextButton('courses_message');
			const button = await selectButton('courses_list');
			await setUserAction({chat_id, action: 'courses'})
			
			await sendMessage({ctx,...message, button, save: true})
		}
		
		// Повертаємось на рівень courses_<categoryId>
		if (newParts.length === 2 && newParts[0] === 'courses') {
			const categoryId = newParts[1];
			const options = await getOptionCourse({ categoryId });
			return sendMessage({
				ctx,
				message: 'Оберіть опцію:',
				button: options.map(o => o.title).concat(['Назад']),
			});
		}
		
		// Інші випадки
		// return sendMessage({
		// 	ctx,
		// 	message: 'Повернуто на попередній рівень.',
		// 	button: ['Назад'],
		// });
	} catch (e) {
		console.error(e)
	}
}

module.exports = { handleBack };
