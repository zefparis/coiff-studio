import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const mapAppointment = (row) => ({
  id: row.id,
  clientId: row.client_id,
  serviceId: row.service_id,
  clientName: row.client_name,
  serviceName: row.service_name,
  scheduledAt: row.scheduled_at,
  price: row.price,
  notes: row.notes,
  createdAt: row.created_at,
  durationMinutes: row.duration_minutes,
});

const fetchAppointmentRow = (id) => {
  return db
    .prepare(
      `SELECT a.*, c.name AS client_name, s.name AS service_name, s.duration_minutes
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = ?`
    )
    .get(id);
};

const ensureClientExists = (clientId) => {
  const exists = db.prepare('SELECT id FROM clients WHERE id = ?').get(clientId);
  if (!exists) {
    throw new NotFoundError('Client');
  }
};

const getServiceRow = (serviceId) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!row) {
    throw new NotFoundError('Service');
  }
  return row;
};

const validateAppointment = (payload) => {
  const errors = {};

  if (!payload.client_id) {
    errors.client_id = 'Client is required';
  }
  if (!payload.service_id) {
    errors.service_id = 'Service is required';
  }

  if (!payload.scheduled_at || Number.isNaN(Date.parse(payload.scheduled_at))) {
    errors.scheduled_at = 'Valid scheduled date/time is required';
  }

  if (payload.price !== undefined && (Number.isNaN(Number(payload.price)) || Number(payload.price) < 0)) {
    errors.price = 'Price must be a positive number';
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
};

export const listAppointments = () => {
  const rows = db
    .prepare(
      `SELECT a.*, c.name AS client_name, s.name AS service_name, s.duration_minutes
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       ORDER BY datetime(a.scheduled_at) DESC`
    )
    .all();
  return rows.map(mapAppointment);
};

export const getAppointmentById = (id) => {
  const row = fetchAppointmentRow(id);
  if (!row) {
    throw new NotFoundError('Appointment');
  }
  return mapAppointment(row);
};

export const createAppointment = (payload) => {
  const data = {
    client_id: payload.client_id,
    service_id: payload.service_id,
    scheduled_at: payload.scheduled_at,
    price: payload.price,
    notes: payload.notes ?? null,
  };

  validateAppointment(data);
  ensureClientExists(data.client_id);
  const service = getServiceRow(data.service_id);
  const price = data.price !== undefined ? Number(data.price) : service.price;

  const stmt = db.prepare(
    `INSERT INTO appointments (client_id, service_id, scheduled_at, price, notes)
     VALUES (@client_id, @service_id, @scheduled_at, @price, @notes)`
  );
  const result = stmt.run({ ...data, price });
  return getAppointmentById(result.lastInsertRowid);
};

export const updateAppointment = (id, payload) => {
  const existing = getAppointmentById(id);
  const updates = {
    client_id: payload.client_id ?? existing.clientId,
    service_id: payload.service_id ?? existing.serviceId,
    scheduled_at: payload.scheduled_at ?? existing.scheduledAt,
    price: payload.price ?? existing.price,
    notes: payload.notes ?? existing.notes,
  };

  validateAppointment(updates);
  ensureClientExists(updates.client_id);
  const service = getServiceRow(updates.service_id);
  const price = updates.price !== undefined ? Number(updates.price) : service.price;

  db.prepare(
    `UPDATE appointments
     SET client_id = @client_id,
         service_id = @service_id,
         scheduled_at = @scheduled_at,
         price = @price,
         notes = @notes
     WHERE id = @id`
  ).run({ ...updates, price, id });

  return getAppointmentById(id);
};

export const deleteAppointment = (id) => {
  const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
  const result = stmt.run(id);
  if (!result.changes) {
    throw new NotFoundError('Appointment');
  }
};
