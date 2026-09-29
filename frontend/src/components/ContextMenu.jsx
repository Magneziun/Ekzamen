import { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, type, onAddLocation, onEdit, onDelete, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Position menu within viewport
    const menu = menuRef.current;
    if (menu) {
      const rect = menu.getBoundingClientRect();
      let left = x;
      let top = y;
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width - 10;
      }
      if (top + rect.height > window.innerHeight) {
        top = window.innerHeight - rect.height - 10;
      }
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [x, y, onClose]);

  return (
    <div className="context-menu" ref={menuRef} style={{ left: x, top: y}}>
      {type === 'map' && (
        <button onClick={onAddLocation}>
           Добавить локацию
        </button>
      )}
      {type === 'marker' && (
        <>
          <button onClick={onEdit}>
            Редактировать
          </button>
          <button onClick={onDelete} className="danger">
             Удалить
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;