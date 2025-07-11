import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import '../styles/notfound.css'; 

const NotFound = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); 
    }, 2000); 
    setLoading(true);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <IonPage>
      <IonContent>
        <div className="not-found-container">
          <h2>Página no encontrada</h2>
          <p>Redirigiendo al inicio...</p>
          {/* Spinner de carga mientras redirige */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFound;