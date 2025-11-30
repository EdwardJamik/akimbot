const Users = require('../../models/user.model');

async function checkedUser({ id, first_name, last_name, username }) {
	try {
		const user = await Users.findOne({ chat_id: id });
		
		if (!user) {
			const newUser = await Users.create({
				chat_id: id,
				username,
				first_name,
				last_name,
			});
			
			return newUser;
		}
		
		const dataChanged =
			user.username !== username ||
			user.first_name !== first_name ||
			user.last_name !== last_name;
		
		if (dataChanged) {
			await Users.updateOne(
				{ chat_id: id },
				{ $set: { username, first_name, last_name } }
			);
			
			return {
				...user.toObject(),
				username,
				first_name,
				last_name
			};
		}
		
		return user;
		
	} catch (e) {
		console.error(e);
		return { message: "Виникла невідома помилка" };
	}
};

async function getUserData({ chat_id }) {
	try {
		const user = await Users.findOne({ chat_id });
		
		if(user){
			return user;
		}
		else {
			return false;
		}
	} catch (e) {
		console.error(e);
		return { message: "Виникла невідома помилка" };
	}
};

async function setUserAction({ chat_id, action }) {
	try {
		await Users.updateOne({ chat_id }, {action});
	} catch (e) {
		console.error(e);
		return { message: "Виникла невідома помилка" };
	}
};

module.exports = {getUserData, checkedUser, setUserAction}