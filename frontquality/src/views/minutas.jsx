import { useState, useEffect, useMemo } from "react";
import { fetchMinutas, createMinuta, updateMinuta, deleteMinuta } from "../api/api";
import "../styles/minutas.css";
import Tab from "../components/Tab";
import { useNavigate } from "react-router-dom"


const Minutas = () => {
  const [userRole, setUserRole] = useState("usuario");
  const [minutas, setMinutas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [currentMinuta, setCurrentMinuta] = useState({
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "",
    hora_fin: "",
    asistentes: [],
    asuntosTratados: [],
    compromisosAsumidos: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAsistentes, setShowAsistentes] = useState(false);
  const [showAsuntosTratados, setShowAsuntosTratados] = useState(false);
  const [showCompromisosAsumidos, setShowCompromisosAsumidos] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [minutaToDelete, setMinutaToDelete] = useState(null);
  const [minutasPerPage, setMinutasPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ fecha: "" });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMinuta, setSelectedMinuta] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    asistentes: [],
    asuntosTratados: [],
    compromisosAsumidos: [],
  });

  // Obtener el rol del usuario al cargar el componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Obtener los datos del usuario
    if (user && user.rol) {
      setUserRole(user.rol); // Actualizar el estado con el rol del usuario
    }
  }, []);

  useEffect(() => {
    loadMinutas();
  }, []);

  const loadMinutas = async () => {
    setLoading(true);
    try {
        const data = await fetchMinutas();
        // Ordenar por fecha (del más reciente al más antiguo)
        const sortedData = data.sort((a, b) => {
            return new Date(b.fecha) - new Date(a.fecha);
        });
        setMinutas(sortedData);
    } catch (err) {
        setError("Error al cargar las minutas");
    } finally {
        setLoading(false);
    }
};

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentMinuta._id) {
        await updateMinuta(currentMinuta._id, currentMinuta);
      } else {
        await createMinuta(currentMinuta);
      }
      setShowModal(false);
      loadMinutas();
    } catch (err) {
      setError("Error al guardar la minuta");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMinuta(id);
      loadMinutas();
      setShowConfirmDelete(false);
      setMinutaToDelete(null);
    } catch (err) {
      setError("Error al eliminar la minuta");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (minuta) => {
    setCurrentMinuta({
      ...minuta,
      fecha: new Date(minuta.fecha).toISOString().split("T")[0],
      asistentes: minuta.asistentes || [],
      asuntosTratados: minuta.asuntosTratados || [],
      compromisosAsumidos: minuta.compromisosAsumidos || [],
    });
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setCurrentMinuta({ ...currentMinuta, [field]: value });
  };

  const handleAsistenteChange = (index, field, value) => {
    const newAsistentes = [...currentMinuta.asistentes];
    newAsistentes[index] = { ...newAsistentes[index], [field]: value };
    setCurrentMinuta({ ...currentMinuta, asistentes: newAsistentes });
  };

  const handleAsuntoTratadoChange = (index, field, value) => {
    const newAsuntosTratados = [...currentMinuta.asuntosTratados];
    newAsuntosTratados[index] = { ...newAsuntosTratados[index], [field]: value };
    setCurrentMinuta({ ...currentMinuta, asuntosTratados: newAsuntosTratados });
  };

  const handleCompromisoAsumidoChange = (index, field, value) => {
    const newCompromisosAsumidos = [...currentMinuta.compromisosAsumidos];
    newCompromisosAsumidos[index] = { ...newCompromisosAsumidos[index], [field]: value };
    setCurrentMinuta({ ...currentMinuta, compromisosAsumidos: newCompromisosAsumidos });
  };

  const addAsistente = () => {
    setCurrentMinuta({
      ...currentMinuta,
      asistentes: [...currentMinuta.asistentes, { nombre: "", confirmacion: "" }],
    });
  };

  const removeAsistente = (index) => {
    const newAsistentes = currentMinuta.asistentes.filter((_, i) => i !== index);
    setCurrentMinuta({ ...currentMinuta, asistentes: newAsistentes });
  };

  const addAsuntoTratado = () => {
    setCurrentMinuta({
      ...currentMinuta,
      asuntosTratados: [...currentMinuta.asuntosTratados, { maquina: "", concepto: "" }],
    });
  };

  const removeAsuntoTratado = (index) => {
    const newAsuntosTratados = currentMinuta.asuntosTratados.filter((_, i) => i !== index);
    setCurrentMinuta({ ...currentMinuta, asuntosTratados: newAsuntosTratados });
  };

  const addCompromisoAsumido = () => {
    setCurrentMinuta({
      ...currentMinuta,
      compromisosAsumidos: [...(currentMinuta.compromisosAsumidos || []), { no_compromiso: "", tarea: "", responsable: "" }],
    });
  };

  const removeCompromisoAsumido = (index) => {
    const newCompromisosAsumidos = currentMinuta.compromisosAsumidos.filter((_, i) => i !== index);
    setCurrentMinuta({ ...currentMinuta, compromisosAsumidos: newCompromisosAsumidos });
  };

  const updateMinutasPerPage = () => {
    if (window.innerWidth < 640) {
      setMinutasPerPage(3);
    } else {
      setMinutasPerPage(6);
    }
  };

  useEffect(() => {
    updateMinutasPerPage();
    window.addEventListener("resize", updateMinutasPerPage);
    return () => window.removeEventListener("resize", updateMinutasPerPage);
  }, []);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const filterMinutas = (minutas, searchTerm, filters) => {
    return minutas
        .filter((minuta) => {
            const matchFecha = filters.fecha
                ? new Date(minuta.fecha).toISOString().split("T")[0] === filters.fecha
                : true;

            const matchMaquina = searchTerm
                ? minuta.asuntosTratados?.some((asunto) =>
                    asunto.maquina.toLowerCase().includes(searchTerm.toLowerCase())
                ) : true;

            const matchResponsable = searchTerm
                ? minuta.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            return matchFecha && (matchMaquina || matchResponsable);
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Mantener el orden descendente
  };

  const handleSearch = () => {
    setFilters({ ...filters, searchTerm });
  };

  const filteredMinutas = filterMinutas(minutas, searchTerm, filters);

  const indexOfLastMinuta = currentPage * minutasPerPage;
  const indexOfFirstMinuta = indexOfLastMinuta - minutasPerPage;
  const currentMinutas = useMemo(
    () => filteredMinutas.slice(indexOfFirstMinuta, indexOfLastMinuta),
    [filteredMinutas, indexOfFirstMinuta, indexOfLastMinuta]
  );
  const totalPages = useMemo(
    () => Math.ceil(filteredMinutas.length / minutasPerPage),
    [filteredMinutas, minutasPerPage]
  );

  return (
    <div className="minutas-container">
      <Tab />
      <div className="scroll">
      <header className="minutas-header">
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
            <h1>Minutas</h1>
          </div>
          <div className="header-actions">
            <button
              className={`button button-secondary reload-button ${loading ? 'loading' : ''}`}
              onClick={loadMinutas}
              disabled={loading}
              aria-label="Recargar minutas"
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
                setCurrentMinuta({
                  fecha: new Date().toISOString().split("T")[0],
                  hora_inicio: "",
                  hora_fin: "",
                  asistentes: [],
                  asuntosTratados: [],
                  compromisosAsumidos: [],
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
              <span>Nueva Minuta</span>
            </button>
          </div>
        </header>

        {/* Input de búsqueda y botón de filtro */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por máquina o responsable"
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

        {/* Mostrar las minutas filtradas en cards */}
        <div className="minutas-grid">
          {currentMinutas.map((minuta) => (
            <div key={minuta._id} className="minuta-card">
              <div className="minuta-card-header">
                <h3>{new Date(minuta.fecha).toLocaleDateString()}</h3>
                <div className="minuta-actions">
                  <button
                    className="button button-icon button-info"
                    onClick={() => {
                      setSelectedMinuta(minuta);
                      setShowDetails(true);
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  {userRole === "admin" && (
                  <button
                    className="button button-icon"
                    onClick={() => handleEdit(minuta)}
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
                      setMinutaToDelete(minuta);
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
              <div className="minuta-card-content">
                <div className="minuta-info">
                  <span>
                    <strong>Hora:</strong>
                    <span>
                      {minuta.hora_inicio} - {minuta.hora_fin}
                    </span>
                  </span>
                  <span>
                    <strong>Máquinas:</strong>
                    <span>
                      {minuta.asuntosTratados
                        ?.map((asunto) => asunto.maquina)
                        .join(", ")}
                    </span>
                  </span>
                </div>
                <div className="minuta-details">
                  <p>
                    <strong>Tareas:</strong>
                    <span style={{ whiteSpace: "pre-line" }}>
                      {minuta.compromisosAsumidos?.length > 1
                        ? `${minuta.compromisosAsumidos[0].tarea} ...` // Muestra la primera tarea y "..."
                        : minuta.compromisosAsumidos
                            ?.map((compromiso) => compromiso.tarea)
                            .join("\n")}
                    </span>
                  </p>
                  <p>
                    <strong>Responsables:</strong>
                    <span style={{ whiteSpace: "pre-line" }}>
                      {minuta.compromisosAsumidos?.length > 1
                        ? `${minuta.compromisosAsumidos[0].responsable} ...` // Muestra el primer responsable y "..."
                        : minuta.compromisosAsumidos
                            ?.map((compromiso) => compromiso.responsable)
                            .join("\n")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {filteredMinutas.length > minutasPerPage && (
          <div className="pagination">
            <button
              className="button button-secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="pagination-text">Anterior</span>
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="button button-secondary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
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

        {/* Modal para editar / crear nueva minuta */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{currentMinuta._id ? "Editar Minuta" : "Nueva Minuta"}</h2>
                <button
                  className="button button-icon"
                  onClick={() => setShowModal(false)}
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
              <form onSubmit={handleSave} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fecha">Fecha</label>
                    <input
                      type="date"
                      id="fecha"
                      value={currentMinuta.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora_inicio">Hora Inicio</label>
                    <input
                      type="time"
                      id="hora_inicio"
                      value={currentMinuta.hora_inicio}
                      onChange={(e) => handleInputChange("hora_inicio", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora_fin">Hora Fin</label>
                    <input
                      type="time"
                      id="hora_fin"
                      value={currentMinuta.hora_fin}
                      onChange={(e) => handleInputChange("hora_fin", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowAsistentes(!showAsistentes)}
                  >
                    {showAsistentes ? "Ocultar Asistentes" : "Mostrar Asistentes"}
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
                        transform: showAsistentes ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showAsistentes && (
                    <div className="asistentes-section">
                      {currentMinuta.asistentes.map((asistente, index) => (
                        <div key={index} className="asistente-row">
                          <div className="form-group">
                            <label>Nombre</label>
                            <input
                              type="text"
                              value={asistente.nombre}
                              onChange={(e) =>
                                handleAsistenteChange(index, "nombre", e.target.value)
                              }
                              placeholder="Nombre del asistente"
                            />
                          </div>
                          <div className="form-group">
                            <label>Estado</label>
                            <select
                              value={asistente.confirmacion}
                              onChange={(e) =>
                                handleAsistenteChange(index, "confirmacion", e.target.value)
                              }
                            >
                              <option value="">Seleccionar...</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Pendiente">Pendiente</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            className="button button-icon button-danger"
                            onClick={() => removeAsistente(index)}
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
                        onClick={addAsistente}
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
                        Agregar Asistente
                      </button>
                    </div>
                  )}
                </div>

                <br />

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowAsuntosTratados(!showAsuntosTratados)}
                  >
                    {showAsuntosTratados ? "Ocultar Asuntos Tratados" : "Mostrar Asuntos Tratados"}
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
                        transform: showAsuntosTratados ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showAsuntosTratados && (
                    <div className="asuntos-tratados-section">
                      {currentMinuta.asuntosTratados.map((asunto, index) => (
                        <div key={index} className="asunto-row">
                          <div className="form-group">
                            <label>Máquina</label>
                            <select
                              value={asunto.maquina}
                              onChange={(e) =>
                                handleAsuntoTratadoChange(index, "maquina", e.target.value)
                              }
                              required
                            >
                              <option value="">Selecciona una máquina</option>
                              {Array.from({ length: 13 }, (_, i) => (
                                <option key={i + 1} value={`${i + 1}`}>
                                  Máquina {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Concepto</label>
                            <input
                              type="text"
                              value={asunto.concepto}
                              onChange={(e) =>
                                handleAsuntoTratadoChange(index, "concepto", e.target.value)
                              }
                              placeholder="Concepto"
                            />
                          </div>
                          <button
                            type="button"
                            className="button button-icon button-danger"
                            onClick={() => removeAsuntoTratado(index)}
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
                        onClick={addAsuntoTratado}
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
                        Agregar Asunto Tratado
                      </button>
                    </div>
                  )}
                </div>

                <br />

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowCompromisosAsumidos(!showCompromisosAsumidos)}
                  >
                    {showCompromisosAsumidos ? "Ocultar Compromisos Asumidos" : "Mostrar Compromisos Asumidos"}
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
                        transform: showCompromisosAsumidos ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showCompromisosAsumidos && (
                    <div className="compromisos-asumidos-section">
                      {currentMinuta.compromisosAsumidos?.map((compromiso, index) => (
                        <div key={index} className="compromiso-row">
                          <div className="form-group">
                            <label>Número de Compromiso</label>
                            <input
                              type="text"
                              value={compromiso.no_compromiso}
                              onChange={(e) =>
                                handleCompromisoAsumidoChange(index, "no_compromiso", e.target.value)
                              }
                              placeholder="Número de Compromiso"
                            />
                          </div>
                          <div className="form-group">
                            <label>Tarea</label>
                            <input
                              type="text"
                              value={compromiso.tarea}
                              onChange={(e) =>
                                handleCompromisoAsumidoChange(index, "tarea", e.target.value)
                              }
                              placeholder="Tarea"
                            />
                          </div>
                          <div className="form-group">
                            <label>Responsable</label>
                            <input
                              type="text"
                              value={compromiso.responsable}
                              onChange={(e) =>
                                handleCompromisoAsumidoChange(index, "responsable", e.target.value)
                              }
                              placeholder="Responsable"
                            />
                          </div>
                          <button
                            type="button"
                            className="button button-icon button-danger"
                            onClick={() => removeCompromisoAsumido(index)}
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
                        onClick={addCompromisoAsumido}
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
                        Agregar Compromiso Asumido
                      </button>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="button button-primary">
                    {currentMinuta._id ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para ver los detalles de la minuta */}
        {showDetails && selectedMinuta && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Detalles de la Minuta</h2>
                <button
                  className="button button-icon"
                  onClick={() => setShowDetails(false)}
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
              <div className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fecha">Fecha</label>
                    <input
                      type="date"
                      id="fecha"
                      value={new Date(selectedMinuta.fecha).toISOString().split("T")[0]}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora_inicio">Hora Inicio</label>
                    <input
                      type="time"
                      id="hora_inicio"
                      value={selectedMinuta.hora_inicio}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hora_fin">Hora Fin</label>
                    <input
                      type="time"
                      id="hora_fin"
                      value={selectedMinuta.hora_fin}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowAsistentes(!showAsistentes)}
                  >
                    {showAsistentes ? "Ocultar Asistentes" : "Mostrar Asistentes"}
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
                        transform: showAsistentes ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showAsistentes && (
                    <div className="asistentes-section">
                      {selectedMinuta.asistentes?.map((asistente, index) => (
                        <div key={index} className="asistente-row">
                          <div className="form-group">
                            <label>Nombre</label>
                            <input
                              type="text"
                              value={asistente.nombre}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label>Estado</label>
                            <input
                              type="text"
                              value={asistente.confirmacion}
                              readOnly
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowAsuntosTratados(!showAsuntosTratados)}
                  >
                    {showAsuntosTratados ? "Ocultar Asuntos Tratados" : "Mostrar Asuntos Tratados"}
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
                        transform: showAsuntosTratados ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showAsuntosTratados && (
                    <div className="asuntos-tratados-section">
                      {selectedMinuta.asuntosTratados?.map((asunto, index) => (
                        <div key={index} className="asunto-row">
                          <div className="form-group">
                            <label>Máquina</label>
                            <input
                              type="text"
                              value={asunto.maquina}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label>Concepto</label>
                            <input
                              type="text"
                              value={asunto.concepto}
                              readOnly
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowCompromisosAsumidos(!showCompromisosAsumidos)}
                  >
                    {showCompromisosAsumidos ? "Ocultar Compromisos Asumidos" : "Mostrar Compromisos Asumidos"}
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
                        transform: showCompromisosAsumidos ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showCompromisosAsumidos && (
                    <div className="compromisos-asumidos-section">
                      {selectedMinuta.compromisosAsumidos?.map((compromiso, index) => (
                        <div key={index} className="compromiso-row">
                          <div className="form-group">
                            <label>Número de Compromiso</label>
                            <input
                              type="text"
                              value={compromiso.no_compromiso}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label>Tarea</label>
                            <input
                              type="text"
                              value={compromiso.tarea}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label>Responsable</label>
                            <input
                              type="text"
                              value={compromiso.responsable}
                              readOnly
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowDetails(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para confirmar delete */}
        {showConfirmDelete && (
          <div className="modal-overlay">
            <div className="modal confirm-dialog">
              <h3>¿Eliminar minuta?</h3>
              <p>Esta acción no se puede deshacer.</p>
              <div className="modal-footer">
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setMinutaToDelete(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDelete(minutaToDelete._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Componente de pantalla de carga */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Minutas;