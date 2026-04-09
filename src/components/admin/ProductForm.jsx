import { useState, useRef } from 'react';
import { uploadProductImage, deleteImageByUrl } from '../../services/api';
import { X, UploadCloud, GripVertical, AlertCircle, Trash2 } from 'lucide-react';

export default function ProductForm({ product, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    categoryId: product?.categoryId || '',
    description: product?.description || '',
    materialNote: product?.materialNote || '',
    images: product?.images || [],
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const dragItem = useRef();
  const dragOverItem = useRef();
  const fileInputRef = useRef();

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (formData.images.length + files.length > 4) { setError('Maximum 4 images.'); return; }
    setUploading(true); setError('');
    try {
      const urls = [];
      const tempId = product?.id || `temp_${Date.now()}`;
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} exceeds 5MB.`);
        urls.push(await uploadProductImage(file, tempId));
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) { setError(err.message || 'Upload failed.'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeImage = async (idx) => {
    const url = formData.images[idx];
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    try { await deleteImageByUrl(url); } catch (e) { console.warn(e); }
  };

  const handleDragStart = (e, index) => { dragItem.current = index; };
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    const items = [...formData.images];
    const dragged = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, dragged);
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setFormData(prev => ({ ...prev, images: items }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.images.length) { setError('Please upload at least one image.'); return; }
    setSaving(true);
    try { await onSave({ ...formData, price: Number(formData.price) }); }
    catch { setError('Failed to save.'); setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px] text-charcoal placeholder:italic placeholder:text-warm-grey/50";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        
        <div className="flex justify-between items-center p-6 border-b border-rose-50">
          <h3 className="font-display font-semibold text-[20px] text-charcoal">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-warm-grey hover:text-charcoal transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2 font-body text-[14px]">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Product Name</label>
                <input type="text" required maxLength={80} value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={inputCls} placeholder="e.g. Gold Plated Ring" />
              </div>
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Price (₹)</label>
                <input type="number" required min="0" step="1" value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={inputCls} placeholder="299" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Category</label>
                <select required value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className={`${inputCls} appearance-none`}>
                  <option value="" disabled>Select a category</option>
                  {categories.filter(c => c.active).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Material Note</label>
                <input type="text" maxLength={40} value={formData.materialNote}
                  onChange={(e) => setFormData({...formData, materialNote: e.target.value})}
                  className={inputCls} placeholder="e.g. Sterling silver" />
              </div>
            </div>

            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Description</label>
              <textarea maxLength={300} rows={3} value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`${inputCls} resize-none`} placeholder="Product description..." />
            </div>

            {/* Images */}
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-2 uppercase">Images (Max 4)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {formData.images.map((url, index) => (
                  <div key={url} draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={() => { dragItem.current = null; }}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative group aspect-[4/5] rounded-xl overflow-hidden border border-rose-100 cursor-move bg-snow"
                  >
                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <GripVertical className="text-white" size={20} />
                      <button type="button" className="bg-white/20 p-1.5 rounded-full hover:bg-rose-500 text-white transition-colors" onClick={() => removeImage(index)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {index === 0 && <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[8px] font-label tracking-wider px-2 py-0.5 rounded-full uppercase">Primary</span>}
                  </div>
                ))}

                {formData.images.length < 4 && (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/5] rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 flex flex-col items-center justify-center cursor-pointer text-warm-grey hover:text-rose-500 transition-colors"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-rose-500"></div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="mb-1.5" />
                        <span className="text-[10px] font-label tracking-wider">Upload</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" multiple onChange={handleImageUpload} />
            </div>

            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-4 h-4 text-rose-500 rounded border-rose-300 focus:ring-rose-200 accent-rose-500" />
                <span className="font-label text-[11px] text-charcoal">Featured</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-rose-500 rounded border-rose-300 focus:ring-rose-200 accent-rose-500" />
                <span className="font-label text-[11px] text-charcoal">Active</span>
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-rose-50 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-rose-200 text-warm-grey rounded-full hover:bg-rose-50 transition-colors font-label text-[11px] tracking-[0.1em] uppercase"
          >Cancel</button>
          <button form="product-form" type="submit" disabled={saving || uploading}
            className="flex-1 py-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 font-label text-[11px] tracking-[0.1em] uppercase"
          >{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </div>
    </div>
  );
}
