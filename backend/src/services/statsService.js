import db from '../db/index.js';

export const revenueByDay = () => {
  const rows = db
    .prepare(
      `SELECT DATE(issued_at) as day, SUM(total) as revenue
       FROM invoices
       WHERE status = 'paid'
       GROUP BY DATE(issued_at)
       ORDER BY DATE(issued_at) DESC
       LIMIT 30`
    )
    .all();
  return rows.map((row) => ({ day: row.day, revenue: row.revenue || 0 }));
};

export const revenueByMonth = () => {
  const rows = db
    .prepare(
      `SELECT strftime('%Y-%m', issued_at) as month, SUM(total) as revenue
       FROM invoices
       WHERE status = 'paid'
       GROUP BY strftime('%Y-%m', issued_at)
       ORDER BY month DESC
       LIMIT 12`
    )
    .all();
  return rows.map((row) => ({ month: row.month, revenue: row.revenue || 0 }));
};

export const dashboardSummary = () => {
  const totals = db.prepare('SELECT COUNT(*) as count FROM clients').get();
  const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
  const revenue = db.prepare("SELECT SUM(total) as revenue FROM invoices WHERE status = 'paid'").get();
  const unpaid = db.prepare("SELECT SUM(total) as due FROM invoices WHERE status = 'unpaid'").get();

  return {
    clients: totals.count || 0,
    appointments: appointments.count || 0,
    revenue: revenue.revenue || 0,
    outstanding: unpaid.due || 0,
  };
};
