import axios from 'axios';

// API URL
const URILOCAL = 'http://localhost:4000/api';
const URIVERCEL = 'https://backquality-two.vercel.app/';
const URI = URIVERCEL;

    const api = axios.create({
        baseURL: URI,
        headers: {  
            'Content-Type': 'application/json',
        },
    });

    // Funcion para el inicio de sesión
    export const login = async (num_empleado, password) => {
        try {
            const response = await api.post('/usuarios/login', { num_empleado, password });
            localStorage.setItem('token', response.data.token); // Save token
            console.log('Token saved to localStorage:', response.data.token);
            return response.data;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    };

    // Funcion para crear usuario
    export const createUsuario = async (num_empleado, nombre, apellidos, password, rol) => {
        try {
            console.log('envío de solicitud de registro de usuario');
            console.log('Datos enviados: ', num_empleado, nombre, password, rol);

            const response = await api.post('/usuarios', {
                num_empleado,
                nombre,
                apellidos,
                password,
                rol,
            });

            return response.data; 
        } catch (error) {
            console.error('Error al registrar usuario: ', error);
                throw error; 
        }
    }

    // Funcion para obtener usuarios
    export const fetchUsuarios = async (token) => {
        try {
            const response = await api.get('/usuarios', {
                headers: {
                    'x-token': token,
                },
        });
        return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios: ', error);
            throw error;
        }
    };

    // Funcion para actualizar usuario por ID
    export const updateUsuario = async (userId, formData, token) => {
        try {
            const response = await api.put(`/usuarios/${userId}`, formData, {
                headers: {
                    'x-token': token, // Ensure the token is passed here
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario: ', error);
            throw error;
        }
    }

    // Funcion para eliminar usuario por ID
    export const deleteUsuario = async (userId, token) => {
        try {
            const response = await api.delete(`/usuarios/${userId}`, {
                headers: {
                    'x-token': token, // Incluye el token en los headers
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al eliminar usuario: ', error);
            throw error;
        }
    };

    // Funcion para obtener usuario por ID
    export const fetchUsuarioById = async (userId) => {
        try {
            const response = await api.get(`/usuarios/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuario por ID: ', error);
            throw error;
        }
    }

    export const fetchUserData = async () => {
        try {
            const response = await api.get(`/usuarios/data`);
            return response.data;
        } catch (error) {
            console.error("Error al traer la información del usuario", error);
            throw error;
        }
    }

    // Funcion para crear minutas
    export const createMinuta = async (minutaData) => {
        try {
            console.log('envío de solicitud de registro de minuta');
            console.log('Datos enviados: ', minutaData);

            const response = await api.post('/minutas', minutaData);
            return response.data;
        } catch (error) {
            console.error('Error al registrar minuta: ', error);
            throw error;
        }
    };

    // Funcion para actualizar minuta por ID
    export const updateMinuta = async (minutaId, minutaData) => {
        try {
            console.log('envío de solicitud de actualización de minuta');
            console.log('Datos enviados: ', minutaData);

            // Verifica que minutaId y minutaData estén definidos
            if (!minutaId || !minutaData) {
                throw new Error('minutaId o minutaData no están definidos');
            }

            const response = await api.put(`/minutas/${minutaId}`, minutaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar minuta: ', error);
            throw error;
        }
    };

    // Funcion para obtener minutas
    export const fetchMinutas = async (token) => {
        try {
            const response = await api.get('/minutas', {
                headers: {
                    'x-token': token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener minutas: ', error);
            throw error;
        }
    }

    // Funcion para eliminar minuta por ID
    export const deleteMinuta = async (minutaId) => {
        try {
            console.log('envío de solicitud de eliminación de minuta');
            const response = await api.delete(`/minutas/${minutaId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar minuta: ', error);
            throw error;
        }
    }

    // Funcion para obtener minutas por ID
    export const fetchMinutaById = async (minutaId) => {
        try {
            const response = await api.get(`/minutas/${minutaId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener minuta por ID: ', error);
            throw error;
        }
    }

    // Funcion para obtener material por ID
    export const fetchMaterialById = async (materialId) => {
        try {
            const response = await api.get(`/material/${materialId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener material por ID: ', error);
            throw error;
        }
    }

    // Funcion para obtener material
    export const fetchMaterial = async (token) => {
        try {
            const response = await api.get('/material', {
                headers: {
                    'x-token': token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener material: ', error);
            throw error;
        }
    }

    // Funcion para crear material
    export const createMaterial = async (materialData) => {
        try {
            console.log('envío de solicitud de registro de material');
            console.log('Datos enviados: ', materialData);

            const response = await api.post('/material', materialData);
            return response.data;
        } catch (error) {
            console.error('Error al registrar material: ', error);
            throw error;
        }
    }

    // Funcion para actualizar material por ID
    export const updateMaterial = async (materialId, materialData) => {
        try {
            console.log('envío de solicitud de actualización de material');
            console.log('Datos enviados: ', materialData);

            const response = await api.put(`/material/${materialId}`, materialData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar material: ', error);
            throw error;
        }
    }

    //Función para eliminar material por ID
    export const deleteMaterial = async (materialId) => {
        try {
            console.log('envío de solicitud de eliminación de material');
            const response = await api.delete(`/material/${materialId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar material: ', error);
            throw error;
        }
    }

    // Funcion para obtener inspecciones 
    export const fetchInspecciones = async (token) => {
        try {
            const response = await api.get('/inspeccion', {
                headers: {
                    'x-token': token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener inspecciones: ', error);
            throw error;
        }
    }

    // Funcion para obtener inspecciones por ID
    export const fetchInspeccionById = async (inspeccionId) => {
        try {
            const response = await api.get(`/inspeccion/${inspeccionId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener inspeccion por ID: ', error);
            throw error;
        }
    }

    // Funcion para crear inspecciones
    export const createInspeccion = async (inspeccionData) => {
        try {
            console.log('envío de solicitud de registro de inspeccion');
            console.log('Datos enviados: ', inspeccionData);

            const response = await api.post('/inspeccion', inspeccionData);
            return response.data;
        } catch (error) {
            console.error('Error al registrar inspeccion: ', error);
            throw error;
        }
    }

    // Funcion para actualizar inspeccion por ID
    export const updateInspeccion = async (inspeccionId, inspeccionData) => {
        try {
            console.log('envío de solicitud de actualización de inspeccion');
            console.log('Datos enviados: ', inspeccionData);

            const response = await api.put(`/inspeccion/${inspeccionId}`, inspeccionData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar inspeccion: ', error);
            throw error;
        }
    }

    // Funcion para eliminar inspeccion por ID
    export const deleteInspeccion = async (inspeccionId) => {
        try {
            console.log('envío de solicitud de eliminación de inspeccion');
            const response = await api.delete(`/inspeccion/${inspeccionId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar inspeccion: ', error);
            throw error;
        }
    }

    export const saveGraficaData = async (data) => {
        try {
            const response = await api.post('/grafica/save', data);
            console.log('Datos guardados exitosamente:', response.data);
        } catch (error) {
            console.error('Error al guardar los datos de la gráfica:', error);
        }
    };

    export const fetchGraficaData = async () => {
        try {
            const response = await api.get('/grafica');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los datos de la gráfica:', error);
            throw error;
        }
    };

    export const saveBulkGraficaData = async (dataArray, token) => {
        try {
        const response = await api.post('/grafica/save-bulk', dataArray, {
            headers: {
            'x-token': token,
            },
        });
        return response.data;
        } catch (error) {
        console.error('Error al guardar datos masivos:', error);
        throw error;
        }
    };


    export const fetchGraficaStatus = async (token) => {
        try {
            const response = await api.get('/status', {
                headers: {
                    'x-token': token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el status:', error);
            throw error;
        }
    };

    export const saveGraficaStatus = async (statusData, token) => {
        try {
            const response = await api.post('/status/save-status', statusData, {
                headers: {
                    'x-token': token,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error al guardar el status:', error);
            throw error;
        }
    };

