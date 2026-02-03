import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { appointmentApi, clientApi, serviceApi } from '../lib/resources.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const emptyForm = {
  client_id: '',
  service_id: '',
  scheduled_at: dayjs().format('YYYY-MM-DDTHH:mm'),
  price: '',
  notes: '',
};

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const weeklyAppointments = useMemo(() => {
    const start = dayjs().startOf('week').add(1, 'day');
    return daysOfWeek.map((day, index) => {
      const dayStart = start.add(index, 'day');
      const dayEnd = dayStart.endOf('day');
      const items = appointments.filter((appt) => {
        const scheduled = dayjs(appt.scheduledAt);
        return scheduled.isAfter(dayStart) && scheduled.isBefore(dayEnd);
      });
      return { label: day, date: dayStart, items };
    });
  }, [appointments]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, servicesData, appointmentsData] = await Promise.all([
        clientApi.list(),
        serviceApi.list(),
        appointmentApi.list(),
      ]);
      setClients(clientsData);
      setServices(servicesData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        client_id: Number(form.client_id),
        service_id: Number(form.service_id),
        price: form.price ? Number(form.price) : undefined,
      };
      if (editingId) {
        await appointmentApi.update(editingId, payload);
      } else {
        await appointmentApi.create(payload);
      }
      await loadData();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible d’enregistrer le rendez-vous');
    }
  };

  const handleEdit = (appointment) => {
    setForm({
      client_id: appointment.clientId,
      service_id: appointment.serviceId,
      scheduled_at: dayjs(appointment.scheduledAt).format('YYYY-MM-DDTHH:mm'),
      price: appointment.price,
      notes: appointment.notes ?? '',
    });
    setEditingId(appointment.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return;
    try {
      await appointmentApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer le rendez-vous');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Planning</p>
        <h2 className="text-3xl font-semibold text-slate-900">Rendez-vous</h2>
        <p className="text-slate-500 max-w-2xl">
          Organisez votre semaine en un coup d’œil : chaque créneau affiche le client, la prestation et le tarif confirmé.
        </p>
      </header>

      <section className="grid xl:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Planification</p>
              <h3 className="text-xl font-semibold text-slate-900">{editingId ? 'Modifier' : 'Programmer'} un rendez-vous</h3>
            </div>
            {editingId && (
              <button type="button" className="text-sm text-slate-500" onClick={handleCancel}>
                Annuler
              </button>
            )}
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-500">Client</label>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required
              >
                <option value="" disabled>
                  Sélectionner un client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500">Prestation</label>
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                required
              >
                <option value="" disabled>
                  Sélectionner une prestation
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {formatCurrency(service.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-500">Date & heure</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Tarif (optionnel)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand text-white py-3 font-semibold shadow-soft hover:bg-brand-dark"
              disabled={loading}
            >
              {editingId ? 'Mettre à jour' : 'Créer le rendez-vous'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Calendrier</p>
              <h3 className="text-xl font-semibold text-slate-900">Cette semaine</h3>
            </div>
            <span className="text-sm text-slate-400">
              {dayjs().startOf('week').add(1, 'day').format('DD MMM')} - {dayjs().endOf('week').format('DD MMM')}
            </span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {weeklyAppointments.map((day) => (
              <div key={day.label} className="rounded-2xl bg-white p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{day.label}</p>
                <p className="text-sm text-slate-400">{day.date.format('DD MMM')}</p>
                <div className="mt-4 space-y-3">
                  {day.items.length ? (
                    day.items.map((appt) => (
                      <div key={appt.id} className="rounded-2xl border border-slate-100 p-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-900">{appt.clientName}</span>
                          <span className="text-slate-500">{formatCurrency(appt.price)}</span>
                        </div>
                        <p className="text-xs text-slate-400">{formatDateTime(appt.scheduledAt)}</p>
                        <p className="text-xs text-slate-500">{appt.serviceName}</p>
                        <div className="flex justify-end gap-2 text-xs mt-2">
                          <button className="text-brand" onClick={() => handleEdit(appt)}>
                            Modifier
                          </button>
                          <button className="text-red-500" onClick={() => handleDelete(appt.id)}>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Aucune réservation</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppointmentsPage;
