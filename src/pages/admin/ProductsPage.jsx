import { useState, useEffect, useMemo } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../../services/api';
import ProductForm from '../../components/admin/ProductForm';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Unknown';

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'ALL' || p.categoryId === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCategory]);

  const openForm = (product = null) => { setEditingProduct(product); setIsFormOpen(true); };

  const handleSave = async (productData) => {
    if (editingProduct) await updateProduct(editingProduct.id, productData);
    else await addProduct(productData);
    setIsFormOpen(false);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      await fetchData();
    }
  };

  if (loading) return null;

  return (
    <div className="font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-display font-semibold text-[24px] text-charcoal mb-0.5">Products</h2>
          <p className="font-label text-[10px] tracking-[0.15em] text-warm-grey uppercase">{products.length} total items</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-full hover:bg-rose-600 transition-colors font-label text-[11px] tracking-[0.1em] uppercase"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-grey" size={16} />
          <input 
            type="text" 
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-400 focus:outline-none bg-white font-body text-[15px]"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-grey" size={16} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-100 focus:outline-none bg-white appearance-none font-label text-[11px] tracking-[0.05em]"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-snow border-b border-rose-100 font-label text-[10px] tracking-[0.12em] text-warm-grey uppercase">
              <th className="px-5 py-3.5 font-medium">Product</th>
              <th className="px-5 py-3.5 font-medium">Category</th>
              <th className="px-5 py-3.5 font-medium">Price</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="5" className="px-5 py-12 text-center text-warm-grey font-body italic">No products found.</td></tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-13 rounded-lg overflow-hidden bg-snow flex-shrink-0">
                        {prod.images?.[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-warm-grey">—</div>
                        )}
                      </div>
                      <div>
                        <div className="font-body font-semibold text-[14px] text-charcoal max-w-[220px] truncate">{prod.name}</div>
                        {prod.materialNote && <div className="font-label text-[9px] tracking-[0.1em] text-warm-grey mt-0.5 uppercase">{prod.materialNote}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-label text-[11px] text-charcoal">{getCategoryName(prod.categoryId)}</td>
                  <td className="px-5 py-3.5 price-tag">₹{prod.price}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[9px] font-label tracking-[0.1em] uppercase rounded-full ${
                        prod.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {prod.active ? 'Active' : 'Hidden'}
                      </span>
                      {prod.featured && (
                        <span className="px-2.5 py-1 text-[9px] font-label tracking-[0.1em] uppercase bg-rose-50 text-rose-500 rounded-full">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openForm(prod)} className="p-1.5 text-warm-grey hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-warm-grey hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          categories={categories} 
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
