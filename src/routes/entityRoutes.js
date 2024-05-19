const express = require('express');
const { createEntity, crudOperations } = require('../controllers/entityController');
const sequelize = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/entity', createEntity);
router.post('/:entityName/:operation', crudOperations);

router.post('/performCrud', async (req, res) => {
    const { entityName, operation, id, data } = req.body;
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
});

module.exports = router;
