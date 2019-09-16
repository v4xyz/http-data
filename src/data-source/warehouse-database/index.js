/**
 * 使用warehouse文件数据库, 进行数据持久化
 */
const path = require('path');
const Database = require('warehouse');
const Schema = Database.Schema;
const utils = require('../../util');
const DB_VERSION = 1;

const createDbInstance = ({ schemas, schemaNames, dbPath }) => {
	const db = new Database({path: dbPath, version: DB_VERSION});
	// 遍历schemas并创建warehouse Model
	const DB_MODEL = schemaNames.reduce((acc, schema) => {
		acc[schema] = db.model(schema, new Schema(schemas[schema]))

		return acc;
	}, {});

	return {
		db, 
		DB_MODEL
	};
};

module.exports = {
	createDbInstance
};
