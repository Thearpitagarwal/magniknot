import { useState, useEffect, useRef } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory, updateCategoriesOrder } from '../../services/api';
import { GripVertical, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', active: true });
  const [saving, setSaving] = useState(false);

  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { setCategories(await getCategories()); }
    catch (err) { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  const openForm = (category = null) => {
    setError('');
    if (category) { setEditingCategory(category); setFormData({ name: category.name, active: category.active }); }
    else { setEditingCategory(null); setFormData({ name: '', active: true }); }
    setIsModalOpen(true);
  };

  const closeForm = () => { setIsModalOpen(false); setEditingCategory(null); };

  const handleDragStart = (e, index) => { dragItem.current = index; };
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    const items = [...categories];
    const dragContent = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, dragContent);
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setCategories(items);
  };
  const handleDragEnd = async () => {
    try { await updateCategoriesOrder(categories); } catch { setError('Failed to save order.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editingCategory) await updateCategory(editingCategory.id, formData);
      else await addCategory({ ...formData, order: categories.length + 1 });
      await fetchCategories(); closeForm();
    } catch { setError('Failed to save category.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await deleteCategory(id); await fetchCategories(); }
    catch (err) { window.alert(err.message); }
  };

  if (loading) return <div className="animate-spin h-5 w-5 border-2 border-rose-200 border-t-rose-500 rounded-full mx-auto mt-20"></div>;

  return (
    <div className="max-w-3xl font-body">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-semibold text-[24px] text-charcoal">Categories</h2>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-full hover:bg-rose-600 transition-colors font-label text-[11px] tracking-[0.1em] uppercase"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2 font-body text-[14px]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60">
        {categories.length === 0 ? (
          <div className="p-10 text-center text-warm-grey font-body italic">No categories found.</div>
        ) : (
          <div className="divide-y divide-rose-50">
            {categories.map((cat, index) => (
              <div 
                key={cat.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50/30 transition-colors"
              >
                <div className="cursor-move text-warm-grey/40 hover:text-warm-grey"><GripVertical size={18} /></div>
                <div className="flex-1 font-body font-semibold text-[15px] text-charcoal">{cat.name}</div>
                <span className={`px-2.5 py-1 text-[9px] font-label tracking-[0.1em] uppercase rounded-full ${
                  cat.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.active ? 'Active' : 'Hidden'}
                </span>
                <span className="font-label text-[11px] text-warm-grey w-8 text-center">{cat.order || index + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => openForm(cat)} className="p-1.5 text-warm-grey hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-warm-grey hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={closeForm} className="absolute right-4 top-4 text-warm-grey hover:text-charcoal"><X size={18} /></button>
            <h3 className="font-display font-semibold text-[20px] text-charcoal mb-5">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Category Name</label>
                <input 
                  type="text" required maxLength={40}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px]"
                  placeholder="e.g. Chains"
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" id="activeToggle"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-rose-500 rounded border-rose-300 focus:ring-rose-200 accent-rose-500"
                />
                <label htmlFor="activeToggle" className="font-label text-[11px] text-charcoal">Active (Visible on Storefront)</label>
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-2.5 border border-rose-200 text-warm-grey rounded-full hover:bg-rose-50 transition-colors font-label text-[11px] tracking-[0.1em] uppercase"
                >Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 font-label text-[11px] tracking-[0.1em] uppercase"
                >{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
