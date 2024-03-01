import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./edit.css";
import Swal from "sweetalert2";
import axios from "axios";

export const Edit = () => {
  const location = useLocation();
  const { user } = location.state;
  const navigate = useNavigate();
  console.log("la imagen es")
  console.log(user.image);
  const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
  //yrl de la imagen
  const url = `${bucket_url}${user.image}`;
  const [editedUser, setEditedUser] = useState(user);
  const [newImage, setNewImage] = useState(null);
  const [password, setPassword] = useState("");

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0])
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      Swal.fire("Error", "Por favor ingresa tu contraseña", "error");
      return;
    }

    const formData = new FormData();
    formData.append("useroriginal", user.username);
    formData.append("username", editedUser.username);
    formData.append("name", editedUser.name);
    formData.append("password", password);
    formData.append("image", newImage); // Solo enviar la nueva imagen
    formData.append("imageoriginal", user.image);

    try {
      const response = await axios.post("http://localhost:8081/EditUser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        Swal.fire("Usuario editado exitosamente", "Cambio Completo", "success");
        const { user: updatedUser } = response.data;
        console.log(response.data)
        setEditedUser(updatedUser);
      
        navigate("/Home", { state: { user: updatedUser } });
      }
    } catch (error) {
      if (error.response.status === 401) {
        Swal.fire("Error", "Contraseña incorrecta, no puede editar datos", "error");
      }
    }
  };

  return (
    <div className="edit-container">
      <div className="image-and-button">
        <div className="img-container">
          <img  className="user-image"  src={newImage ? URL.createObjectURL(newImage) : url} alt="Imagen de perfil" /> {/* Utilizar solo la nueva imagen si existe */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="upload-input"
          />
        </div>
      </div>
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedUser.username}
              onChange={handleUserChange}
            />
          </div>
          <div>
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedUser.name}
              onChange={handleUserChange}
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="button_change" type="submit">
            Guardar Cambios
          </button>
          <button className="button_change" type="button" onClick={() => navigate("/Home", { state: { user } })}>
            Perfil
          </button>
        </form>
      </div>
    </div>
  );
};
