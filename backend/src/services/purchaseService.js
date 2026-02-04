import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const validatePurchase = (payload) => {
  const errors = {};

  if (!payload.supplier_id) {
    errors.supplier_id = 'Le fournisseur est requis';
  }

  if (!payload.purchase_date) {
    errors.purchase_date = 'La date d\'achat est requise';
  }

  const validPaymentMethods = ['especes', 'carte', 'virement', 'cheque', 'autre'];
  if (payload.payment_method && !validPaymentMethods.includes(payload.payment_method)) {
    errors.payment_method = 'Méthode de paiement invalide';
  }

  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'Au moins un produit est requis';
  } else {
    payload.items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`items.${index}.product_id`] = 'Produit requis';
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        errors[`items.${index}.quantity`] = 'Quantité invalide';
      }
      if (item.unit_price === undefined || Number(item.unit_price) < 0) {
        errors[`items.${index}.unit_price`] = 'Prix unitaire invalide';
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
};

export const listPurchases = () => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name,
      (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.id) as items_count
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.purchase_date DESC, p.created_at DESC
  `);
  return stmt.all();
};

export const getPurchaseById = (id) => {
  const purchaseStmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `);
  const purchase = purchaseStmt.get(id);
  
  if (!purchase) {
    throw new NotFoundError('Achat');
  }

  const itemsStmt = db.prepare(`
    SELECT 
      pi.*,
      pr.name as product_name,
      pr.unit as product_unit
    FROM purchase_items pi
    LEFT JOIN products pr ON pi.product_id = pr.id
    WHERE pi.purchase_id = ?
  `);
  purchase.items = itemsStmt.all(id);

  return purchase;
};

export const createPurchase = (payload) => {
  validatePurchase(payload);

  const totalAmount = payload.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unit_price));
  }, 0);

  const transaction = db.transaction(() => {
    const purchaseStmt = db.prepare(`
      INSERT INTO purchases (supplier_id, purchase_date, total_amount, payment_method, invoice_reference, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const purchaseResult = purchaseStmt.run(
      Number(payload.supplier_id),
      payload.purchase_date,
      totalAmount,
      payload.payment_method || 'carte',
      payload.invoice_reference?.trim() || null,
      payload.notes?.trim() || null
    );

    const purchaseId = purchaseResult.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    const stockStmt = db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?
    `);

    payload.items.forEach((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const subtotal = quantity * unitPrice;

      itemStmt.run(purchaseId, Number(item.product_id), quantity, unitPrice, subtotal);
      stockStmt.run(quantity, Number(item.product_id));
    });

    return purchaseId;
  });

  const purchaseId = transaction();
  return getPurchaseById(purchaseId);
};

export const updatePurchase = (id, payload) => {
  getPurchaseById(id);
  validatePurchase(payload);

  const totalAmount = payload.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unit_price));
  }, 0);

  const transaction = db.transaction(() => {
    const oldPurchase = getPurchaseById(id);

    oldPurchase.items.forEach((item) => {
      const stockStmt = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `);
      stockStmt.run(item.quantity, item.product_id);
    });

    const deleteItemsStmt = db.prepare('DELETE FROM purchase_items WHERE purchase_id = ?');
    deleteItemsStmt.run(id);

    const updatePurchaseStmt = db.prepare(`
      UPDATE purchases
      SET supplier_id = ?, purchase_date = ?, total_amount = ?, payment_method = ?, invoice_reference = ?, notes = ?
      WHERE id = ?
    `);

    updatePurchaseStmt.run(
      Number(payload.supplier_id),
      payload.purchase_date,
      totalAmount,
      payload.payment_method || 'carte',
      payload.invoice_reference?.trim() || null,
      payload.notes?.trim() || null,
      id
    );

    const itemStmt = db.prepare(`
      INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    const stockStmt = db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?
    `);

    payload.items.forEach((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const subtotal = quantity * unitPrice;

      itemStmt.run(id, Number(item.product_id), quantity, unitPrice, subtotal);
      stockStmt.run(quantity, Number(item.product_id));
    });
  });

  transaction();
  return getPurchaseById(id);
};

export const deletePurchase = (id) => {
  const purchase = getPurchaseById(id);

  const transaction = db.transaction(() => {
    purchase.items.forEach((item) => {
      const stockStmt = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `);
      stockStmt.run(item.quantity, item.product_id);
    });

    const stmt = db.prepare('DELETE FROM purchases WHERE id = ?');
    stmt.run(id);
  });

  transaction();
};

export const getPurchasesBySupplier = (supplierId) => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      s.name as supplier_name,
      (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.id) as items_count
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.supplier_id = ?
    ORDER BY p.purchase_date DESC
  `);
  return stmt.all(supplierId);
};

export const getPurchaseStats = () => {
  const totalStmt = db.prepare(`
    SELECT 
      COUNT(*) as total_purchases,
      COALESCE(SUM(total_amount), 0) as total_spent
    FROM purchases
  `);

  const monthlyStmt = db.prepare(`
    SELECT 
      strftime('%Y-%m', purchase_date) as month,
      COUNT(*) as purchases_count,
      SUM(total_amount) as monthly_spent
    FROM purchases
    WHERE purchase_date >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month DESC
  `);

  const topSuppliersStmt = db.prepare(`
    SELECT 
      s.name as supplier_name,
      COUNT(p.id) as purchases_count,
      SUM(p.total_amount) as total_spent
    FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    GROUP BY p.supplier_id
    ORDER BY total_spent DESC
    LIMIT 5
  `);

  return {
    ...totalStmt.get(),
    monthly: monthlyStmt.all(),
    topSuppliers: topSuppliersStmt.all(),
  };
};
