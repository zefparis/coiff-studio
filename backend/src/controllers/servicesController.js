import * as serviceService from '../services/serviceService.js';

export const listServices = (req, res, next) => {
  try {
    const services = serviceService.listServices();
    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const getService = (req, res, next) => {
  try {
    const service = serviceService.getServiceById(Number(req.params.id));
    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const createService = (req, res, next) => {
  try {
    const service = serviceService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const updateService = (req, res, next) => {
  try {
    const service = serviceService.updateService(Number(req.params.id), req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const deleteService = (req, res, next) => {
  try {
    serviceService.deleteService(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
