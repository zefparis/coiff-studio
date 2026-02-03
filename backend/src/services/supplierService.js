import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const supplierFields = ['name', 'phone', 'email', 'notes'];

const validateSupplier = (payload) => {
  const errors = {};

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    errors.name = 'Le nom doit comporter au moins 2 caractères';
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Adresse e-mail invalide';
  }

  if (payload.phone && payload.phone.trim().length < 6) {
    errors.phone = 'Le téléphone doit comporter au moins 6 caractères lorsque fourni';
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
};

const mapSupplier = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  notes: row.notes,
  createdAt: row.created_at,
});

export const listSuppliers = () => {
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY created_at DESC').all();
  return rows.map(mapSupplier);
};

export const getSupplierById = (id) => {
  const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  if (!row) {
    throw new NotFoundError('Supplier');
  }
  return mapSupplier(row);
};

export const createSupplier = (payload) => {
  const data = Object.fromEntries(supplierFields.map((field) => [field, payload[field] ?? null]));
  validateSupplier(data);

  const stmt = db.prepare(
    'INSERT INTO suppliers (name, phone, email, notes) VALUES (@name, @phone, @email, @notes)'
  );
  const result = stmt.run(data);
  return getSupplierById(result.lastInsertRowid);
};

export const updateSupplier = (id, payload) => {
  const existing = getSupplierById(id);
  const data = { ...existing, ...payload };
  validateSupplier(data);

  const stmt = db.prepare(
    'UPDATE suppliers SET name = @name, phone = @phone, email = @email, notes = @notes WHERE id = @id'
  );
  stmt.run({ ...data, id });
  return getSupplierById(id);
};

export const deleteSupplier = (id) => {
  const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
  const result = stmt.run(id);
  if (!result.changes) {
    throw new NotFoundError('Supplier');
  }
};
