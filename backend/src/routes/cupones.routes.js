import { Router } from 'express';
import { cuponesController } from '../controllers/cupones.controller.js';

const router = Router();

// CRUD completo para cupones + endpoint de validación
router.get('/', cuponesController.getAll);
router.get('/:id', cuponesController.getById);
router.post('/', cuponesController.create);
router.put('/:id', cuponesController.update);
router.delete('/:id', cuponesController.delete);
router.post('/validar', cuponesController.validar);

export default router;
