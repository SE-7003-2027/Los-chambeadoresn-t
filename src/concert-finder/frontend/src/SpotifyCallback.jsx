import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    if (oauthError || !code) {
      const errorTimer = window.setTimeout(() => setError('No se pudo completar la conexión con Spotify.'), 0);
      return () => window.clearTimeout(errorTimer);
    }

    let activo = true;
    axios.post(`${API_URL}/api/auth/spotify/exchange`, { code })
      .then((response) => {
        if (!activo) return;
        localStorage.setItem('rewind:token', response.data.token);
        localStorage.setItem('rewind:user', JSON.stringify(response.data.usuario));
        window.location.replace('/stats');
      })
      .catch((requestError) => {
        if (activo) setError(requestError.response?.data?.error || 'No se pudo iniciar sesión con Spotify.');
      });

    return () => {
      activo = false;
    };
  }, [searchParams]);

  return (
    <main className="stats-page">
      <section className="retro-box stats-panel">
        <h1>{error ? 'CONEXIÓN FALLIDA' : 'CONECTANDO SPOTIFY...'}</h1>
        {error && <p role="alert" className="stats-copy">{error}</p>}
        {error && <Link className="retro-btn stats-button" to="/">VOLVER AL LOGIN</Link>}
      </section>
    </main>
  );
}