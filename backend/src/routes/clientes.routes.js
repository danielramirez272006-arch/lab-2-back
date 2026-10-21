import { Router } from 'express';
import { clientesController } from '../controllers/clientes.controller.js';

const router = Router();

router.get('/', clientesController.getAll);
router.get('/:id', clientesController.getById);
router.post('/', clientesController.create);

export default router;
