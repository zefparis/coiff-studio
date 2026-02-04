import { useEffect, useMemo, useState } from 'react';
import { productApi, supplierApi } from '../lib/resources.js';
import { formatCurrency } from '../utils/format.js';
import CollapsibleSection from '../components/CollapsibleSection.jsx';

const emptyForm = {
  name: '',
  category: 'soin',
  supplier_id: '',
  purchase_price: '',
  sale_price: '',
  stock_quantity: '',
  alert_threshold: '5',
  unit: 'unité',
  notes: '',
};

const categories = [
  { value: 'coloration', label: 'Coloration' },
  { value: 'soin', label: 'Soin' },
  { value: 'revente', label: 'Revente' },
  { value: 'equipement', label: 'Équipement' },
  { value: 'autre', label: 'Autre' },
];

const stockStatusColors = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  alerte: 'bg-amber-50 text-amber-700 border-amber-200',
  rupture: 'bg-red-50 text-red-700 border-red-200',
};

const stockStatusLabels = {
  ok: '✓ En stock',
  alerte: '⚠ Alerte',
  rupture: '✗ Rupture',
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((product) =>
        [product.name, product.category, product.supplier_name, product.notes].some((value) =>
          value?.toLowerCase().includes(query)
        )
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    if (stockFilter !== 'all') {
      filtered = filtered.filter((product) => product.stock_status === stockFilter);
    }

    return filtered;
  }, [products, search, categoryFilter, stockFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, suppliersData] = await Promise.all([
        productApi.list(),
        supplierApi.list(),
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les produits');
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
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        purchase_price: Number(form.purchase_price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : 0,
        alert_threshold: Number(form.alert_threshold),
      };

      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }

      await loadData();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible d\'enregistrer le produit');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      supplier_id: product.supplier_id || '',
      purchase_price: product.purchase_price,
      sale_price: product.sale_price || '',
      stock_quantity: product.stock_quantity,
      alert_threshold: product.alert_threshold,
      unit: product.unit,
      notes: product.notes || '',
    });
    setEditingId(product.id);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await productApi.remove(productId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer le produit');
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Stock</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Produits</h2>
        <p className="text-sm sm:text-base text-slate-500">
          Gérez votre stock de produits : colorations, soins, revente et équipement. Alertes automatiques en cas de stock faible.
        </p>
      </header>

      <section className="space-y-4">
        <CollapsibleSection
          kicker="Formulaire"
          title={editingId ? 'Modifier le produit' : 'Ajouter un produit'}
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
                  <label className="text-sm text-slate-500">Nom du produit</label>
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
                  <label className="text-sm text-slate-500">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Fournisseur</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                >
                  <option value="">Aucun fournisseur</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Prix d'achat (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Prix de vente (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Stock actuel</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Seuil d'alerte</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.alert_threshold}
                    onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Unité</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                    placeholder="unité, tube, flacon..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
                  rows={2}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-brand text-white py-3 font-semibold shadow-soft hover:bg-brand-dark"
                disabled={loading}
              >
                {editingId ? 'Enregistrer' : 'Créer le produit'}
              </button>
            </form>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          kicker="Inventaire"
          title="Liste des produits"
          defaultOpen={false}
        >
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="search"
                placeholder="Rechercher un produit"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="all">Tous les stocks</option>
                  <option value="ok">En stock</option>
                  <option value="alerte">Alerte</option>
                  <option value="rupture">Rupture</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="text-left text-slate-400 uppercase text-xs tracking-[0.2em]">
                  <tr>
                    <th className="py-2 px-2 sm:px-4">Produit</th>
                    <th className="py-2 px-2 sm:px-4">Catégorie</th>
                    <th className="py-2 px-2 sm:px-4 hidden md:table-cell">Fournisseur</th>
                    <th className="py-2 px-2 sm:px-4">Prix achat</th>
                    <th className="py-2 px-2 sm:px-4 hidden lg:table-cell">Prix vente</th>
                    <th className="py-2 px-2 sm:px-4">Stock</th>
                    <th className="py-2 px-2 sm:px-4">Statut</th>
                    <th className="py-2 px-2 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="py-3 px-2 sm:px-4">
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.unit}</p>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-slate-600 capitalize">{product.category}</td>
                      <td className="py-3 px-2 sm:px-4 text-slate-500 hidden md:table-cell">
                        {product.supplier_name || '—'}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-slate-600">{formatCurrency(product.purchase_price)}</td>
                      <td className="py-3 px-2 sm:px-4 text-slate-600 hidden lg:table-cell">
                        {product.sale_price ? formatCurrency(product.sale_price) : '—'}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="font-semibold text-slate-900">
                          {product.stock_quantity} {product.unit}
                        </span>
                        <p className="text-xs text-slate-400">Seuil: {product.alert_threshold}</p>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full border text-xs font-semibold ${stockStatusColors[product.stock_status]}`}>
                          {stockStatusLabels[product.stock_status]}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="text-xs sm:text-sm text-slate-500 hover:text-brand font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="text-xs sm:text-sm text-slate-400 hover:text-red-500 font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredProducts.length && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {loading ? 'Chargement des produits…' : 'Aucun produit'}
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

export default ProductsPage;
