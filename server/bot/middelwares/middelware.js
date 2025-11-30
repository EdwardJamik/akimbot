const Response = require('../../models/response.model')

class middelware {

    async checkResponse(language, id_response) {
        const { response } = await Response.findOne({ id_response }, { response: 1, _id: 0 });
        return response[language];
    }

}

module.exports = new middelware;
