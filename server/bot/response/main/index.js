const {findTextButton} = require('../../utils/buttonController')
const {selectButton} = require('../../keyboards/keyboard')
const {sendMessage} = require('../../utils/sendMessage')
const User = require('../../../models/user.model')
const {setUserAction, checkedUser} = require('../../utils/userSync')
const {handleBack} = require('../../utils/handleBack')


async function mainMenu({ ctx, command, message, chat_id, mainMenuFn }) {
	

	
}

module.exports = {mainMenu}