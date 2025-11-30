const MessagesTemplate = require('../../models/messages.model');

async function findTextButton(command) {
	try {
		const findMessage = await MessagesTemplate.findOne(
			{
				$or: [
					{ command },
					{ message: command }
				]
			},
			{ message: 1, audio: 1, video: 1, image: 1, _id: 0 }
		).lean();
		
		if (!findMessage) return null;
		
		Object.keys(findMessage).forEach(key => {
			const value = findMessage[key];
			if (value === null || value === undefined || value === '') {
				delete findMessage[key];
			}
		});
		
		return findMessage;
		
	} catch (e){
		console.error(e)
		return { message: "Виникла невідома помилка" }
	}
}

async function findControllerTextButton(command) {
	try {
		const findMessage = await MessagesTemplate.findOne(
			{
				$or: [
					{ command },
					{ message: command }
				]
			},
			{ command: 1, _id: 0 }
		)
		
		if (!findMessage) return null;
		
		return findMessage?.command;
		
	} catch (e){
		console.error(e)
		return { message: "Виникла невідома помилка" }
	}
}

async function findButton(command) {
	try {
		const button = await MessagesTemplate.find(
			{ command: { $in: command } },
			{ message: 1, _id: 0 }
		).lean();
		
		const btnArray = button.map(d => d.message).filter(Boolean);
		
		if (!btnArray) return null;
		
		return btnArray;
		
	} catch (e){
		console.error(e)
		return { message: "Виникла невідома помилка" }
	}
}

module.exports = {findTextButton, findControllerTextButton, findButton}