const path = require('path');
const dataSource = require('./data-source');
const { createDbInstance, createActionHandler } = dataSource;
const modelProxy = require('./middleware/model-proxy');


class HttpData {

	constructor(params) {
		const { dbPath, schemas } = params;	
		const schemaNames = Object.keys(schemas);
		this.schemaNames = schemaNames;
		this.dbInstance = createDbInstance({ dbPath, schemas, schemaNames });
		const { db, DB_MODEL } = this.dbInstance;
		this.actionHandler = createActionHandler({ db, DB_MODEL, schemas, schemaNames });

		this.actionHandler.loadDb({ db, DB_MODEL });
		console.log(dbPath, schemas);

	}

	configKoaMiddleware({ handleRequestParams = {}, handleResponseData = {} }) {

		const { actionHandler, schemaNames } = this
		return modelProxy({
			controller: actionHandler,
			schemaNames,
			handleRequestParams,
			handleResponseData,
		})
	}

	configReduxMiddleware() {

	}
};

module.exports = HttpData;
