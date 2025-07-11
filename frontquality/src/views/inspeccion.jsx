import { useState, useEffect } from "react";
import {
  fetchInspecciones,
  createInspeccion,
  updateInspeccion,
  deleteInspeccion,
} from "../api/api";
import "../styles/inspecciones.css";
import "../styles/inspecciones-fix.css";
import "../styles/modal-create-insp.css";
import Tab from "../components/Tab";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
} from "lucide-react";

const Inspecciones = () => {
  // Estados para el formulario de inspección
  const horas = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
  ];

  const [inspeccionesValues, setInspeccionesValues] = useState({});
  const [textFields, setTextFields] = useState({
    "TARJETA KANBAN/POS": {},
    OBSERVACIONES: {},
  });
  const [matngRows, setMatngRows] = useState([
    { id: "matng-0", name: "No. MATING" },
    { id: "matng-special", name: "CARACT. ESPECIAL" },
    { id: "matng-termo1", name: "TERMOREGULADORES 1" },
    { id: "matng-termo2", name: "TERMOREGULADORES 2" }
  ]);
  const [gageRows, setGageRows] = useState([
    { id: "gage-0", name: "No. GAGE" },
    { id: "gage-special", name: "CARACT. ESPECIAL GAGE" }
  ]);
  const [newRowName, setNewRowName] = useState("");
  const [newRowType, setNewRowType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [userRole, setUserRole] = useState("usuario");
  const [inspecciones, setInspecciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentInspeccion, setCurrentInspeccion] = useState({
    fecha: new Date().toISOString().split("T")[0],
    no_molde: "",
    no_parte: "",
    no_maquina: "",
    cavidades: "",
    material: "",
    estado: "",
    hora: "",
    auditor: "",
    turno: "",
    hora_fija: "",
    inspeccion: "",
    kanban: "",
    verificacion_apariencia: "",
    no_mating: [],
    no_gage: [],
    maquina_estado: "",
    observaciones_maquina: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [inspeccionToDelete, setInspeccionToDelete] = useState(null);
  const [inspeccionesPerPage, setInspeccionesPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fecha: "",
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInspeccion, setSelectedInspeccion] = useState(null);
  const [datos, setDatos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] =
    useState("920B-PROGRAM");
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await import(
          `../assets/datos_json/${proyectoSeleccionado}.json`
        );
        setDatos(data.default);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, [proyectoSeleccionado]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.rol) {
      setUserRole(user.rol);
    }
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    if (showModal && !currentInspeccion._id) {
      setCurrentInspeccion((prev) => ({
        ...prev,
        hora: getCurrentTime(),
      }));
    }
  }, [showModal]);

  useEffect(() => {
    const initialInspecciones = {};
    const fvHoras = ["07:00", "10:00", "13:00", "15:00", "18:00", "21:00", "23:00", "02:00", "05:00"];
  
    // Inicializar para todas las horas
    horas.forEach((hora) => {
      initialInspecciones[`INSPECCIÓN-${hora}`] = fvHoras.includes(hora) ? "F-V" : "V";
    });
  
    
    if (currentInspeccion.turno) {
      getHorasRango(currentInspeccion.turno).forEach((hora) => {
        if (!initialInspecciones[`INSPECCIÓN-${hora}`]) {
          initialInspecciones[`INSPECCIÓN-${hora}`] = fvHoras.includes(hora) ? "F-V" : "V";
        }
      });
    }
  
    setInspeccionesValues(initialInspecciones);
  }, [currentInspeccion.turno]);

  const getInspeccionValue = (fila, hora) => {
    const key = `${fila}-${hora}`;
    return inspeccionesValues[key] || "";
  };

  useEffect(() => {
    if (currentInspeccion.hora_fija) {
      const inspeccionValue = getInspeccionValue(currentInspeccion.hora_fija);
      setCurrentInspeccion((prev) => ({
        ...prev,
        inspeccion: inspeccionValue,
      }));
    }
  }, [currentInspeccion.hora_fija]);

  const verificacionAparienciaOptions = [
    "O (OK)",
    "/ (NO APLICA)",
    "X (NG) "
  ];

  const estadoOptions = [
    "IP (Inicio de producción)",
    "RP (Reinicio de producción)",
    "PM (Paro de máquina)",
    "TP (Termino de producción)",
  ];

  const maquinaOptions = [
    "O (OK)",
    "/ (NO APLICA)",
    "FFE (FUNCIONAL, FORMA, ENSAMBLE)",
  ];

  const loadInspecciones = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInspecciones();
      // Ordenar por fecha (del más reciente al más antiguo)
      const sortedData = data.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
      });
      setInspecciones(sortedData);
      setCurrentPage(1);
      setSearchTerm("");
      setFilters({ fecha: "" });
    } catch (err) {
      console.error("Error al cargar las inspecciones:", err);
      setError(
        "Error al cargar las inspecciones. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspecciones();
  }, []);

  // Handlers para el formulario de inspección
  const handleInspeccionChange = (fila, hora, valor) => {
    const key = `${fila}-${hora}`;
    setInspeccionesValues((prev) => ({ ...prev, [key]: valor }));
  };

  const handleTextFieldChange = (fila, hora, valor) => {
    setTextFields((prev) => ({
      ...prev,
      [fila]: { ...prev[fila], [hora]: valor },
    }));
  };

  const getTextFieldValue = (fila, hora) => {
    // Buscar en textFields primero
    const textValue = textFields[fila]?.[hora];
    if (textValue !== undefined) return textValue;
  
    // Si no se encuentra, buscar en los items de la inspección actual
    if (currentInspeccion.items) {
      const item = currentInspeccion.items.find(item => item.nombre === fila);
      if (item) {
        const valor = item.valores.find(v => v.hora === hora);
        return valor ? valor.valor : "";
      }
    }
  
    return "";
  };

  const openAddRowDialog = (type) => {
    setNewRowType(type);
    setNewRowName("");
    setDialogOpen(true);
  };

  // Función para agregar filas dinámicas
  const addCustomRow = () => {
    if (!newRowName.trim() || !newRowType) return;

    const timestamp = Date.now();

    if (newRowType === "matng") {
      setMatngRows((prev) => [
        ...prev,
        { id: `matng-${timestamp}`, name: newRowName },
      ]);
    } else if (newRowType === "gage") {
      setGageRows((prev) => [
        ...prev,
        { id: `gage-${timestamp}`, name: newRowName },
      ]);
    }

    setDialogOpen(false);
    setNewRowName("");
    setNewRowType(null);
  };

  const removeRow = (type, id) => {
    if (type === "matng") {
      setMatngRows((prev) => prev.filter((row) => row.id !== id));
    } else if (type === "gage") {
      setGageRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const buildTableRows = () => {
    const rows = [
      { id: "ESTADO", type: "select", options: estadoOptions }, 
      { id: "INSPECCIÓN", type: "fixed" },
      { id: "TARJETA KANBAN/POS", type: "text" },
      {
        id: "VERIFICACIÓN DE APARIENCIA",
        type: "select",
        options: verificacionAparienciaOptions
      },
      ...matngRows.map((row) => ({
        id: row.name,
        rowId: row.id,
        type: "text",
        canDelete: row.id !== "matng-0",
        rowType: "matng",
      })),
      ...gageRows.map((row) => ({
        id: row.name,
        rowId: row.id,
        type: "text",
        canDelete: row.id !== "gage-0",
        rowType: "gage",
      })),
      {
        id: "MÁQUINA LIMPIA",
        type: "select",
        options: maquinaOptions 
      },
      { id: "OBSERVACIONES", type: "text" },
    ];
  
    return rows;
  };

  const getHorasRango = (turno) => {
    switch (turno) {
      case 'Primer-turno':
        return horas.slice(0, 17); // 07:00 a 15:00
      case 'Segundo-turno':
        return horas.slice(17, 34); // 15:00 a 23:00
      case 'Tercer-turno':
        return horas.slice(34); // 23:00 a 07:00
      default:
        return horas; // Todos los horarios si no hay turno seleccionado
    }
  };

  const resetForm = () => {
    setCurrentInspeccion({
      fecha: new Date().toISOString().split('T')[0],
      no_molde: '',
      no_parte: '',
      no_maquina: '',
      cavidades: '',
      material: '',
      estado: '',
      hora: getCurrentTime(),
      auditor: '',
      turno: '',
      hora_fija: '',
      inspeccion: '',
      kanban: '',
      verificacion_apariencia: '',
      no_mating: [],
      no_gage: [],
      maquina_estado: '',
      observaciones_maquina: ''
    });
    
    // Resetear valores de la tabla
    const initialInspecciones = {};
    const fvHoras = ["07:00", "10:00", "13:00", "15:00", "18:00", "21:00", "23:00", "02:00", "05:00"];
    
    horas.forEach((hora) => {
      initialInspecciones[`INSPECCIÓN-${hora}`] = fvHoras.includes(hora) ? "F-V" : "V";
    });
  
    setInspeccionesValues(initialInspecciones);
    setTextFields({
      "TARJETA KANBAN/POS": {},
      "OBSERVACIONES": {}
    });
    
    // Resetear filas dinámicas a sus valores iniciales
    setMatngRows([
      { id: "matng-0", name: "No. MATING" },
      { id: "matng-special", name: "CARACT. ESPECIAL" },
      { id: "matng-termo1", name: "TERMOREGULADORES 1" },
      { id: "matng-termo2", name: "TERMOREGULADORES 2" }
    ]);
    setGageRows([
      { id: "gage-0", name: "No. GAGE" },
      { id: "gage-special", name: "CARACT. ESPECIAL GAGE" }
    ]);
  };

  // Función para resetear el formulario a valores iniciales
  const handleOpenNewInspection = () => {
    // Resetear todos los estados relacionados con la inspección
    resetForm();
    
    // Establecer valores por defecto
    setCurrentInspeccion({
      fecha: new Date().toISOString().split("T")[0],
      no_molde: "",
      no_parte: "",
      no_maquina: "",
      cavidades: "",
      material: "",
      estado: "",
      hora: getCurrentTime(),
      auditor: "",
      turno: "",
      hora_fija: "",
      inspeccion: "",
      kanban: "",
      verificacion_apariencia: "",
      no_mating: [],
      no_gage: [],
      maquina_estado: "",
      observaciones_maquina: "",
    });
  
    // Reiniciar valores de la tabla
    const initialInspecciones = {};
    const fvHoras = ["07:00", "10:00", "13:00", "15:00", "18:00", "21:00", "23:00", "02:00", "05:00"];
    
    horas.forEach((hora) => {
      initialInspecciones[`INSPECCIÓN-${hora}`] = fvHoras.includes(hora) ? "F-V" : "V";
    });
  
    setInspeccionesValues(initialInspecciones);
    setTextFields({
      "TARJETA KANBAN/POS": {},
      "OBSERVACIONES": {}
    });
  
    // Reiniciar filas dinámicas
    setMatngRows([
      { id: "matng-0", name: "No. MATING" },
      { id: "matng-special", name: "CARACT. ESPECIAL" },
      { id: "matng-termo1", name: "TERMOREGULADORES 1" },
      { id: "matng-termo2", name: "TERMOREGULADORES 2" }
    ]);
    setGageRows([
      { id: "gage-0", name: "No. GAGE" },
      { id: "gage-special", name: "CARACT. ESPECIAL GAGE" }
    ]);
  
    setShowModal(true);
  };

  const renderCell = (fila, hora) => {
    switch (fila.type) {
      case "fixed":
        return (
          <div className="insp-cell-content">
            {getInspeccionValue(fila.id, hora)}
          </div>
        );
      case "select":
        const currentValue = getInspeccionValue(fila.id, hora);
        return (
          <div className="insp-select-container">
            <select
              className="insp-select"
              value={currentValue || ""}
              onChange={(e) =>
                handleInspeccionChange(fila.id, hora, e.target.value)
              }
            >
              <option value=""></option>
              {fila.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "text":
        const isDefaultRow =
          (fila.rowType === "matng" && fila.rowId === "matng-0") ||
          (fila.rowType === "gage" && fila.rowId === "gage-0");
  
        // Obtener valor para mostrar
        const textValue = getTextFieldValue(fila.id, hora);
  
        if (isDefaultRow) {
          return (
            <input
              style={{
                border: "none",
              }}
              value={textValue}
              disabled
              readOnly
            />
          );
        } else {
          return (
            <input
              className="insp-form-input"
              style={{ height: "2rem", border: "none" }}
              value={textValue}
              onChange={(e) =>
                handleTextFieldChange(fila.id, hora, e.target.value)
              }
            />
          );
        }
      default:
        return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      // Validar campos requeridos
      const requiredFields = [
        'fecha', 'no_molde', 'no_parte', 'no_maquina',
        'material', 'auditor', 'turno'
      ];
  
      const missingFields = requiredFields.filter(field => !currentInspeccion[field]);
      if (missingFields.length > 0) {
        setError(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
  
      // Procesar todos los items (filas de la tabla)
      const items = [];
  
      // Función para procesar cualquier fila
      const processRow = (rowName, rowType) => {
        const valores = [];
        const horasRango = getHorasRango(currentInspeccion.turno);
        
        horasRango.forEach(hora => {
          const valor = getTextFieldValue(rowName, hora) || 
                      getInspeccionValue(rowName, hora); 
          if (valor) {
            valores.push({ hora, valor });
          }
        });
  
        if (valores.length > 0) {
          items.push({
            tipo: rowType,
            nombre: rowName,
            valores
          });
        }
      };
  
      // Procesar filas fijas
      processRow("ESTADO", "estado");
      processRow("INSPECCIÓN", "inspeccion");
      processRow("TARJETA KANBAN/POS", "kanban");
      processRow("VERIFICACIÓN DE APARIENCIA", "verificacion_apariencia");
      processRow("MÁQUINA LIMPIA", "maquina_limpia");
      processRow("OBSERVACIONES", "observaciones");
  
      // Procesar filas dinámicas
      matngRows.forEach(row => processRow(row.name, "matng"));
      gageRows.forEach(row => processRow(row.name, "gage"));
  
      // Preparar datos para enviar
      const inspeccionData = {
        ...currentInspeccion,
        items,
        detalles: {
          estado: currentInspeccion.estado,
          verificacion_apariencia: currentInspeccion.verificacion_apariencia,
          maquina_estado: currentInspeccion.maquina_estado,
          observaciones_maquina: currentInspeccion.observaciones_maquina,
          kanban: currentInspeccion.kanban
        },
        valores_fijos: {
          inspeccion: currentInspeccion.inspeccion,
          maquina_limpia: currentInspeccion.maquina_limpia
        },
      };
  
      // Enviar datos al servidor
      if (currentInspeccion._id) {
        await updateInspeccion(currentInspeccion._id, inspeccionData);
      } else {
        await createInspeccion(inspeccionData);
      }
  
      setShowModal(false);
      resetForm();
      await loadInspecciones();
      
    } catch (error) {
      console.error('Error al guardar la inspección:', error);
      setError('Error al guardar la inspección. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteInspeccion(id);
      loadInspecciones();
      setShowConfirmDelete(false);
      setInspeccionToDelete(null);
    } catch (err) {
      setError("Error al eliminar la inspección");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (inspeccion) => {
    // Cargar datos básicos
    const editedInspeccion = {
      ...inspeccion,
      fecha: new Date(inspeccion.fecha).toISOString().split("T")[0],
      no_mating: inspeccion.no_mating || [],
      no_gage: inspeccion.no_gage || [],
      estado: inspeccion.detalles?.estado || "",
      verificacion_apariencia: inspeccion.detalles?.verificacion_apariencia || "",
      maquina_estado: inspeccion.detalles?.maquina_estado || "",
      observaciones_maquina: inspeccion.detalles?.observaciones_maquina || "",
      kanban: inspeccion.detalles?.kanban || "",
    };
  
    // Inicializar estados para la tabla
    const newInspeccionesValues = {};
    const newTextFields = {
      "TARJETA KANBAN/POS": {},
      "OBSERVACIONES": {}
    };
    
    // Cargar valores de selects
    const horasRango = getHorasRango(inspeccion.turno);
    
    // Cargar estado
    horasRango.forEach(hora => {
      newInspeccionesValues[`ESTADO-${hora}`] = editedInspeccion.estado;
    });
    
    // Cargar verificación de apariencia
    horasRango.forEach(hora => {
      newInspeccionesValues[`VERIFICACIÓN DE APARIENCIA-${hora}`] = editedInspeccion.verificacion_apariencia;
    });
    
    // Cargar máquina limpia
    horasRango.forEach(hora => {
      newInspeccionesValues[`MÁQUINA LIMPIA-${hora}`] = editedInspeccion.maquina_estado;
    });
    
    // Procesar items para cargar en la tabla
    inspeccion.items?.forEach(item => {
      item.valores?.forEach(valor => {
        if (item.tipo === 'inspeccion') {
          newInspeccionesValues[`INSPECCIÓN-${valor.hora}`] = valor.valor;
        } else if (item.tipo === 'estado') {
          newInspeccionesValues[`ESTADO-${valor.hora}`] = valor.valor;
        } else if (item.tipo === 'maquina_limpia') {
          newInspeccionesValues[`MÁQUINA LIMPIA-${valor.hora}`] = valor.valor;
        } else if (item.tipo === 'verificacion_apariencia') {
          newInspeccionesValues[`VERIFICACIÓN DE APARIENCIA-${valor.hora}`] = valor.valor;
        } else {
          if (!newTextFields[item.nombre]) {
            newTextFields[item.nombre] = {};
          }
          newTextFields[item.nombre][valor.hora] = valor.valor;
        }
      });
    });
  
    // Actualizar todos los estados
    setCurrentInspeccion(editedInspeccion);
    setInspeccionesValues(newInspeccionesValues);
    setTextFields(newTextFields);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setCurrentInspeccion({ ...currentInspeccion, [field]: value });

    if (field === "no_molde" || field === "no_parte") {
      const matchingData = datos.find(
        (item) => item.no_molde === value || item.no_parte === value
      );
      if (matchingData) {
        setCurrentInspeccion((prev) => ({
          ...prev,
          no_molde: matchingData.no_molde,
          no_parte: matchingData.no_parte,
          material: matchingData.material,
          no_mating:
            matchingData.no_mating !== "N/A"
              ? [{ valor: matchingData.no_mating, descripcion: "" }]
              : [],
          no_gage: matchingData.no_gage
            ? [{ valor: matchingData.no_gage, descripcion: "" }]
            : [],
        }));
      }
    }
  };

  const handleShowDetails = (inspeccion) => {
    setSelectedInspeccion(inspeccion);
    setShowDetailsModal(true);
  };

  const updateInspeccionesPerPage = () => {
    const newSize = window.innerWidth < 640 ? 3 : 4;
    setInspeccionesPerPage(newSize);
    // Recalcular el total de páginas cuando cambie el tamaño
    setTotalPages(Math.ceil(dates.length / newSize));
    // Asegurarse de que la página actual sea válida
    if (currentPage > Math.ceil(dates.length / newSize)) {
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    updateInspeccionesPerPage();
    window.addEventListener("resize", updateInspeccionesPerPage);
    return () =>
      window.removeEventListener("resize", updateInspeccionesPerPage);
  }, []);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const groupAndFilterInspecciones = (
    inspeccionesToGroup,
    searchTermToUse,
    filtersToUse
  ) => {
    const filtered = inspeccionesToGroup.filter((inspeccion) => {
      const matchFecha = filtersToUse.fecha
        ? inspeccion.fecha &&
          new Date(inspeccion.fecha).toISOString().split("T")[0] ===
            filtersToUse.fecha
        : true;

      const matchMaquina = searchTermToUse
        ? String(inspeccion.no_maquina)
            .toLowerCase()
            .includes(searchTermToUse.toLowerCase())
        : true;

      const matchResponsable = searchTermToUse
        ? String(inspeccion.auditor)
            .toLowerCase()
            .includes(searchTermToUse.toLowerCase())
        : true;

      return matchFecha && (matchMaquina || matchResponsable);
    });

    return (filtered || []).reduce((acc, inspeccion) => {
      if (inspeccion.fecha) {
        const date = new Date(inspeccion.fecha).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(inspeccion);
      }
      return acc;
    }, {});
  };

  // Estado para almacenar las inspecciones agrupadas
  const [groupedInspecciones, setGroupedInspecciones] = useState({});
  const [dates, setDates] = useState([]);
  const [currentDates, setCurrentDates] = useState([]);

  // Efecto para agrupar inspecciones cuando cambian los datos
  useEffect(() => {
    const grouped = groupAndFilterInspecciones(
      inspecciones,
      searchTerm,
      filters
    );
    setGroupedInspecciones(grouped);

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a)
    );
    setDates(sortedDates);

    // Calcular total de páginas basado en el número de inspecciones por página
    const pageSize = window.innerWidth < 640 ? 3 : 4;
    setTotalPages(Math.ceil(sortedDates.length / pageSize));

    // Actualizar las fechas actuales para la página actual
    const indexOfLastDate = currentPage * pageSize;
    const indexOfFirstDate = indexOfLastDate - pageSize;
    setCurrentDates(sortedDates.slice(indexOfFirstDate, indexOfLastDate));
  }, [inspecciones, searchTerm, filters, currentPage, inspeccionesPerPage]);

  const handleSearch = () => {
    // Resetear a la primera página al realizar una búsqueda
    setCurrentPage(1);
  };

  // Nuevo estado para controlar qué fecha está expandida
  const [expandedDate, setExpandedDate] = useState(null);

  // Función para alternar la expansión de una fecha
  const toggleDateExpansion = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  // Función para formatear la fecha en formato corto
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Renderizado modificado
  return (
    <div className="inspecciones-container">
      <Tab />
      <div className="scroll">
        <header className="inspecciones-header">
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
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Regresar</span>
            </button>
            <h1>Inspecciones</h1>
          </div>
          <div className="header-actions">
            <button
              className={`button button-secondary reload-button ${
                loading ? "loading" : ""
              }`}
              onClick={loadInspecciones}
              disabled={loading}
            >
              <RefreshCw className="icon" />
              <span>Recargar</span>
            </button>
            {userRole === "admin" && (
              <button
                className="button button-primary create-button"
                onClick={handleOpenNewInspection}
              >
                <Plus className="icon" />
                <span>Nueva Inspección</span>
              </button>
            )}
          </div>
        </header>

        {/* Input de búsqueda */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por máquina o auditor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="button button-primary" onClick={handleSearch}>
            <Search className="icon" />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Contenedor de cards por fecha */}
        <div className="date-cards-container">
          {currentDates.map((date) => {
            const inspeccionesDelDia = groupedInspecciones[date] || []; 

            return (
              <div
                key={date}
                className={`date-card ${
                  expandedDate === date ? "expanded" : ""
                }`}
              >
                <div
                  className="date-card-header"
                  onClick={() => toggleDateExpansion(date)}
                >
                  <div className="date-info">
                    <h3>
                      <Calendar
                        className="icon"
                        size={16}
                        style={{ marginRight: "8px" }}
                      />
                      {formatShortDate(
                        new Date(
                          new Date(date).setDate(new Date(date).getDate() + 1)
                        )
                      )}
                    </h3>
                    <span className="inspeccion-count">
                      {inspeccionesDelDia.length} inspección
                      {inspeccionesDelDia.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="expand-icon">
                    {expandedDate === date ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {expandedDate === date && inspeccionesDelDia.length > 0 && (
                  <div className="date-card-content">
                    <div className="inspecciones-list">
                      {inspeccionesDelDia.map((inspeccion) => (
                        <div key={inspeccion._id} className="inspeccion-item">
                          <div className="inspeccion-time">
                            <span>{inspeccion.turno}</span>
                          </div>
                          <div className="inspeccion-details">
                            <div className="detail-row">
                              <span className="detail-label">Máquina:</span>
                              <span className="detail-value">
                                {inspeccion.no_maquina}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Auditor:</span>
                              <span className="detail-value">
                                {inspeccion.auditor}
                              </span>
                            </div><div className="detail-row">
                              <span className="detail-label">No. Parte:</span>
                              <span className="detail-value">
                                {inspeccion.no_parte}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Fecha:</span>
                              <span
                                className={`detail-value status-${inspeccion.fecha
                                  .split(" ")[0]
                                  .toLowerCase()}`}
                              >
                                {formatShortDate(
                                  new Date(
                                    new Date(date).setDate(new Date(date).getDate() + 1)
                                  )
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="inspeccion-actions">
                            <button
                              className="button button-icon button-info"
                              onClick={() => handleShowDetails(inspeccion)}
                            >
                              <Eye size={18} />
                            </button>
                            {userRole === "admin" && (
                              <>
                                <button
                                  className="button button-icon"
                                  onClick={() => handleEdit(inspeccion)}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="button button-icon button-danger"
                                  onClick={() => {
                                    setInspeccionToDelete(inspeccion);
                                    setShowConfirmDelete(true);
                                  }}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        {dates.length > 4 && (
          <div className="pagination">
            <button
              className="button button-secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              <span className="pagination-text">Anterior</span>
            </button>
            <span className="pagination-info">
              Página {currentPage} de {Math.ceil(dates.length / 4)}
            </span>
            <button
              className="button button-secondary"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(dates.length / 4)}
            >
              <span className="pagination-text">Siguiente</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {showDetailsModal && selectedInspeccion && (
          
          <div className="modal-overlay">
            <div className="modal-ins modal-create-insp" style={{ maxWidth: "95vw", width: "95vw", maxHeight: "90vh", overflow: "auto" }}>
              <div className="modal-header">
                <h2>Detalles de la Inspección</h2>
                <button className="button button-icon" onClick={() => setShowDetailsModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-content">
                <div className="insp-container">
                  <div className="insp-space-y">
                    {/* Información Básica */}
                    <div className="insp-card">
                      <div className="insp-card-content">
                        <div className="insp-form-grid">
                          <div className="insp-form-group">
                            <label className="insp-form-label">FECHA</label>
                            <input
                              className="insp-form-input"
                              value={new Date(selectedInspeccion.fecha).toISOString().split("T")[0]}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">HORA</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.hora}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">AUDITOR</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.auditor}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">TURNO</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.turno}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">MOLDE</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.no_molde}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">PARTE</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.no_parte}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">MÁQUINA</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.no_maquina}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label">MATERIAL</label>
                            <input
                              className="insp-form-input"
                              value={selectedInspeccion.material}
                              readOnly
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Inspección (igual que en crear) */}
                    {selectedInspeccion.items && selectedInspeccion.items.length > 0 && (
                      <div className="insp-card">
                        <div className="insp-card-header">
                          <h3 className="insp-card-title">Registro de Inspección</h3>
                        </div>
                        <div className="insp-card-content">
                          <div className="insp-table-container">
                            <table className="insp-table">
                              <thead>
                                <tr>
                                  <th className="insp-table-cell-header">HORA</th>
                                    {getHorasRango(selectedInspeccion.turno).map((hora) => (
                                    <th key={hora} className="insp-table-cell-header">
                                      {hora}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  // Filas fijas
                                  {
                                    id: "ESTADO",
                                    tipo: "estado",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "estado")?.valores || []
                                  },
                                  { 
                                    id: "INSPECCIÓN", 
                                    tipo: "inspeccion",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "inspeccion")?.valores || [] 
                                  },
                                  { 
                                    id: "TARJETA KANBAN/POS", 
                                    tipo: "kanban",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "kanban")?.valores || [] 
                                  },
                                  { 
                                    id: "VERIFICACIÓN DE APARIENCIA", 
                                    tipo: "verificacion_apariencia",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "verificacion_apariencia")?.valores || [] 
                                  },
                                  
                                  // Filas MATING dinámicas
                                  ...selectedInspeccion.items
                                    .filter(item => item.tipo === "matng")
                                    .map(item => ({
                                      id: item.nombre,
                                      tipo: item.tipo,
                                      valores: item.valores
                                    })),
                                  
                                  // Filas GAGE dinámicas
                                  ...selectedInspeccion.items
                                    .filter(item => item.tipo === "gage")
                                    .map(item => ({
                                      id: item.nombre,
                                      tipo: item.tipo,
                                      valores: item.valores
                                    })),
                                  
                                  // Últimas filas fijas
                                  { 
                                    id: "MÁQUINA LIMPIA", 
                                    tipo: "maquina_limpia",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "maquina_limpia")?.valores || [] 
                                  },
                                  { 
                                    id: "OBSERVACIONES", 
                                    tipo: "observaciones",
                                    valores: selectedInspeccion.items.find(i => i.tipo === "observaciones")?.valores || [] 
                                  }
                                ].map((fila) => (
                                  <tr key={`${fila.id}-${fila.tipo}`}>
                                    <td className="insp-table-cell-label">
                                      {fila.id}
                                    </td>
                                    {getHorasRango(selectedInspeccion.turno).map((hora) => {
                                      const valorObj = fila.valores?.find(v => v.hora === hora);
                                      return (
                                        <td key={hora} className="insp-table-cell">
                                          {valorObj ? valorObj.valor : ""}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="button button-secondary" onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de creación/edición */}
        {showModal && (
          <div className="modal-overlay">
            <div
              className="modal-ins modal-create-insp"
              style={{
                maxWidth: "95vw",
                width: "95vw",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <div className="modal-header">
                <h2>
                  {currentInspeccion._id
                    ? "Editar Inspección"
                    : "Nueva Inspección"}
                </h2>
                <button
                  className="button button-icon"
                  onClick={() => setShowModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="modal-form">
                <div className="insp-container">
                  <div className="insp-space-y">
                    <div className="insp-card">
                      <div className="insp-card-content">
                        <div className="insp-form-grid">
                          <div className="insp-form-group">
                            <label className="insp-form-label" htmlFor="proyecto">
                              PROYECTO
                            </label>
                            <select
                              className="insp-form-input"
                              id="proyecto"
                              name="proyecto"
                              value={proyectoSeleccionado}
                              onChange={(e) => setProyectoSeleccionado(e.target.value)}
                            >
                              <option value="">Selecciona un proyecto</option>
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
                          <div className="insp-form-group">
                            <label className="insp-form-label" htmlFor="no_parte">
                              NÚMERO DE PARTE
                            </label>
                            <select
                              className="insp-form-input"
                              id="no_parte"
                              name="no_parte"
                              value={currentInspeccion.no_parte}
                              onChange={(e) => handleInputChange("no_parte", e.target.value)}
                            >
                              <option value="">Selecciona un número de parte</option>
                              {datos.map((item, index) => (
                                <option key={index} value={item.no_parte}>
                                  {item.no_parte}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="insp-form-group">
                            <label
                              className="insp-form-label"
                              htmlFor="no_molde"
                            >
                              MOLDE
                            </label>
                            <input
                              className="insp-form-input"
                              id="no_molde"
                              name="no_molde"
                              value={currentInspeccion.no_molde}
                              onChange={(e) =>
                                handleInputChange("no_molde", e.target.value)
                              }
                              placeholder="Número de Molde"
                              list="no_molde_list"
                            />
                            <datalist id="no_molde_list">
                              {datos.map((item, index) => (
                                <option key={index} value={item.no_molde} />
                              ))}
                            </datalist>
                          </div>
                          <div className="insp-form-group">
                            <label
                              className="insp-form-label"
                              htmlFor="cavidades"
                            >
                              CAVIDADES
                            </label>
                            <input
                              className="insp-form-input"
                              id="cavidades"
                              name="cavidades"
                              value={currentInspeccion.cavidades}
                              onChange={(e) =>
                                handleInputChange("cavidades", e.target.value)
                              }
                            />
                          </div>
                          <div className="insp-form-group">
                            <label
                              className="insp-form-label"
                              htmlFor="no_maquina"
                            >
                              MÁQUINA
                            </label>
                            <select
                              className="insp-form-input"
                              id="no_maquina"
                              name="no_maquina"
                              value={currentInspeccion.no_maquina}
                              onChange={(e) =>
                                handleInputChange("no_maquina", e.target.value)
                              }
                            >
                              <option value="">Selecciona una máquina</option>
                              {Array.from({ length: 13 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  Máquina {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="insp-form-group">
                            <label
                              className="insp-form-label"
                              htmlFor="material"
                            >
                              MATERIAL
                            </label>
                            <input
                              className="insp-form-input"
                              id="material"
                              name="material"
                              value={currentInspeccion.material}
                              onChange={(e) =>
                                handleInputChange("material", e.target.value)
                              }
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label" htmlFor="fecha">
                              FECHA
                            </label>
                            <input
                              className="insp-form-input"
                              id="fecha"
                              name="fecha"
                              type="date"
                              value={currentInspeccion.fecha}
                              onChange={(e) =>
                                handleInputChange("fecha", e.target.value)
                              }
                            />
                          </div>
                          <div className="insp-form-group">
                            <label
                              className="insp-form-label"
                              htmlFor="auditor"
                            >
                              AUDITOR
                            </label>
                            <input
                              className="insp-form-input"
                              id="auditor"
                              name="auditor"
                              value={currentInspeccion.auditor}
                              onChange={(e) =>
                                handleInputChange("auditor", e.target.value)
                              }
                            />
                          </div>
                          <div className="insp-form-group">
                            <label className="insp-form-label" htmlFor="turno">
                              TURNO
                            </label>
                            <select
                              className="insp-form-input"
                              id="turno"
                              name="turno"
                              value={currentInspeccion.turno}
                              onChange={(e) =>
                                handleInputChange("turno", e.target.value)
                              }
                            >
                              <option value="">Selecciona un turno</option>
                              <option value="Primer-turno">
                                Primer Turno (7:00 - 15:00)
                              </option>
                              <option value="Segundo-turno">
                                Segundo Turno (15:00 - 23:00)
                              </option>
                              <option value="Tercer-turno">
                                Tercer Turno (23:00 - 7:00)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Tabla de horas dependiendo del turno */}
                        <div className="insp-table-container">
                          {/* Botones para agregar filas dinámicas */}
                          <div className="insp-button-group insp-mt">
                            <button
                              type="button"
                              className="insp-button insp-button-outline"
                              onClick={() => openAddRowDialog("matng")}
                            >
                              Agregar MATING
                            </button>
                            <button
                              type="button"
                              className="insp-button insp-button-outline"
                              onClick={() => openAddRowDialog("gage")}
                            >
                              Agregar Gage
                            </button>
                          </div>
                          <table className="insp-table">
                            <thead>
                              <tr>
                                <th className="insp-table-cell-header">HORA</th>
                                {currentInspeccion.turno === "Primer-turno" &&
                                  horas.slice(0, 17).map((hora) => (
                                    <th
                                      key={hora}
                                      className="insp-table-cell-header"
                                    >
                                      {hora}
                                    </th>
                                  ))}
                                {currentInspeccion.turno === "Segundo-turno" &&
                                  horas.slice(17, 34).map((hora) => (
                                    <th
                                      key={hora}
                                      className="insp-table-cell-header"
                                    >
                                      {hora}
                                    </th>
                                  ))}
                                {currentInspeccion.turno === "Tercer-turno" &&
                                  horas.slice(34).map((hora) => (
                                    <th
                                      key={hora}
                                      className="insp-table-cell-header"
                                    >
                                      {hora}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {buildTableRows().map((fila) => (
                                <tr key={fila.id}>
                                  <td className="insp-table-cell-label">
                                    {fila.id}
                                    {fila.canDelete && (
                                      <button
                                        type="button"
                                        className="insp-button insp-button-ghost insp-button-icon"
                                        onClick={() =>
                                          removeRow(fila.rowType, fila.rowId)
                                        }
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </td>
                                  {currentInspeccion.turno === "Primer-turno" &&
                                    horas.slice(0, 17).map((hora) => (
                                      <td
                                        key={hora}
                                        className="insp-table-cell"
                                      >
                                        {renderCell(fila, hora)}
                                      </td>
                                    ))}
                                  {currentInspeccion.turno ===
                                    "Segundo-turno" &&
                                    horas.slice(17, 34).map((hora) => (
                                      <td
                                        key={hora}
                                        className="insp-table-cell"
                                      >
                                        {renderCell(fila, hora)}
                                      </td>
                                    ))}
                                  {currentInspeccion.turno === "Tercer-turno" &&
                                    horas.slice(34).map((hora) => (
                                      <td
                                        key={hora}
                                        className="insp-table-cell"
                                      >
                                        {renderCell(fila, hora)}
                                      </td>
                                    ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    {currentInspeccion._id ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showConfirmDelete && (
          <div className="modal-overlay">
            <div className="modal confirm-dialog">
              <h3>¿Eliminar inspección?</h3>
              <p>Esta acción no se puede deshacer.</p>
              <div className="modal-footer">
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setInspeccionToDelete(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDelete(inspeccionToDelete._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Modal para Agregar MATING */}
        {dialogOpen && newRowType === "matng" && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <div className="custom-modal-header">
                <h2>Agregar nuevo MATNG</h2>
                <button
                  className="close-button"
                  onClick={() => setDialogOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="custom-modal-body">
                <label htmlFor="newMatngName">Nombre del MATNG</label>
                <input
                  id="newMatngName"
                  value={newRowName}
                  onChange={(e) => setNewRowName(e.target.value)}
                  placeholder="Ej: No. MATING 123"
                  className="custom-input"
                />
              </div>
              <div className="custom-modal-footer">
                <button
                  className="custom-button cancel"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="custom-button confirm"
                  onClick={addCustomRow}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar GAGE */}
        {dialogOpen && newRowType === "gage" && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <div className="custom-modal-header">
                <h2>Agregar nuevo GAGE</h2>
                <button
                  className="close-button"
                  onClick={() => setDialogOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="custom-modal-body">
                <label htmlFor="newGageName">Nombre del GAGE</label>
                <input
                  id="newGageName"
                  value={newRowName}
                  onChange={(e) => setNewRowName(e.target.value)}
                  placeholder="Ej: No. GAGE 789"
                  className="custom-input"
                />
              </div>
              <div className="custom-modal-footer">
                <button
                  className="custom-button cancel"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="custom-button confirm"
                  onClick={addCustomRow}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspecciones;
