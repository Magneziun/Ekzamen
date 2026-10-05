import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-overlay" />

      <div className="welcome-content">
        <h1 className="welcome-title">
          Интерактивная карта мест
        </h1>

        <p className="welcome-subtitle">
          Отмечайте любимые локации, оставляйте заметки и делитесь
          впечатлениями. Всё на одной карте — доступно с любого устройства.
        </p>

        <button
          className="welcome-button"
          onClick={() => navigate('/map')}
        >
          Открыть карту
          <span className="welcome-button-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;