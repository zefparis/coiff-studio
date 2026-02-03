import { useEffect, useMemo, useState } from 'react';
import { appointmentApi, invoiceApi } from '../lib/resources.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const emptyForm = {
  appointment_id: '',
  total: '',
  status: 'unpaid',
};

const statusFilters = [
  { value: 'all', label: 'Toutes' },
  { value: 'unpaid', label: 'Non réglées' },
  { value: 'paid', label: 'Payées' },
];

const statusColors = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  unpaid: 'bg-amber-50 text-amber-700 border-amber-100',
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoiceData, appointmentData] = await Promise.all([invoiceApi.list(), appointmentApi.list()]);
      setInvoices(invoiceData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => {
    const totalBilled = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const outstanding = invoices
      .filter((invoice) => invoice.status === 'unpaid')
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const paidCount = invoices.filter((invoice) => invoice.status === 'paid').length;
    return { totalBilled, outstanding, paidCount };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((invoice) => invoice.status === statusFilter);
  }, [invoices, statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        appointment_id: Number(form.appointment_id),
        total: form.total ? Number(form.total) : undefined,
        status: form.status,
      };
      if (editingId) {
        await invoiceApi.update(editingId, payload);
      } else {
        await invoiceApi.create(payload);
      }
      await loadData();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible d’enregistrer la facture');
    }
  };

  const handleEdit = (invoice) => {
    setForm({
      appointment_id: invoice.appointmentId,
      total: invoice.total,
      status: invoice.status,
    });
    setEditingId(invoice.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    try {
      await invoiceApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer la facture');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Finance</p>
        <h2 className="text-3xl font-semibold text-slate-900">Factures</h2>
        <p className="text-slate-500 max-w-2xl">
          Suivez le chiffre d'affaires, les soldes en attente et émettez des factures à partir des rendez-vous confirmés.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total facturé</p>
          <p className="text-3xl font-semibold mt-3">{formatCurrency(totals.totalBilled)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">En attente</p>
          <p className="text-3xl font-semibold mt-3 text-amber-600">{formatCurrency(totals.outstanding)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Factures réglées</p>
          <p className="text-3xl font-semibold mt-3">{totals.paidCount}</p>
        </div>
      </section>

      <section className="grid xl:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Facturation</p>
              <h3 className="text-xl font-semibold text-slate-900">{editingId ? 'Modifier' : 'Émettre'} une facture</h3>
            </div>
            {editingId && (
              <button type="button" className="text-sm text-slate-500" onClick={handleCancel}>
                Annuler
              </button>
            )}
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-500">Rendez-vous</label>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                value={form.appointment_id}
                onChange={(e) => setForm({ ...form, appointment_id: e.target.value })}
                required
              >
                <option value="" disabled>
                  Sélectionner un rendez-vous
                </option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.clientName} · {appointment.serviceName} · {formatDate(appointment.scheduledAt)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500">Montant (optionnel)</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Statut</label>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="unpaid">Non réglée</option>
                <option value="paid">Payée</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold shadow-soft hover:bg-slate-800"
              disabled={loading}
            >
              {editingId ? 'Mettre à jour' : 'Créer la facture'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 p-4 sm:p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Factures</p>
              <h3 className="text-xl font-semibold text-slate-900">Historique de facturation</h3>
            </div>
            <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 text-sm rounded-2xl transition ${
                    statusFilter === filter.value ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                  <th className="py-3 pr-4">Facture</th>
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Prestation</th>
                  <th className="py-3 pr-4">Séance</th>
                  <th className="py-3 pr-4">Montant</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 last:border-none">
                      <td className="py-4 pr-4 font-medium text-slate-900">#{invoice.id}</td>
                      <td className="py-4 pr-4 text-slate-600">{invoice.clientName}</td>
                      <td className="py-4 pr-4 text-slate-600">{invoice.serviceName}</td>
                      <td className="py-4 pr-4 text-slate-500">{formatDate(invoice.scheduledAt)}</td>
                      <td className="py-4 pr-4 font-semibold text-slate-900">{formatCurrency(invoice.total)}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[invoice.status]}`}>
                          {invoice.status === 'paid' ? 'Payée' : 'Non réglée'}
                        </span>
                      </td>
                      <td className="py-4 pr-0 text-right space-x-3">
                        <button className="text-brand" onClick={() => handleEdit(invoice)}>
                          Modifier
                        </button>
                        <button className="text-red-500" onClick={() => handleDelete(invoice.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-slate-400" colSpan={7}>
                      Aucune facture ne correspond à ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvoicesPage;
