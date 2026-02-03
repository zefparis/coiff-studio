import db from '../db/index.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const mapInvoice = (row) => ({
  id: row.id,
  appointmentId: row.appointment_id,
  clientName: row.client_name,
  serviceName: row.service_name,
  total: row.total,
  status: row.status,
  issuedAt: row.issued_at,
  scheduledAt: row.scheduled_at,
});

const fetchInvoiceRow = (id) => {
  return db
    .prepare(
      `SELECT i.*, c.name AS client_name, s.name AS service_name, a.scheduled_at
       FROM invoices i
       JOIN appointments a ON a.id = i.appointment_id
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       WHERE i.id = ?`
    )
    .get(id);
};

const ensureAppointmentExists = (appointmentId) => {
  const row = db
    .prepare(
      `SELECT a.*, c.name AS client_name, s.name AS service_name
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = ?`
    )
    .get(appointmentId);
  if (!row) {
    throw new NotFoundError('Appointment');
  }
  return row;
};

const validateInvoice = (payload) => {
  const errors = {};

  if (!payload.appointment_id) {
    errors.appointment_id = 'Appointment is required';
  }

  if (payload.total !== undefined && (Number.isNaN(Number(payload.total)) || Number(payload.total) < 0)) {
    errors.total = 'Total must be a positive number';
  }

  if (payload.status && !['paid', 'unpaid'].includes(payload.status)) {
    errors.status = 'Status must be paid or unpaid';
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
};

export const listInvoices = () => {
  const rows = db
    .prepare(
      `SELECT i.*, c.name AS client_name, s.name AS service_name, a.scheduled_at
       FROM invoices i
       JOIN appointments a ON a.id = i.appointment_id
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       ORDER BY datetime(i.issued_at) DESC`
    )
    .all();
  return rows.map(mapInvoice);
};

export const getInvoiceById = (id) => {
  const row = fetchInvoiceRow(id);
  if (!row) {
    throw new NotFoundError('Invoice');
  }
  return mapInvoice(row);
};

export const createInvoice = (payload) => {
  const data = {
    appointment_id: payload.appointment_id,
    total: payload.total,
    status: payload.status ?? 'unpaid',
  };
  validateInvoice(data);
  const appointment = ensureAppointmentExists(data.appointment_id);
  const total = data.total !== undefined ? Number(data.total) : appointment.price;

  const stmt = db.prepare(
    `INSERT INTO invoices (appointment_id, total, status)
     VALUES (@appointment_id, @total, @status)`
  );
  const result = stmt.run({ ...data, total });
  return getInvoiceById(result.lastInsertRowid);
};

export const updateInvoice = (id, payload) => {
  const existing = getInvoiceById(id);
  const updates = {
    appointment_id: payload.appointment_id ?? existing.appointmentId,
    total: payload.total ?? existing.total,
    status: payload.status ?? existing.status,
  };

  validateInvoice(updates);
  ensureAppointmentExists(updates.appointment_id);

  db.prepare(
    `UPDATE invoices
     SET appointment_id = @appointment_id,
         total = @total,
         status = @status
     WHERE id = @id`
  ).run({ ...updates, id });

  return getInvoiceById(id);
};

export const deleteInvoice = (id) => {
  const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
  const result = stmt.run(id);
  if (!result.changes) {
    throw new NotFoundError('Invoice');
  }
};
