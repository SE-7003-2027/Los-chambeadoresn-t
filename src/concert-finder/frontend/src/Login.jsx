import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const endpoint = registrando ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, { email, password });
      localStorage.setItem('rewind:token', response.data.token);
      localStorage.setItem('rewind:user', JSON.stringify(response.data.usuario));
      navigate('/stats');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos completar el acceso.');
    } finally {
      setCargando(false);
    }
  };

  const handleSpotifyLogin = () => {
    window.location.href = `${API_URL}/auth/spotify`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="retro-box" style={{ maxWidth: '400px', width: '100%', backgroundColor: 'var(--rewind-blue)' }}>
        <h1 style={{ color: 'white', fontSize: '3rem', textAlign: 'center' }}>REWIND</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input 
            type="email" 
            placeholder="CORREO ELECTRÓNICO" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', border: 'var(--border-thick)', fontFamily: 'Space Mono' }}
          />
          <input 
            type="password" 
            placeholder="CONTRASEÑA" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', border: 'var(--border-thick)', fontFamily: 'Space Mono' }}
          />
          <button type="submit" className="retro-btn" disabled={cargando} style={{ backgroundColor: 'var(--rewind-yellow)', color: 'black', border: 'var(--border-thick)' }}>
            {cargando ? 'CARGANDO...' : registrando ? 'CREAR CUENTA' : 'ENTRAR'}
          </button>
        </form>

        {error && <p role="alert" style={{ color: 'var(--rewind-yellow)', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
        <button type="button" className="retro-btn" onClick={() => { setRegistrando(!registrando); setError(''); }} style={{ marginTop: '15px', width: '100%', background: 'transparent', border: '2px solid white' }}>
          {registrando ? 'YA TENGO CUENTA' : 'CREAR CUENTA NUEVA'}
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0', color: 'white' }}>--- O ---</div>

        <button onClick={handleSpotifyLogin} className="retro-btn btn-spotify" style={{ width: '100%' }}>
          CONECTAR CON SPOTIFY
        </button>
      </div>
    </div>
  );
}