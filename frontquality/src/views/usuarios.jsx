import { useState, useEffect, useMemo } from "react";
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../api/api";
import "../styles/usuarios.css";
import Tab from "../components/Tab";
import { SquarePen, Trash2 } from "lucide-react";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    num_empleado: "",
    nombre: "",
    apellidos: "",
    password: "",
    rol: "usuario",
  });
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usuariosPerPage] = useState(4); // Usuarios por página
  const [searchTerm, setSearchTerm] = useState(""); // Búsqueda

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const data = await fetchUsuarios(token);
        setUsuarios(data);
      } catch (error) {
        setError("Error al obtener usuarios");
      }
    };

    obtenerUsuarios();
  }, [token]);

  // Filtrar usuarios según el término de búsqueda
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchNombre = searchTerm
        ? usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchApellidos = searchTerm
        ? usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchNumEmpleado = searchTerm
        ? usuario.num_empleado.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return matchNombre || matchApellidos || matchNumEmpleado;
    });
  }, [usuarios, searchTerm]);

  // Lógica para obtener los usuarios de la página actual
  const indexOfLastUsuario = currentPage * usuariosPerPage;
  const indexOfFirstUsuario = indexOfLastUsuario - usuariosPerPage;
  const currentUsuarios = useMemo(
    () => filteredUsuarios.slice(indexOfFirstUsuario, indexOfLastUsuario),
    [filteredUsuarios, indexOfFirstUsuario, indexOfLastUsuario]
  );

  // Total de páginas
  const totalPages = useMemo(
    () => Math.ceil(filteredUsuarios.length / usuariosPerPage),
    [filteredUsuarios, usuariosPerPage]
  );

  // Cambiar de página
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (usuarioEditando) {
        await updateUsuario(usuarioEditando._id, formData, token); 
        setUsuarioEditando(null);
      } else {
        await createUsuario(formData.num_empleado, formData.nombre, formData.apellidos, formData.password, formData.rol);
      }

      const data = await fetchUsuarios(token);
      setUsuarios(data);
      setModalAbierto(false);
      setFormData({
        num_empleado: "",
        nombre: "",
        apellidos: "",
        password: "",
        rol: "usuario",
      });
    } catch (error) {
      setError(error.message || "Error al guardar el usuario");
    }
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      num_empleado: usuario.num_empleado,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      password: "",
      rol: usuario.rol,
    });
    setModalAbierto(true);
  };

  const handleEliminarUsuario = async (id) => {
    try {
      await deleteUsuario(id, token); 
      const data = await fetchUsuarios(token);
      setUsuarios(data);
      setShowConfirmDelete(false);
      setUsuarioToDelete(null);
    } catch (error) {
      setError("Error al eliminar el usuario");
    }
  };

  return (
    <div className="usuarios-container">
      <div className="header">
        <h1>Gestión de Usuarios</h1>
        <button
          className="button button-primary create-button"
          onClick={() => {
            setUsuarioEditando(null);
            setFormData({
              num_empleado: "",
              nombre: "",
              apellidos: "",
              password: "",
              rol: "usuario",
            });
            setModalAbierto(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre, apellidos o número de empleado"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="button button-primary">
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

      {/* Vista de tabla para desktop */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Número de empleado</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsuarios.map((usuario) => (
                <tr key={usuario._id} className="table-row">
                  <td className="employee-number">{usuario.num_empleado}</td>
                  <td className="user-name">{usuario.nombre}</td>
                  <td className="user-name">{usuario.apellidos}</td>
                  <td>
                    <span className={`role-badge ${usuario.rol}`}>{usuario.rol}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-button edit" onClick={() => handleEditarUsuario(usuario)}>
                        <SquarePen className="action-icon" />
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => {
                          setUsuarioToDelete(usuario);
                          setShowConfirmDelete(true);
                        }}
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de cards para móvil */}
      <div className="cards-container">
        {currentUsuarios.map((usuario) => (
          <div key={usuario._id} className="user-card">
            <div className="user-card-header">
              <span className="user-card-title">
                {usuario.nombre} {usuario.apellidos}
              </span>
            </div>
            <div className="user-card-content">
              <div className="user-card-field">
                <span className="user-card-label">No. Empleado:</span>
                <span className="user-card-value">{usuario.num_empleado}</span>
              </div>
              <div className="user-card-field">
                <span className="user-card-label">Rol:</span>
                <span className="user-card-value" style={{ textTransform: "capitalize" }}>
                  {usuario.rol}
                </span>
              </div>
            </div>
            <div className="user-card-actions">
              <button className="button button-primary" onClick={() => handleEditarUsuario(usuario)}>
                Editar
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  setUsuarioToDelete(usuario);
                  setShowConfirmDelete(true);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {filteredUsuarios.length > usuariosPerPage && (
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

      {/* Modal para crear/editar usuario */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{usuarioEditando ? "Editar Usuario" : "Crear Usuario"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="num_empleado">Número de empleado</label>
                <input
                  id="num_empleado"
                  type="text"
                  name="num_empleado"
                  value={formData.num_empleado}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!usuarioEditando}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rol">Rol</label>
                <select id="rol" name="rol" value={formData.rol} onChange={handleInputChange} required>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="button button-secondary" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="button button-primary">
                  {usuarioEditando ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar usuario */}
      {showConfirmDelete && (
        <div className="modal-overlay">
          <div className="modal confirm-dialog">
            <h3>¿Eliminar usuario?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button
                className="button button-secondary"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setUsuarioToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button className="button button-danger" onClick={() => handleEliminarUsuario(usuarioToDelete._id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Tab />
    </div>
  );
};

export default Usuarios;