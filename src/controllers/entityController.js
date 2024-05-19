const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const typeMapping = {
    string: DataTypes.STRING,
    integer: DataTypes.INTEGER,
    float: DataTypes.FLOAT,
    date: DataTypes.DATE
};

exports.createEntity = async (req, res) => {
    const { entityName, attributes } = req.body;

    const attributesArray = typeof attributes === 'string' ? attributes.split(',') : [];

    const attributesDefinition = {};
    attributesArray.forEach(attr => {
        const [name, type] = attr.split(':');
        if (typeMapping[type.toLowerCase()]) {
            attributesDefinition[name] = {
                type: typeMapping[type.toLowerCase()]
            };
        } else {
            return res.status(400).send(`Invalid type ${type} for attribute ${name}`);
        }
    });

    try {
        sequelize.define(entityName, attributesDefinition);
        await sequelize.sync({ force: true });
        res.send(`Entity ${entityName} created successfully.`);
    } catch (error) {
        res.status(500).send(`Error creating entity: ${error.message}`);
    }
};

exports.crudOperations = async (req, res) => {
    const { entityName, operation } = req.params;
    const { id, data } = req.body;
    const model = sequelize.models[entityName];

    if (!model) return res.status(404).send('Entity not found');

    try {
        switch (operation) {
            case 'create':
                const createdRecord = await model.create(JSON.parse(data));
                res.send(createdRecord);
                break;
            case 'read':
                const records = await model.findAll();
                res.send(records);
                break;
            case 'update':
                const recordToUpdate = await model.findByPk(id);
                if (recordToUpdate) {
                    await recordToUpdate.update(JSON.parse(data));
                    res.send(recordToUpdate);
                } else {
                    res.status(404).send('Record not found');
                }
                break;
            case 'delete':
                const recordToDelete = await model.findByPk(id);
                if (recordToDelete) {
                    await recordToDelete.destroy();
                    res.send('Record deleted successfully');
                } else {
                    res.status(404).send('Record not found');
                }
                break;
            default:
                res.status(400).send('Invalid operation');
        }
    } catch (error) {
        res.status(500).send('Error performing operation: ' + error.message);
    }
};
