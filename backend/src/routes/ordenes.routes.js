import { Router } from 'express';
import { ordenesController } from '../controllers/ordenes.controller.js';

const router = Router();

router.get('/', ordenesController.getAll);
router.get('/:id', ordenesController.getById);
router.post('/', ordenesController.create);
router.patch('/:id/estado', ordenesController.cambiarEstado);
router.post('/:id/cancelar', ordenesController.cancelar);
router.post('/cotizar-envio', ordenesController.cotizarEnvio);

export default router;
