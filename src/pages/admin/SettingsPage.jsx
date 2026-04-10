import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/api';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    whatsappNumber: '', featuredSectionLabel: '', brandTagline: '', instagramHandle: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setFormData({
        whatsappNumber: data?.whatsappNumber || '',
        featuredSectionLabel: data?.featuredSectionLabel || 'Just Dropped',
        brandTagline: data?.brandTagline || 'Where love sticks forever',
        instagramHandle: data?.instagramHandle || ''
      });
    } catch { setError('Failed to load settings.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await updateSettings(formData);
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl font-body">
      <div className="mb-6">
        <h2 className="font-display font-semibold text-[24px] text-charcoal mb-0.5">Settings</h2>
        <p className="font-label text-[10px] tracking-[0.15em] text-warm-grey uppercase">Update storefront details</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2 font-body text-[14px]">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 font-body text-[14px]">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/60 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="pb-6 border-b border-rose-50">
            <h3 className="font-display text-[18px] text-charcoal mb-4">Contact & Social</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value.replace(/[^0-9]/g, '')})}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px]"
                  placeholder="91XXXXXXXXXX"
                />
                <p className="mt-1 font-body text-[13px] italic text-warm-grey">Country code + number, no + sign</p>
              </div>
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-grey">@</span>
                  <input 
                    type="text" 
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({...formData, instagramHandle: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px]"
                    placeholder="magniknot"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-display text-[18px] text-charcoal mb-4">Storefront Display</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Brand Tagline</label>
                <input 
                  type="text" 
                  value={formData.brandTagline}
                  onChange={(e) => setFormData({...formData, brandTagline: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px]"
                  placeholder="Where love sticks forever"
                />
                <p className="mt-1 font-body text-[13px] italic text-warm-grey">Displayed in the Hero section</p>
              </div>
              <div>
                <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Featured Section Label</label>
                <input 
                  type="text" 
                  value={formData.featuredSectionLabel}
                  onChange={(e) => setFormData({...formData, featuredSectionLabel: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 font-body text-[15px]"
                  placeholder="Just Dropped"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2.5 rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 font-label text-[11px] tracking-[0.1em] uppercase"
            >
              {saving ? 'Saving...' : (<><Save size={15} /> Save Settings</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
