const { Router } = require('express');
const router = Router();
const UserController = require('../controllers/user.controller');

//obtiene todos los usuarios
router.get('/users', UserController.getAll);

//obtiene un solo usuario por medio del id
router.get('/users/:id', UserController.getOne)

//crea un nuevo usuario
router.post('/users', UserController.create);

//actualiza un usuario pasando un id como parametro
router.put('/users/:id', UserController.update);

//actualiza la contraseña
router.put('/users/:id/change_password', UserController.updatePassword);

//elimina un usuario
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;