const uuid = require('uuid');
const SessionClient = require('./dialogflowClient');

exports.processInput = async (input, contexts) => {
    const sessionId = uuid.v4();
    const sessionPath = SessionClient.sessionPath(process.env.DF_PROJECT_ID, sessionId);

    const request = {
        session: sessionPath,
        queryParams: {
            contexts: contexts
        },
        queryInput: {
            text: {
                text: input,
                languageCode: 'id'
            }
        }
    };

    try {
        const responses = await SessionClient.detectIntent(request)        
        if (responses[0].queryResult.intent) {
            return responses[0].queryResult;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
        return null
    }
}
