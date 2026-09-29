import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/posts';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getById(id);
        setPost(data);
      } catch (err) {
        setError('Пост не найден');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Загрузка...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '16px',
      }}>
        <h2 style={{ color: '#e74c3c' }}>Ошибка</h2>
        <p>{error || 'Пост не найден'}</p>
        <Link to="/" style={{ color: '#e74c3c', textDecoration: 'none', fontWeight: '500' }}>
           Вернуться на карту
        </Link>
      </div>
    );
  }

  const images = post.images || [];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#2c2c2c',
      padding: '40px 20px',
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        background: '#3a3a3a',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #555',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <Link 
            to="/" 
            style={{
              color: '#e74c3c',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '15px',
            }}
          >
             Обратно на карту
          </Link>
          <span style={{ fontSize: '13px', color: '#888' }}>
            {new Date(post.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#7c7c7c', padding: '4px' }}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Фото ${idx + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '16px',
          }}>
            {post.title}
          </h1>
          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#dddddd',
            whiteSpace: 'pre-wrap',
          }}>
            {post.description}
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            background: '#555555',
            borderRadius: '12px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: '#fffcfc',
          }}>
            <span> Широта: {post.latitude.toFixed(6)}</span>
            <span> Долгота: {post.longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;