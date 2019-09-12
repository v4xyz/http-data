/**
 * 使用warehouse文件数据库, 进行数据持久化
 */
const path = require('path');
const Database = require('warehouse');
// const Model = require('warehouse/lib/model');
const Schema = Database.Schema;
const DB_PATH = path.join(__dirname, 'db-file.json');
const utils = require('../../util');
const DB_VERSION = 1;
const db = new Database({path: DB_PATH, version: DB_VERSION});
const schemas = require('./schemas');
// 遍历schemas并创建warehouse Model
const DB_MODEL = Object.keys(schemas).reduce((acc, schema) => {
	acc[schema] = db.model(schema, new Schema(schemas[schema]))

	return acc;
}, {})

module.exports = {
	db,
	DB_MODEL,
	schemas,
};
