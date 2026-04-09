import { useState } from 'react';
import { loginAdmin } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Incorrect email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-snow flex items-center justify-center p-4 font-body">
      <div className="max-w-[400px] w-full bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 md:p-10 border border-rose-100/50">
        
        <div className="text-center mb-8">
          <h1 className="font-display font-semibold text-3xl text-charcoal mb-1">MagniKnot</h1>
          <p className="font-label text-[10px] tracking-[0.2em] text-warm-grey uppercase">Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-2 uppercase">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white font-body text-[16px] text-charcoal transition-all placeholder:text-warm-grey/50 placeholder:italic"
              placeholder="admin@magniknot.com"
            />
          </div>

          <div>
            <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-2 uppercase">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white font-body text-[16px] text-charcoal transition-all placeholder:text-warm-grey/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-body text-[15px] text-rose-500">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-rose-500 text-white rounded-full font-label text-[12px] tracking-[0.15em] uppercase hover:bg-rose-600 transition-all disabled:opacity-60 flex justify-center items-center mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
