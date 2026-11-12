import { useNavigate } from 'react-router-dom';

export default function StatsPage() {
  const navigate = useNavigate();

  return (
    <main className="stats-page">
      <section className="retro-box stats-panel">
        <p className="stats-kicker">REWIND / TU MEZCLA PRINCIPAL</p>
        <h1>Tu mapa musical está listo.</h1>
        <p className="stats-copy">
          Descubre conciertos cerca de ti y filtra la cartelera con tus artistas favoritos.
        </p>
        <div className="stats-grid">
          <div className="stats-tile">
            <strong>01</strong>
            <span>Explora la cartelera</span>
          </div>
          <div className="stats-tile stats-tile-red">
            <strong>02</strong>
            <span>Encuentra tu próximo show</span>
          </div>
        </div>
        <button type="button" className="retro-btn stats-button" onClick={() => navigate('/conciertos')}>
          VER CONCIERTOS
        </button>
      </section>
    </main>
  );
}