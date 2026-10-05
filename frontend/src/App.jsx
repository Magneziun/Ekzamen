import { Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import MapComponent from './components/MapComponent';
import PostDetail from './components/PostDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/map" element={<MapComponent />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;