import React from 'react';
import { IonApp } from '@ionic/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/home';
import Material from './views/material';
import Minutas from './views/minutas';
import LoginForm from './views/login';
import Usuarios from './views/usuarios';
import Inspecciones from './views/inspeccion';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './protected/ProtectedRoute';
import NotFound from './protected/NotFound';
import PersistSession from './protected/PersistSession';
import Graficas from './views/graficas';

function App() {
  return (
    <UserProvider>
      <IonApp>
        <Router>
          <Routes>
            <Route path="/" element={<PersistSession />} />
            <Route path="/Login" element={<LoginForm />} />
            <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/Material" element={<ProtectedRoute><Material /></ProtectedRoute>} />
            <Route path="/Minutas" element={<ProtectedRoute><Minutas /></ProtectedRoute>} />
            <Route path="/Inspeccion" element={<ProtectedRoute><Inspecciones /></ProtectedRoute>} />
            <Route path="/Usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/Graficas" element={<ProtectedRoute><Graficas /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} /> {/* Ruta para páginas no encontradas */}
          </Routes>
        </Router>
      </IonApp>
    </UserProvider>
  );
}

export default App;