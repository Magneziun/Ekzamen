import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

// Подставьте свои пути к картинкам (относительно папки с компонентом)
import planetImg from '../assets/planet.jpg';
import markerImg from '../assets/_location_86865.png';

const WelcomePage = () => {
  const navigate = useNavigate();

  const [isDropping, setIsDropping] = useState(false);
  const [isImpact, setIsImpact] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Генерация звёзд для фона (120 штук)
  const stars = useMemo(() => {
    const count = 120;
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 2.2 + 0.8; // от 0.8 до 3px
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${Math.random() * 4 + 2}s`,
        animationDelay: `${Math.random() * 5}s`,
        '--star-opacity': `${Math.random() * 0.5 + 0.3}`,
      };
    });
  }, []);

  const handleStart = () => {
    if (isDropping) return;
    setIsDropping(true);

    // Удар происходит примерно через 480 мс (68% от 700 мс)
    setTimeout(() => {
      setIsImpact(true);
    }, 480);

    // Через 1200 мс (480 + 720) начинаем плавное исчезновение
    setTimeout(() => {
      setIsLeaving(true);
      // Через 450 мс (время transition) переходим на /map
      setTimeout(() => {
        navigate('/map');
      }, 450);
    }, 1200);
  };

  return (
    <div
      className={`welcome-page ${isLeaving ? 'is-leaving' : ''} ${
        isDropping ? 'is-dropping' : ''
      } ${isImpact ? 'is-impact' : ''}`}
    >
      {/* Звёздное небо */}
      <div className="welcome-sky">
        {stars.map((star) => (
          <span
            key={star.id}
            className="welcome-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.width,
              height: star.height,
              animationDuration: star.animationDuration,
              animationDelay: star.animationDelay,
              '--star-opacity': star['--star-opacity'],
            }}
          />
        ))}
      </div>

      {/* Мягкое свечение (nebula) */}
      <div className="welcome-nebula" />

      {/* Затемняющий слой */}
      <div className="welcome-overlay" />

      {/* Текстовый контент и кнопка */}
      <div className="welcome-content">
        <h1 className="welcome-title">Интерактивная карта загадочных локаций</h1>
        <p className="welcome-subtitle">
          Отмечайте любимые локации, оставляйте заметки и делитесь
          впечатлениями. Всё на одной карте — доступно с любого устройства.
        </p>
        <button
          className="welcome-button"
          onClick={handleStart}
          disabled={isDropping}
        >
          перейти на карту
          <span className="welcome-button-arrow">→</span>
        </button>
      </div>

      {/* Планета */}
      <div className="welcome-planet">
        <div className="welcome-planet-glow" />
        <img
          src={planetImg}
          alt="Планета"
          className="welcome-planet-img"
          draggable={false}
        />

        {/* Слой эффектов удара (обрезается по кругу планеты) */}
        <div className="welcome-planet-fx">
          {isImpact && (
            <>
              <div className="welcome-impact-dot" />
              <div className="welcome-impact-ring" />
            </>
          )}
        </div>

        {/* Метка (появляется только при падении) */}
        {isDropping && (
          <img
            src={markerImg}
            alt="Метка"
            className="welcome-marker is-falling"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};

export default WelcomePage;