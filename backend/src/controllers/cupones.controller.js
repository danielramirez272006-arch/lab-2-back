import { cuponesService } from '../services/cupones.service.js';

export const cuponesController = {
  getAll(req, res, next) {
    try {
      const data = cuponesService.getAll();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = cuponesService.getById(id);
      if (!data) {
        return res.status(404).json({ error: `Cupón con ID ${id} no encontrado` });
      }
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  create(req, res, next) {
    try {
      const data = cuponesService.create(req.body);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  update(req, res, next) {
    try {
      const { id } = req.params;
      const data = cuponesService.update(id, req.body);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  delete(req, res, next) {
    try {
      const { id } = req.params;
      const data = cuponesService.delete(id);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  validar(req, res, next) {
    try {
      const { codigo, cliente_id } = req.body;
      if (!codigo) {
        return res.status(400).json({ error: 'El código de cupón es obligatorio' });
      }
      const cupon = cuponesService.validarParaCliente(codigo, cliente_id);
      return res.status(200).json({
        valido: true,
        cupon: {
          id: cupon.id,
          codigo: cupon.codigo,
          porcentaje: cupon.porcentaje,
          vigente_hasta: cupon.vigente_hasta
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
