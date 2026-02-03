import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { clientApi } from '../lib/resources.js';

const emptyForm = { name: '', phone: '', email: '', notes: '' };

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const query = search.toLowerCase();
    return clients.filter((client) =>
      [client.name, client.email, client.phone, client.notes].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [clients, search]);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi.list();
      setClients(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await clientApi.update(editingId, form);
      } else {
        await clientApi.create(form);
      }
      await loadClients();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible d’enregistrer le client');
    }
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, phone: client.phone, email: client.email ?? '', notes: client.notes ?? '' });
    setEditingId(client.id);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await clientApi.remove(clientId);
      await loadClients();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer le client');
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opérations</p>
        <h2 className="text-3xl font-semibold text-slate-900">Clients</h2>
        <p className="text-slate-500 max-w-2xl">
          Gérez chaque interaction : ajoutez de nouveaux clients, mettez à jour les coordonnées, enregistrez des notes et gardez un CRM impeccable.
        </p>
      </header>

      <section className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="bg-slate-50 rounded-3xl p-6 border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Formulaire</p>
              <h3 className="text-xl font-semibold text-slate-900">{editingId ? 'Modifier le client' : 'Ajouter un client'}</h3>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Annuler
              </button>
            )}
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-500">Nom complet</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand text-white py-3 font-semibold shadow-soft hover:bg-brand-dark"
              disabled={loading}
            >
              {editingId ? 'Enregistrer' : 'Créer le client'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Répertoire</p>
              <h3 className="text-xl font-semibold text-slate-900">Liste des clients</h3>
            </div>
            <input
              type="search"
              placeholder="Rechercher un client"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400 uppercase text-xs tracking-[0.2em]">
                <tr>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2 pr-4">Depuis</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{client.name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-slate-600">{client.phone}</p>
                      {client.email && <p className="text-slate-400">{client.email}</p>}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 max-w-xs">{client.notes || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{dayjs(client.createdAt).format('DD MMM YYYY')}</td>
                    <td className="py-3 pr-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="text-slate-500 hover:text-brand font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client.id)}
                        className="text-slate-400 hover:text-red-500 font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredClients.length && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {loading ? 'Chargement des clients…' : 'Aucun client'}
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

export default ClientsPage;
