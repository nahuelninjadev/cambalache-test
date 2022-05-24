const { Router } = require('express');
const RepositoryController = require('../controllers/repository.controller');
const router = Router();
const tokenValidator = require('../middleware/tokenValidator');

router.get('/repos', RepositoryController.getAll);
router.get('/repos/:id', RepositoryController.getOne);
router.post('/repos', tokenValidator, RepositoryController.create);
router.put('/repos/:id', tokenValidator, RepositoryController.update);
router.delete('/repos/:id', tokenValidator, RepositoryController.deleteRepo);

module.exports = router;