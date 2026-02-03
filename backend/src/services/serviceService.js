import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const serviceFields = ['name', 'price', 'duration_minutes'];

const validateService = (payload) => {
  const errors = {};

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (payload.price === undefined || Number.isNaN(Number(payload.price)) || Number(payload.price) < 0) {
    errors.price = 'Price must be a positive number';
  }

  if (
    payload.duration_minutes === undefined ||
    Number.isNaN(Number(payload.duration_minutes)) ||
    Number(payload.duration_minutes) <= 0
  ) {
    errors.duration_minutes = 'Duration must be a positive number of minutes';
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
};

const mapService = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  durationMinutes: row.duration_minutes,
});

export const listServices = () => {
  const rows = db.prepare('SELECT * FROM services ORDER BY name ASC').all();
  return rows.map(mapService);
};

export const getServiceById = (id) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!row) {
    throw new NotFoundError('Service');
  }
  return mapService(row);
};

export const createService = (payload) => {
  const data = Object.fromEntries(serviceFields.map((field) => [field, payload[field] ?? null]));
  validateService(data);

  const stmt = db.prepare(
    'INSERT INTO services (name, price, duration_minutes) VALUES (@name, @price, @duration_minutes)'
  );
  const result = stmt.run(data);
  return getServiceById(result.lastInsertRowid);
};

export const updateService = (id, payload) => {
  const existing = getServiceById(id);
  const normalized = {
    ...existing,
    price: payload.price ?? existing.price,
    duration_minutes: payload.duration_minutes ?? existing.durationMinutes,
    name: payload.name ?? existing.name,
  };

  const data = {
    name: normalized.name,
    price: normalized.price,
    duration_minutes: normalized.duration_minutes,
  };

  validateService(data);

  const stmt = db.prepare(
    'UPDATE services SET name = @name, price = @price, duration_minutes = @duration_minutes WHERE id = @id'
  );
  stmt.run({ ...data, id });
  return getServiceById(id);
};

export const deleteService = (id) => {
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  const result = stmt.run(id);
  if (!result.changes) {
    throw new NotFoundError('Service');
  }
};
