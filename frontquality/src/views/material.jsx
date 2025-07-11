import React, { useState, useEffect } from "react";
import { fetchMaterial, createMaterial, updateMaterial, deleteMaterial } from "../api/api";
import "../styles/material.css";
import Tab from "../components/Tab";
import { useNavigate } from "react-router-dom"
import "../styles/minutas.css";
import defectClassification from '../assets/códigos/CLASIFICACION_DE_LOS_TIEMPOS_MUERTOS.json';


const Material = () => {
    const [userRole, setUserRole] = useState("usuario");
    const [materiales, setMateriales] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState({
        fecha: "",
        no_maquina: "",
        no_molde: "",
        no_parte: "",
        responsable: "",
        material: "",
        cantidad_bien: 0,
        defectos: [],
        total_bien: 0,
        total_mal: 0,
        total_final: 0,
        destino: "",
        observaciones: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [materialPerPage, setMaterialPerPage] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ fecha: "" });
    const [showDefectos, setShowDefectos] = useState(false);
    const [datos, setDatos] = useState([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState("920B-PROGRAM");
    const navigate = useNavigate();

    // Cargar los datos del archivo JSON correspondiente al proyecto seleccionado
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await import(`../assets/datos_json/${proyectoSeleccionado}.json`);
                setDatos(data.default);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };

        cargarDatos();
    }, [proyectoSeleccionado]);

    // Obtener el rol del usuario al cargar el componente
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.rol) {
            setUserRole(user.rol);
        }
    }, []);

    // Cargar materiales al inicio
    useEffect(() => {
        loadMateriales();
    }, []);

    const loadMateriales = async () => {
        setLoading(true);
        try {
            const data = await fetchMaterial();
            // Ordenar por fecha (del más reciente al más antiguo)
            const sortedData = data.sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
            });
            setMateriales(sortedData);
        } catch (err) {
            setError("Error al cargar los materiales");
        } finally {
            setLoading(false);
        }
    };

    // Reemplazar la función getDefectDescription actual con esta versión mejorada:
