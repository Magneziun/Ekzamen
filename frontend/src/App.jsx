import { Routes, Route } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import PostDetail from './components/PostDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapComponent />} />
      <Route path="/post/:id" element={<PostDetail />} />
    </Routes>
  );
}

export default App;