import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerPopup from './MarkerPopup';
import ContextMenu from './ContextMenu';
import AddPostDialog from './AddPostDialog';
import EditPostDialog from './EditPostDialog';
import { api } from '../api/posts';

import markerIconPng from '../assets/_location_86865.png';

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

const LONG_PRESS_MS = 1000;

/** Считаем, что событие пришло с сенсорного экрана */
const isTouchSource = (domEvent) => {
  if (!domEvent) return false;
  if (domEvent.pointerType === 'touch' || domEvent.pointerType === 'pen') return true;
  // iOS/Android fallback
  if (domEvent.sourceCapabilities?.firesTouchEvents) return true;
  return false;
};

/* ---------- События карты (правый клик + долгое нажатие) ---------- */
const MapEvents = ({ onMapRightClick, children }) => {
  const map = useMapEvents({
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      // На тач-устройствах контекстное меню обрабатываем через таймер долгого нажатия
      if (isTouchSource(e.originalEvent)) return;
      const { lat, lng } = e.latlng;
      onMapRightClick(lat, lng, e.originalEvent.clientX, e.originalEvent.clientY);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    let timer = null;

    const isInteractiveElement = (target) => {
      if (!target || !target.closest) return false;
      return !!(
        target.closest('.leaflet-marker-icon') ||
        target.closest('.leaflet-control')
      );
    };

    const onTouchStart = (e) => {
      if (isInteractiveElement(e.target)) return;
      const touch = e.touches && e.touches[0];
      if (!touch) return;

      const x = touch.clientX;
      const y = touch.clientY;
      const latlng = map.mouseEventToLatLng({ clientX: x, clientY: y });

      timer = setTimeout(() => {
        timer = null;
        if (navigator.vibrate) {
          try { navigator.vibrate(30); } catch { /* noop */ }
        }
        onMapRightClick(latlng.lat, latlng.lng, x, y);
      }, LONG_PRESS_MS);
    };

    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', cancel, { passive: true });
    container.addEventListener('touchcancel', cancel, { passive: true });
    container.addEventListener('touchmove', cancel, { passive: true });
    // перетаскивание мышью тоже отменяет таймер
    map.on('dragstart', cancel);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', cancel);
      container.removeEventListener('touchcancel', cancel);
      container.removeEventListener('touchmove', cancel);
      map.off('dragstart', cancel);
      cancel();
    };
  }, [map, onMapRightClick]);

  return children;
};


const PostMarker = ({ post, onRightClick }) => {
  const map = useMap();
  const timerRef = useRef(null);
  const didLongPressRef = useRef(false);

  const getCenterXY = (e) => {
    const target = e.originalEvent?.target;
    if (target && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return {
      x: e.originalEvent?.clientX ?? 0,
      y: e.originalEvent?.clientY ?? 0,
    };
  };

  const handleContextMenu = (e) => {
    e.originalEvent.preventDefault();

    e.originalEvent._stopped = true;
    if (isTouchSource(e.originalEvent)) return;
    const { x, y } = getCenterXY(e);
    onRightClick(post, x, y);
  };

  const handleTouchStart = (e) => {

    if (e.originalEvent) e.originalEvent._stopped = true;
    didLongPressRef.current = false;
    const { x, y } = getCenterXY(e);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      didLongPressRef.current = true;
      if (navigator.vibrate) {
        try { navigator.vibrate(30); } catch { /* noop */ }
      }
      map.closePopup();
      onRightClick(post, x, y);
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (didLongPressRef.current) {

      setTimeout(() => map.closePopup(), 0);
      setTimeout(() => { didLongPressRef.current = false; }, 300);
    }
  };

  const handleTouchMove = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <Marker
      position={[post.latitude, post.longitude]}
      icon={customIcon}
      eventHandlers={{
        contextmenu: handleContextMenu,
        touchstart: handleTouchStart,
        touchend: handleTouchEnd,
        touchmove: handleTouchMove,
      }}
    >
      <Popup className="custom-popup" closeButton={false}>
        <MarkerPopup post={post} />
      </Popup>
    </Marker>
  );
};