const getDefectDescription = (codeString) => {
    if (!codeString) return null;

    // Dividir múltiples códigos si existen (separados por coma)
    const codes = codeString.split(',').map(code => code.trim());
    
    // Procesar cada código
    const descriptions = codes.map(code => {
        // Extraer la letra y el número del código (ej: "G4" -> letra: "G", número: "4")
        const match = code.match(/([A-Z]+)(\d+)/);
        if (!match) return null;

        const [_, letter, number] = match;
        
        // Encontrar la categoría correspondiente al número
        const category = defectClassification.CLASIFICACION_DE_TIEMPOS_MUERTOS.find(
            cat => cat.numero === parseInt(number)
        );

        if (!category) return null;

        // Buscar la descripción en los códigos de la categoría
        const description = category.codigos[letter];
        if (!description) return null;

        return description;
    });

    // Filtrar descripciones nulas y combinar los resultados
    const validDescriptions = descriptions.filter(desc => desc !== null);
    return validDescriptions.length > 0 ? validDescriptions.join(', ') : null;
};

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentMaterial._id) {
                await updateMaterial(currentMaterial._id, currentMaterial);
            } else {
                await createMaterial(currentMaterial);
            }
            setShowModal(false);
            loadMateriales();
        } catch (err) {
            setError("Error al guardar el material");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteMaterial(id);
            loadMateriales();
            setShowConfirmDelete(false);
            setMaterialToDelete(null);
        } catch (err) {
            setError("Error al eliminar el material");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (material) => {
        setCurrentMaterial({
            ...material,
            fecha: new Date(material.fecha).toISOString().split("T")[0],
        });
        setShowModal(true);
    };

    const handleInputChange = (field, value) => {
        setCurrentMaterial({ ...currentMaterial, [field]: value });

        // Autocompletar otros campos basados en el valor ingresado
        if (field === "no_molde" || field === "no_parte") {
            const matchingData = datos.find(item => item.no_molde === value || item.no_parte === value);
            if (matchingData) {
                setCurrentMaterial(prev => ({
                    ...prev,
                    no_molde: matchingData.no_molde,
                    no_parte: matchingData.no_parte,
                    material: matchingData.material,
                }));
            }
        }
    };

    const handleDefectoChange = (index, field, value) => {
        const newDefectos = [...currentMaterial.defectos];
        if (field === "cantidad_mal") {
            newDefectos[index] = { ...newDefectos[index], [field]: Number(value) };
        } else {
            newDefectos[index] = { ...newDefectos[index], [field]: value };
        }
        setCurrentMaterial({ ...currentMaterial, defectos: newDefectos });
    };

    const addDefecto = () => {
        setCurrentMaterial({
            ...currentMaterial,
            defectos: [...currentMaterial.defectos, { tipo: '', cantidad_mal: 0 }],
        });
    };

    const removeDefecto = (index) => {
        const newDefectos = currentMaterial.defectos.filter((_, i) => i !== index);
        setCurrentMaterial({ ...currentMaterial, defectos: newDefectos });
    };

    const handleView = (material) => {
        setCurrentMaterial({
            ...material,
            fecha: new Date(material.fecha).toISOString().split("T")[0],
        });
        setShowDetailsModal(true);
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const filterMaterial = (materiales, searchTerm, filters) => {
        return materiales
            .filter((material) => {
                const matchFecha = filters.fecha
                    ? new Date(material.fecha).toISOString().split("T")[0] === filters.fecha
                    : true;
    
                const matchResponsable = searchTerm
                    ? material.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
                    : true;
    
                const matchMaquina = searchTerm
                    ? material.no_maquina?.toLowerCase().includes(searchTerm.toLowerCase())
                    : true;
    
                const matchParte = searchTerm
                    ? material.no_parte?.toLowerCase().includes(searchTerm.toLowerCase())
                    : true;
    
                return matchFecha && (matchMaquina || matchResponsable || matchParte);
            })
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Mantener el orden descendente
    };

    const handleSearch = () => {
        setFilters({ ...filters, searchTerm });
    };

    const filteredMaterial = filterMaterial(materiales, searchTerm, filters);

    const indexOfLastMaterial = currentPage * materialPerPage;
    const indexOfFirstMaterial = indexOfLastMaterial - materialPerPage;
    const currentMateriales = filteredMaterial.slice(indexOfFirstMaterial, indexOfLastMaterial);
    const totalPages = Math.ceil(filteredMaterial.length / materialPerPage);


    useEffect(() => {
        const totalBien = Number(currentMaterial.total_bien);
        const totalMal = Number(currentMaterial.total_mal);
        const totalFinal = totalBien + totalMal;
        setCurrentMaterial((prev) => ({ ...prev, total_final: totalFinal }));
    }, [currentMaterial.total_bien, currentMaterial.total_mal]);

    useEffect(() => {
        setCurrentMaterial((prev) => ({ ...prev, total_bien: prev.cantidad_bien }));
    }, [currentMaterial.cantidad_bien]);

    useEffect(() => {
        const totalMal = currentMaterial.defectos.reduce((sum, defecto) => sum + (defecto.cantidad_mal || 0), 0);
        setCurrentMaterial((prev) => ({ ...prev, total_mal: totalMal }));
    }, [currentMaterial.defectos]);

    return (
        <div className="material-container">
            <Tab />
            <div className="scroll">
            <header className="material-header">
                    <div className="navigation-buttons">
                        <button
                            className="button button-secondary back-button"
                            onClick={() => navigate(-1)}
                            aria-label="Regresar atrás"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            <span>Regresar</span>
                        </button>
                        <h1>Reportes de Material Segregado</h1>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`button button-secondary reload-button ${loading ? 'loading' : ''}`}
                            onClick={loadMateriales}
                            disabled={loading}
                            aria-label="Recargar materiales"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <path d="M21.5 2v6h-6M21.5 22v-6h-6M2 11.5a10 10 0 0 1 18-5M22 12.5a10 10 0 0 1-18 5"/>
                            </svg>
                            <span>Recargar</span>
                        </button>
                        <button
                            className="button button-primary create-button"
                            onClick={() => {
                                setCurrentMaterial({
                                    fecha: new Date().toISOString().split("T")[0],
                                    no_maquina: '',
                                    no_molde: '',
                                    no_parte: '',
                                    responsable: '',
                                    material: '',
                                    cantidad_bien: 0,
                                    defectos: [],
                                    total_bien: 0,
                                    total_mal: 0,
                                    total_final: 0,
                                });
                                setShowModal(true);
                            }}
                            disabled={loading}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>Nuevo Material</span>
                        </button>
                    </div>
                </header>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por máquina o numero de parte"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="button button-primary" onClick={handleSearch}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="material-grid">
                    {currentMateriales.map((material) => (
                        <div key={material._id} className="material-card">
                            <div className="material-card-header">
                            <h3>{new Date(new Date(material.fecha).setDate(new Date(material.fecha).getDate() + 1)).toLocaleDateString()}</h3>
                                <div className="material-actions">
                                    <button
                                        className="button button-icon button-info"
                                        onClick={() => handleView(material)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="icon"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                    {userRole === "admin" && (
                                        <button
                                            className="button button-icon"
                                            onClick={() => handleEdit(material)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="icon"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    )}
                                    {userRole === "admin" && (
                                        <button
                                            className="button button-icon button-danger"
                                            onClick={() => {
                                                setMaterialToDelete(material);
                                                setShowConfirmDelete(true);
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="icon"
                                            >
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="material-card-content">
                                <div className="material-info">
                                    <div className="material-info-item">
                                        <strong>Máquina:</strong>
                                        <span>{material.no_maquina}</span>
                                    </div>
                                    <div className="material-info-item">
                                        <strong>Molde:</strong>
                                        <span>{material.no_molde}</span>
                                    </div>
                                    <div className="material-info-item">
                                        <strong>Parte:</strong>
                                        <span>{material.no_parte}</span>
                                    </div>
                                </div>
                                <div className="material-details">
                                    <div className="material-details-item">
                                        <strong>Responsable:</strong>
                                        <span>{material.responsable}</span>
                                    </div>
                                    <div className="material-details-item">
                                        <strong>Total Final:</strong>
                                        <span>{material.total_final}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredMaterial.length > materialPerPage && (
                    <div className="pagination">
                        <button className="button button-secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            <span className="pagination-text">Anterior</span>
                        </button>
                        <span className="pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button className="button button-secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <span className="pagination-text">Siguiente</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>{currentMaterial._id ? "Editar Material" : "Nuevo Material"}</h2>
                                <button className="button button-icon" onClick={() => setShowModal(false)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="proyecto">Proyecto</label>
                                        <select
                                            id="proyecto"
                                            value={proyectoSeleccionado}
                                            onChange={(e) => setProyectoSeleccionado(e.target.value)}
                                            required
                                        >
                                            <option value="3BH">3BH</option>
                                            <option value="920B-PROGRAM">920B-PROGRAM</option>
                                            <option value="DJ-MCA">DJ-MCA</option>
                                            <option value="MP-MCA">MP-MCA</option>
                                            <option value="SUBARU S-PROGRAM">SUBARU S-PROGRAM</option>
                                            <option value="TOYOTA S-PROGRAM">TOYOTA S-PROGRAM</option>
                                            <option value="CD4">CD4</option>
                                            <option value="780B">780B</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fecha">Fecha</label>
                                        <input
                                            type="date"
                                            id="fecha"
                                            value={currentMaterial.fecha}
                                            onChange={(e) => handleInputChange("fecha", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="no_maquina">Número de Máquina</label>
                                        <select
                                            id="no_maquina"
                                            value={currentMaterial.no_maquina}
                                            onChange={(e) => handleInputChange("no_maquina", e.target.value)}
                                            required
                                        >
                                            <option value="">Selecciona una máquina</option>
                                            {Array.from({ length: 13 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    Máquina {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="no_molde">Número de Molde</label>
                                        <input
                                            type="text"
                                            id="no_molde"
                                            value={currentMaterial.no_molde}
                                            onChange={(e) => handleInputChange("no_molde", e.target.value)}
                                            placeholder="Número de Molde"
                                            list="no_molde_list"
                                            required
                                        />
                                        <datalist id="no_molde_list">
                                            {datos.map((item, index) => (
                                                <option key={index} value={item.no_molde} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="no_parte">Número de Parte</label>
                                        <select
                                            id="no_parte"
                                            value={currentMaterial.no_parte}
                                            onChange={(e) => {
                                                handleInputChange("no_parte", e.target.value);
                                                // Autocompletar otros campos cuando se selecciona una parte
                                                const selectedPart = datos.find(item => item.no_parte === e.target.value);
                                                if (selectedPart) {
                                                    setCurrentMaterial(prev => ({
                                                        ...prev,
                                                        no_molde: selectedPart.no_molde,
                                                        material: selectedPart.material,
                                                        no_mating: selectedPart.no_mating !== "N/A" ? [{ valor: selectedPart.no_mating, descripcion: "" }] : [],
                                                        no_gage: selectedPart.no_gage ? [{ valor: selectedPart.no_gage, descripcion: "" }] : []
                                                    }));
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Seleccione un número de parte</option>
                                            {datos.map((item, index) => (
                                                <option key={index} value={item.no_parte}>
                                                    {item.no_parte}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="responsable">Responsable</label>
                                        <input
                                            type="text"
                                            id="responsable"
                                            placeholder="Responsable"
                                            value={currentMaterial.responsable}
                                            onChange={(e) => handleInputChange("responsable", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="material">Material</label>
                                        <input
                                            type="text"
                                            id="material"
                                            value={currentMaterial.material}
                                            onChange={(e) => handleInputChange("material", e.target.value)}
                                            placeholder="Material"
                                            list="material_list"
                                            required
                                        />
                                        <datalist id="material_list">
                                            {datos.map((item, index) => (
                                                <option key={index} value={item.material} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="destino">Destino</label>
                                        <input
                                            type="text"
                                            id="destino"
                                            placeholder="Destino"
                                            value={currentMaterial.destino}
                                            onChange={(e) => handleInputChange("destino", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cantidad_bien">Cantidad Bien</label>
                                        <input
                                            type="number"
                                            id="cantidad_bien"
                                            value={currentMaterial.cantidad_bien}
                                            onChange={(e) => handleInputChange("cantidad_bien", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-section">
                                    <button
                                        type="button"
                                        className="button button-secondary"
                                        onClick={() => setShowDefectos(!showDefectos)}
                                    >
                                        {showDefectos ? "Ocultar Defectos" : "Mostrar Defectos"}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="icon"
                                            style={{
                                                transform: showDefectos ? "rotate(180deg)" : "none",
                                                transition: "transform 0.3s ease",
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {showDefectos && (
                                        <div className="defectos-section">
                                            {currentMaterial.defectos.map((defecto, index) => (
                                                <div key={index} className="defecto-row">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            value={defecto.tipo}
                                                            onChange={(e) => handleDefectoChange(index, "tipo", e.target.value)}
                                                            placeholder="Tipo de defecto (ej. G4)"
                                                        />
                                                        {defecto.tipo && (
                                                            <span className="defect-description">
                                                            {getDefectDescription(defecto.tipo) || "Código no reconocido"}
                                                            </span>
                                                        )}
                                                        </div>
                                                        <div className="form-group">
                                                        <input
                                                            type="number"
                                                            value={defecto.cantidad_mal}
                                                            onChange={(e) => handleDefectoChange(index, "cantidad_mal", e.target.value)}
                                                            placeholder="Cantidad"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="button button-icon button-danger"
                                                        onClick={() => removeDefecto(index)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="icon"
                                                        >
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                    
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="button button-secondary"
                                                onClick={addDefecto}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="icon"
                                                >
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <line x1="19" y1="8" x2="19" y2="14" />
                                                    <line x1="16" y1="11" x2="22" y2="11" />
                                                </svg>
                                                Agregar Defecto
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <br />
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="total_bien">Total Bien</label>
                                        <input
                                            type="number"
                                            id="total_bien"
                                            value={currentMaterial.total_bien}
                                            onChange={(e) => handleInputChange("total_bien", e.target.value)}
                                            required
                                            disabled 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="total_mal">Total Mal</label>
                                        <input
                                            type="number"
                                            id="total_mal"
                                            value={currentMaterial.total_mal}
                                            onChange={(e) => handleInputChange("total_mal", e.target.value)}
                                            required
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="total_final">Total Final</label>
                                        <input
                                            type="number"
                                            id="total_final"
                                            value={currentMaterial.total_final}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="observaciones">Observaciones</label>
                                        <input
                                            type="text"
                                            id="observaciones"
                                            placeholder="Observaciones"
                                            value={currentMaterial.observaciones}
                                            onChange={(e) => handleInputChange("observaciones", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="button button-primary">
                                        {currentMaterial._id ? "Actualizar" : "Crear"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showDetailsModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h2>Detalles del Material</h2>
                                <button
                                    className="button button-icon"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fecha">Fecha</label>
                                        <input
                                            type="date"
                                            id="fecha"
                                            value={currentMaterial.fecha}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="no_maquina">Número de Máquina</label>
                                        <input
                                            type="text"
                                            id="no_maquina"
                                            value={currentMaterial.no_maquina}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="no_molde">Número de Molde</label>
                                        <input
                                            type="text"
                                            id="no_molde"
                                            value={currentMaterial.no_molde}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="no_parte">Número de Parte</label>
                                        <input
                                            type="text"
                                            id="no_parte"
                                            value={currentMaterial.no_parte}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="responsable">Responsable</label>
                                        <input
                                            type="text"
                                            id="responsable"
                                            value={currentMaterial.responsable}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="material">Material</label>
                                        <input
                                            type="text"
                                            id="material"
                                            value={currentMaterial.material}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="destino">Destino</label>
                                        <input
                                            type="text"
                                            id="destino"
                                            placeholder="Destino"
                                            value={currentMaterial.destino}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cantidad_bien">Cantidad Bien</label>
                                        <input
                                            type="number"
                                            id="cantidad_bien"
                                            value={currentMaterial.cantidad_bien}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-section">
                                    <button
                                        type="button"
                                        className="button button-secondary"
                                        onClick={() => setShowDefectos(!showDefectos)}
                                    >
                                        {showDefectos ? "Ocultar Defectos" : "Mostrar Defectos"}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="icon"
                                            style={{
                                                transform: showDefectos ? "rotate(180deg)" : "none",
                                                transition: "transform 0.3s ease",
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {showDefectos && (
                                        <div className="defectos-section">
                                            {currentMaterial.defectos.map((defecto, index) => (
                                                <div key={index} className="defecto-row">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                value={`${defecto.tipo}${getDefectDescription(defecto.tipo) ? ` (${getDefectDescription(defecto.tipo)})` : ''}`}
                                                                readOnly
                                                                disabled
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                value={defecto.cantidad_mal}
                                                                readOnly
                                                                disabled
                                                            />
                                                        </div>
                                                    
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <br />
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="total_bien">Total Bien</label>
                                        <input
                                            type="number"
                                            id="total_bien"
                                            value={currentMaterial.total_bien}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="total_mal">Total Mal</label>
                                        <input
                                            type="number"
                                            id="total_mal"
                                            value={currentMaterial.total_mal}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="total_final">Total Final</label>
                                        <input
                                            type="number"
                                            id="total_final"
                                            value={currentMaterial.total_final}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="observaciones">Observaciones</label>
                                        <input
                                            type="text"
                                            placeholder="Observaciones"
                                            id="observaciones"
                                            value={currentMaterial.observaciones}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="button button-secondary"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showConfirmDelete && (
                    <div className="modal-overlay">
                        <div className="modal confirm-dialog">
                            <h3>¿Eliminar material?</h3>
                            <p>Esta acción no se puede deshacer.</p>
                            <div className="modal-footer">
                                <button
                                    className="button button-secondary"
                                    onClick={() => {
                                        setShowConfirmDelete(false);
                                        setMaterialToDelete(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button className="button button-danger" onClick={() => handleDelete(materialToDelete._id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Material;