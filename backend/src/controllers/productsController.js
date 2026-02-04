import * as productService from '../services/productService.js';

export const list = (req, res, next) => {
  try {
    const products = productService.listProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getOne = (req, res, next) => {
  try {
    const product = productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const create = (req, res, next) => {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const update = (req, res, next) => {
  try {
    const product = productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const remove = (req, res, next) => {
  try {
    productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const adjustStock = (req, res, next) => {
  try {
    const { quantity, reason } = req.body;
    const product = productService.adjustStock(req.params.id, quantity, reason);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const lowStock = (req, res, next) => {
  try {
    const products = productService.getLowStockProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};
