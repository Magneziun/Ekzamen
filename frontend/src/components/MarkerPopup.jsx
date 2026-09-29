import { Link } from 'react-router-dom';

const MarkerPopup = ({ post }) => {
  const images = post.images || [];
  const previewImage = images.length > 0 ? images[0] : null;

  return (
    <div style={{ padding: '16px', minWidth: '240px' }}>
      {previewImage && (
        <img
          src={previewImage}
          alt="https://i.pinimg.com/736x/6d/1b/c2/6d1bc2d2310748169403bd216a145dbf.jpg"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'block',
          }}
        />
      )}
      <h3 style={{
        fontSize: '17px',
        fontWeight: '600',
        color: '#fff',
        marginBottom: '6px',
      }}>
        {post.title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#fff',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.5',
        marginBottom: '12px',
      }}>
        {post.description}
      </p>
      <Link
        to={`/post/${post.id}`}
        style={{
          display: 'inline-block',
          background: '#941b1b',
          color: '#fff',
          padding: '6px 18px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#7a1414'}
        onMouseLeave={(e) => e.target.style.background = '#941b1b'}
      >
        Подробнее 
      </Link>
    </div>
  );
};

export default MarkerPopup;