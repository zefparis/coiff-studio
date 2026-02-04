import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { purchaseApi, supplierApi, productApi } from '../lib/resources.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import CollapsibleSection from '../components/CollapsibleSection.jsx';

const emptyForm = {
  supplier_id: '',
  purchase_date: dayjs().format('YYYY-MM-DD'),
  payment_method: 'carte',
  invoice_reference: '',
  notes: '',
  items: [{ product_id: '', quantity: '', unit_price: '' }],
};

const paymentMethods = [
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'especes', label: 'Espèces' },
  { value: 'virement', label: 'Virement' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'autre', label: 'Autre' },
];

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [purchasesData, suppliersData, productsData] = await Promise.all([
        purchaseApi.list(),
        supplierApi.list(),
        productApi.list(),
      ]);
      setPurchases(purchasesData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les achats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        supplier_id: Number(form.supplier_id),
        purchase_date: form.purchase_date,
        payment_method: form.payment_method,
        invoice_reference: form.invoice_reference || null,
        notes: form.notes || null,
        items: form.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      if (editingId) {
        await purchaseApi.update(editingId, payload);
      } else {
        await purchaseApi.create(payload);
      }

      await loadData();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible d\'enregistrer l\'achat');
    }
  };

  const handleEdit = async (purchase) => {
    try {
      const fullPurchase = await purchaseApi.get(purchase.id);
      setForm({
        supplier_id: fullPurchase.supplier_id,
        purchase_date: dayjs(fullPurchase.purchase_date).format('YYYY-MM-DD'),
        payment_method: fullPurchase.payment_method,
        invoice_reference: fullPurchase.invoice_reference || '',
        notes: fullPurchase.notes || '',
        items: fullPurchase.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });
      setEditingId(purchase.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger l\'achat');
    }
  };

  const handleDelete = async (purchaseId) => {
    if (!window.confirm('Supprimer cet achat ? Le stock sera ajusté automatiquement.')) return;
    try {
      await purchaseApi.remove(purchaseId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer l\'achat');
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: '', quantity: '', unit_price: '' }],
    });
  };

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    
    if (field === 'product_id' && value) {
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        newItems[index].unit_price = product.purchase_price;
      }
    }
    
    setForm({ ...form, items: newItems });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Approvisionnement</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Achats</h2>
        <p className="text-sm sm:text-base text-slate-500">
          Enregistrez vos achats fournisseurs. Le stock est automatiquement mis à jour à chaque achat.
        </p>
      </header>

      <section className="space-y-4">
        <CollapsibleSection
          kicker="Formulaire"
          title={editingId ? 'Modifier l\'achat' : 'Nouvel achat'}
          defaultOpen={false}
        >
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-white/60">
            {editingId && (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Annuler
                </button>
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Fournisseur</label>
                  <select
                    value={form.supplier_id}
                    onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Date d'achat</label>
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Mode de paiement</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Référence facture</label>
                  <input
                    type="text"
                    value={form.invoice_reference}
                    onChange={(e) => setForm({ ...form, invoice_reference: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-500">Produits</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-brand hover:text-brand-dark font-medium"
                  >
                    + Ajouter un produit
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-white rounded-2xl border border-slate-200">
                      <div className="sm:col-span-5">
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                          required
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Quantité"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Prix unitaire"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-center justify-center">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Total de l'achat</span>
                  <span className="text-2xl font-bold text-slate-900">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                  rows={2}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-brand text-white py-3 font-semibold shadow-soft hover:bg-brand-dark"
                disabled={loading}
              >
                {editingId ? 'Enregistrer' : 'Créer l\'achat'}
              </button>
            </form>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          kicker="Historique"
          title="Liste des achats"
          defaultOpen={false}
        >
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="text-left text-slate-400 uppercase text-xs tracking-[0.2em]">
                  <tr>
                    <th className="py-2 px-2 sm:px-4">Date</th>
                    <th className="py-2 px-2 sm:px-4">Fournisseur</th>
                    <th className="py-2 px-2 sm:px-4 hidden md:table-cell">Paiement</th>
                    <th className="py-2 px-2 sm:px-4 hidden lg:table-cell">Référence</th>
                    <th className="py-2 px-2 sm:px-4">Produits</th>
                    <th className="py-2 px-2 sm:px-4">Montant</th>
                    <th className="py-2 px-2 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-t border-slate-100">
                      <td className="py-3 px-2 sm:px-4 text-slate-600">{formatDate(purchase.purchase_date)}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <p className="font-semibold text-slate-900">{purchase.supplier_name}</p>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-slate-500 capitalize hidden md:table-cell">
                        {paymentMethods.find((m) => m.value === purchase.payment_method)?.label}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-slate-400 hidden lg:table-cell">
                        {purchase.invoice_reference || '—'}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-slate-500">
                        {purchase.items_count} produit{purchase.items_count > 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-semibold text-slate-900">
                        {formatCurrency(purchase.total_amount)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(purchase)}
                            className="text-xs sm:text-sm text-slate-500 hover:text-brand font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(purchase.id)}
                            className="text-xs sm:text-sm text-slate-400 hover:text-red-500 font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!purchases.length && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Chargement des achats…' : 'Aucun achat enregistré'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>
      </section>
    </div>
  );
};

export default PurchasesPage;
