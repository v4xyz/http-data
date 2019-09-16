const path = require('path');
const dataSource = require('./data-source');
const { createDbInstance, createActionHandler } = dataSource;
const modelProxy = require('./middleware/model-proxy');


class HttpData {

	constructor(params) {
		const { dbPath, schemas } = params;	
		const schemaNames = Object.keys(schemas);
		this.schemaNames = schemaNames;
		this.dbInstance = createDbInstance({ db, schemas, schemaNames });
		const { db, DB_MODEL } = this.dbInstance;
		this.actionHandler = createActionHandler({ db, DB_MODEL, schemas, schemaNames });

		console.log(dbPath, schemas);

	}

	configKoaMiddleware(config) {
		console.log(config)
		const { actionHandler, schemaNames } = this
		return modelProxy({
			controller: actionHandler,
			schemaNames
		})
	}

	configReduxMiddleware() {

	}
};

module.exports = HttpData;