/* ---------- Нижняя панель со всеми локациями ---------- */
const LocationsPanel = ({ posts, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`locations-panel ${expanded ? 'expanded' : ''}`}>
      <div className="locations-panel-header">
        <div className="locations-panel-title">
          <h3>Локации</h3>
          <span className="locations-count">{posts.length}</span>
        </div>
        <button
          type="button"
          className="locations-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Свернуть' : 'Развернуть'}
          title={expanded ? 'Свернуть' : 'Развернуть'}
        >
          {expanded ? '▾' : '▴'}
        </button>
      </div>

      <div className="locations-list">
        {posts.length === 0 ? (
          <div className="locations-empty">
            Пока нет локаций. Нажмите правой кнопкой (или удерживайте палец) на карте, чтобы добавить.
          </div>
        ) : (
          posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className="location-item-btn"
              onClick={() => {
                onSelect(post);
                if (expanded) setExpanded(false);
              }}
              title={post.title}
            >
              <span className="location-item-title">{post.title}</span>
              <span className="location-item-desc">{post.description}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

/* ---------- Основной компонент ---------- */
const MapComponent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPostLocation, setNewPostLocation] = useState(null);
  const [mapCenter] = useState([20, 0]);
  const [mapZoom] = useState(2);

  const mapRef = useRef(null);

  const loadPosts = useCallback(async () => {
    try {
      const data = await api.getAll();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleMapRightClick = useCallback((lat, lng, x, y) => {
    setContextMenu({ x, y, type: 'map', lat, lng });
  }, []);

  const handleMarkerRightClick = useCallback((post, x, y) => {
    setContextMenu({ x, y, type: 'marker', post });
  }, []);

  const handleAddLocation = () => {
    if (contextMenu?.type === 'map') {
      setNewPostLocation({ lat: contextMenu.lat, lng: contextMenu.lng });
      setShowAddDialog(true);
    }
    setContextMenu(null);
  };

  const handleEdit = () => {
    if (contextMenu?.type === 'marker') {
      setEditingPost(contextMenu.post);
      setShowEditDialog(true);
    }
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (contextMenu?.type === 'marker') {
      const post = contextMenu.post;
      if (confirm(`Удалить "${post.title}"?`)) {
        try {
          await api.delete(post.id);
          await loadPosts();
        } catch (err) {
          console.error('Failed to delete:', err);
          alert('Ошибка при удалении');
        }
      }
    }
    setContextMenu(null);
  };

  const handleAddPost = async (formData) => {
    try {
      const newPost = {
        title: formData.title,
        description: formData.description,
        latitude: newPostLocation.lat,
        longitude: newPostLocation.lng,
        images: formData.images || [],
      };
      await api.create(newPost);
      await loadPosts();
      setShowAddDialog(false);
      setNewPostLocation(null);
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Ошибка при создании поста');
    }
  };

  const handleEditPost = async (formData) => {
    try {
      await api.update(editingPost.id, {
        id: editingPost.id,
        title: formData.title,
        description: formData.description,
        latitude: editingPost.latitude,
        longitude: editingPost.longitude,
        images: formData.images || [],
      });
      await loadPosts();
      setShowEditDialog(false);
      setEditingPost(null);
    } catch (err) {
      console.error('Failed to update post:', err);
      alert('Ошибка при обновлении');
    }
  };

  const handleCloseDialogs = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setNewPostLocation(null);
    setEditingPost(null);
  };

  const handleSelectFromPanel = (post) => {
    if (mapRef.current) {
      mapRef.current.flyTo([post.latitude, post.longitude], 12, { duration: 1 });
    }
  };

  return (
    <div className="map-page-wrapper">
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="map-leaflet"
          ref={mapRef}
          attributionControl={false}
        >
<TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
/>
          <MapEvents onMapRightClick={handleMapRightClick}>
            {posts.map((post) => (
              <PostMarker
                key={post.id}
                post={post}
                onRightClick={handleMarkerRightClick}
              />
            ))}
          </MapEvents>
        </MapContainer>
      </div>

      <LocationsPanel posts={posts} onSelect={handleSelectFromPanel} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onAddLocation={handleAddLocation}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showAddDialog && (
        <AddPostDialog
          onClose={handleCloseDialogs}
          onSubmit={handleAddPost}
          location={newPostLocation}
        />
      )}

      {showEditDialog && editingPost && (
        <EditPostDialog
          onClose={handleCloseDialogs}
          onSubmit={handleEditPost}
          post={editingPost}
        />
      )}
    </div>
  );
};

export default MapComponent;