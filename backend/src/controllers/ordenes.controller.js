import { ordenesService, calcularCostoEnvio } from '../services/ordenes.service.js';

export const ordenesController = {
  getAll(req, res, next) {
    try {
      const { estado, cliente_id } = req.query;
      const data = ordenesService.getAll({ estado, cliente_id });
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = ordenesService.getById(id);
      if (!data) {
        return res.status(404).json({ error: `Orden con ID ${id} no encontrada` });
      }
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  create(req, res, next) {
    try {
      const data = ordenesService.create(req.body);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevo_estado } = req.body;
      if (!nuevo_estado) {
        return res.status(400).json({ error: 'El campo nuevo_estado es requerido' });
      }
      const data = ordenesService.cambiarEstado(id, nuevo_estado);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const data = ordenesService.cancelar(id);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  cotizarEnvio(req, res, next) {
    try {
      const { ciudad, subtotal } = req.body;
      if (subtotal === undefined) {
        return res.status(400).json({ error: 'El subtotal es requerido para cotizar envío' });
      }
      const envio = calcularCostoEnvio(ciudad, Number(subtotal));
      return res.status(200).json({
        ciudad: ciudad || 'Estándar',
        subtotal: Number(subtotal),
        costo_envio: envio,
        envio_gratis: envio === 0
      });
    } catch (error) {
      next(error);
    }
  }
};
