const registerSchema = (schema) => {
	console.log(schema)
};

const start = () => {

};

const config = ({
	dbPath,	
}) => {
	console.log(dbPath)
};

module.exports = {
	config,
	registerSchema,
	start,
};
