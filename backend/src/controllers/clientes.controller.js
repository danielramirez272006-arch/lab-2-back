import { clientesService } from '../services/clientes.service.js';

export const clientesController = {
  getAll(req, res, next) {
    try {
      const data = clientesService.getAll();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = clientesService.getById(id);
      if (!data) {
        return res.status(404).json({ error: `Cliente con ID ${id} no encontrado` });
      }
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  create(req, res, next) {
    try {
      const data = clientesService.create(req.body);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
};
