import * as supplierService from '../services/supplierService.js';

export const listSuppliers = (req, res, next) => {
  try {
    const suppliers = supplierService.listSuppliers();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

export const getSupplier = (req, res, next) => {
  try {
    const supplier = supplierService.getSupplierById(Number(req.params.id));
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = (req, res, next) => {
  try {
    const supplier = supplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = (req, res, next) => {
  try {
    const supplier = supplierService.updateSupplier(Number(req.params.id), req.body);
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = (req, res, next) => {
  try {
    supplierService.deleteSupplier(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
