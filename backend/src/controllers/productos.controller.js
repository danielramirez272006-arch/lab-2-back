import { productosService } from '../services/productos.service.js';

export const productosController = {
  getAll(req, res, next) {
    try {
      const { search, categoria, orden } = req.query;
      const data = productosService.getAll({ search, categoria, orden });
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = productosService.getById(id);
      if (!data) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  create(req, res, next) {
    try {
      const data = productosService.create(req.body);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  update(req, res, next) {
    try {
      const { id } = req.params;
      const data = productosService.update(id, req.body);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  delete(req, res, next) {
    try {
      const { id } = req.params;
      const data = productosService.delete(id);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
};
