import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const clientFields = ['name', 'phone', 'email', 'notes'];

const validateClient = (payload) => {
  const errors = {};

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    errors.name = 'Le nom doit comporter au moins 2 caractères';
  }

  if (!payload.phone || typeof payload.phone !== 'string' || payload.phone.trim().length < 6) {
    errors.phone = 'Le numéro de téléphone est requis';
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Adresse e-mail invalide';
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
};

const mapClient = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  notes: row.notes,
  createdAt: row.created_at,
});

export const listClients = () => {
  const rows = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  return rows.map(mapClient);
};

export const getClientById = (id) => {
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  if (!row) {
    throw new NotFoundError('Client');
  }
  return mapClient(row);
};

export const createClient = (payload) => {
  const data = Object.fromEntries(clientFields.map((field) => [field, payload[field] ?? null]));
  validateClient(data);

  const stmt = db.prepare(
    'INSERT INTO clients (name, phone, email, notes) VALUES (@name, @phone, @email, @notes)'
  );
  const result = stmt.run(data);
  return getClientById(result.lastInsertRowid);
};

export const updateClient = (id, payload) => {
  const existing = getClientById(id);
  const data = { ...existing, ...payload };
  validateClient(data);

  const stmt = db.prepare(
    'UPDATE clients SET name = @name, phone = @phone, email = @email, notes = @notes WHERE id = @id'
  );
  stmt.run({ ...data, id });
  return getClientById(id);
};

export const deleteClient = (id) => {
  const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
  const result = stmt.run(id);
  if (!result.changes) {
    throw new NotFoundError('Client');
  }
};
