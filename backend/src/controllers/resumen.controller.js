import { resumenService } from '../services/resumen.service.js';

export const resumenController = {
  getResumen(req, res, next) {
    try {
      const data = resumenService.getMetricas();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
};
