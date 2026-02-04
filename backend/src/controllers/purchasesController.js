import * as purchaseService from '../services/purchaseService.js';

export const list = (req, res, next) => {
  try {
    const purchases = purchaseService.listPurchases();
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const getOne = (req, res, next) => {
  try {
    const purchase = purchaseService.getPurchaseById(req.params.id);
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const create = (req, res, next) => {
  try {
    const purchase = purchaseService.createPurchase(req.body);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const update = (req, res, next) => {
  try {
    const purchase = purchaseService.updatePurchase(req.params.id, req.body);
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

export const remove = (req, res, next) => {
  try {
    purchaseService.deletePurchase(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const bySupplier = (req, res, next) => {
  try {
    const purchases = purchaseService.getPurchasesBySupplier(req.params.supplierId);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

export const stats = (req, res, next) => {
  try {
    const statistics = purchaseService.getPurchaseStats();
    res.json(statistics);
  } catch (err) {
    next(err);
  }
};
