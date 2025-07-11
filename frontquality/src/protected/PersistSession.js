import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { IonContent, IonPage } from '@ionic/react';

const PersistSession = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [loading, setLoading] = useState(false);
    const hasCheckedSession = useRef(false);

    useEffect(() => {
        if (hasCheckedSession.current) return; // Si ya se ejecutó, no lo vuelve a hacer
        hasCheckedSession.current = true;

        const checkSession = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    login(parsedUser); // Restaura el usuario en el contexto
                    navigate('/Home'); // Redirige al Home
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('user');
                    navigate('/Login');
                }
            } else {
                navigate('/Login');
            }
        };

        checkSession();
    }, [navigate, login]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: '100vh',
                    }}
                >
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

export default PersistSession;
