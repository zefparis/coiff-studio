import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const validateProduct = (payload) => {
  const errors = {};

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    errors.name = 'Le nom doit comporter au moins 2 caractères';
  }

  const validCategories = ['coloration', 'soin', 'revente', 'equipement', 'autre'];
  if (!payload.category || !validCategories.includes(payload.category)) {
    errors.category = 'Catégorie invalide';
  }

  if (payload.purchase_price === undefined || payload.purchase_price === null || Number(payload.purchase_price) < 0) {
    errors.purchase_price = 'Le prix d\'achat doit être un nombre positif';
  }

  if (payload.sale_price !== undefined && payload.sale_price !== null && Number(payload.sale_price) < 0) {
    errors.sale_price = 'Le prix de vente doit être un nombre positif';
  }

  if (payload.stock_quantity !== undefined && payload.stock_quantity !== null && Number(payload.stock_quantity) < 0) {
    errors.stock_quantity = 'La quantité en stock doit être positive';
  }

  if (payload.alert_threshold !== undefined && payload.alert_threshold !== null && Number(payload.alert_threshold) < 0) {
    errors.alert_threshold = 'Le seuil d\'alerte doit être positif';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};

export const listProducts = () => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name,
      CASE 
        WHEN p.stock_quantity <= 0 THEN 'rupture'
        WHEN p.stock_quantity <= p.alert_threshold THEN 'alerte'
        ELSE 'ok'
      END as stock_status
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.created_at DESC
  `);
  return stmt.all();
};

export const getProductById = (id) => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name,
      CASE 
        WHEN p.stock_quantity <= 0 THEN 'rupture'
        WHEN p.stock_quantity <= p.alert_threshold THEN 'alerte'
        ELSE 'ok'
      END as stock_status
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `);
  const product = stmt.get(id);
  if (!product) {
    throw new NotFoundError('Produit');
  }
  return product;
};

export const createProduct = (payload) => {
  validateProduct(payload);

  const stmt = db.prepare(`
    INSERT INTO products (name, category, supplier_id, purchase_price, sale_price, stock_quantity, alert_threshold, unit, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    payload.name.trim(),
    payload.category,
    payload.supplier_id || null,
    Number(payload.purchase_price),
    payload.sale_price !== undefined ? Number(payload.sale_price) : null,
    payload.stock_quantity !== undefined ? Number(payload.stock_quantity) : 0,
    payload.alert_threshold !== undefined ? Number(payload.alert_threshold) : 5,
    payload.unit || 'unité',
    payload.notes?.trim() || null
  );

  return getProductById(result.lastInsertRowid);
};

export const updateProduct = (id, payload) => {
  getProductById(id);
  validateProduct(payload);

  const stmt = db.prepare(`
    UPDATE products
    SET name = ?, category = ?, supplier_id = ?, purchase_price = ?, sale_price = ?, 
        stock_quantity = ?, alert_threshold = ?, unit = ?, notes = ?
    WHERE id = ?
  `);

  stmt.run(
    payload.name.trim(),
    payload.category,
    payload.supplier_id || null,
    Number(payload.purchase_price),
    payload.sale_price !== undefined ? Number(payload.sale_price) : null,
    payload.stock_quantity !== undefined ? Number(payload.stock_quantity) : 0,
    payload.alert_threshold !== undefined ? Number(payload.alert_threshold) : 5,
    payload.unit || 'unité',
    payload.notes?.trim() || null,
    id
  );

  return getProductById(id);
};

export const deleteProduct = (id) => {
  getProductById(id);
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
};

export const adjustStock = (id, quantity, reason = null) => {
  const product = getProductById(id);
  const newQuantity = Number(product.stock_quantity) + Number(quantity);

  if (newQuantity < 0) {
    throw new ValidationError({ stock: 'Stock insuffisant pour cette opération' });
  }

  const stmt = db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?');
  stmt.run(newQuantity, id);

  return getProductById(id);
};

export const getLowStockProducts = () => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.stock_quantity <= p.alert_threshold
    ORDER BY p.stock_quantity ASC
  `);
  return stmt.all();
};
