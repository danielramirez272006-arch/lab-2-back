import { Router } from 'express';
import { resumenController } from '../controllers/resumen.controller.js';

const router = Router();

router.get('/', resumenController.getResumen);

export default router;
