import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./upload_photo.css"; // Importar el archivo de estilos CSS
import axios from "axios";
import Swal from "sweetalert2";
export const UploadPhoto = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url =
    "https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/";
  // URL de la imagen
  const url = `${bucket_url}${user.image}`;
  const navigate = useNavigate();

  // Estado para el nombre de la foto
  const [photoName, setPhotoName] = useState("");
  const [fileImageUrl, setFileImageUrl] = useState(null);
  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState(null);
  // Estado para las opciones del menú desplegable
  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    fetchDropdownOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener las opciones del menú desplegable desde un endpoint
  const fetchDropdownOptions = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.username, name: user.name }),
    };

    try {
      const response = await fetch(
        "http://localhost:8081/GetAlbumns",
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const dropdownOptions = data.map((album) => ({
        value: album.id,
        label: album.name,
      }));

      setDropdownOptions(dropdownOptions);
    } catch (error) {
      console.error("Fetch error:", error);
    }

    // Una vez obtenidas las opciones, actualizar el estado dropdownOptions
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    // Actualizar el estado para almacenar la URL de la imagen
    setSelectedImage(file);
    setFileImageUrl(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //verificar que se haya puesto nombre y seleccionado imagen
    if (!photoName || !fileImageUrl) {
      Swal.fire("Error", "Por favor complete todos los campos", "error");
      return;
    }
    //obtener el album seleccionado
    const dropdown = document.getElementById("dropdownOptions");
    const album = dropdown.options[dropdown.selectedIndex].value;
  
    const formData = new FormData();
    formData.append("photoName", photoName);
    formData.append("image", selectedImage);
    formData.append("album", album);
    console.log(formData);
    //peticion para subir foto
    try{
        const response = await axios.post("http://localhost:8081/UploadPhotoAlbum",formData,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        //limpiar campos
        setPhotoName("");
        setFileImageUrl(null);
        setSelectedImage(null);
        if (response.status === 200) {
            Swal.fire("Foto subida exitosamente", "Nueva foto", "success");
        }
    }catch(error){
        console.log(error)
    }
  };

  // Función para agregar una nueva opción al menú desplegable
  const addAlbums  =async () => {
    const newOption = prompt("Ingrese el nombre de la nueva opción:");
    //peticion para AddAlbums
    if (!newOption) {
     Swal.fire("Error", "Por favor ingrese un nombre", "error");
      return;
    }
    try{
        const response = await axios.post("http://localhost:8081/AddAlbums",{
            username: user.username,
            name: user.name,
            album: newOption
        })
        if (response.status === 200) {
            const newOption = {
                value: response.data.id,
                label: response.data.name
            }
            setDropdownOptions([...dropdownOptions, newOption]);
        }
        Swal.fire("Album creado exitosamente", "Nuevo Album", "success");
    }catch(error){
        console.log(error)
    }
  };

  return (
    <div className="home-container1">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
        </div>
        
      </div>
      <div className="upload-form">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="photoName">Nombre de la foto:</label>
            <input
              type="text"
              id="photoName"
              value={photoName}
              onChange={(e) => setPhotoName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="image">Seleccionar imagen:</label>
            <input
              type="file"
              accept="image/*"
              id="image"
              onChange={handleImageChange}
            />
           {fileImageUrl  && <img src={fileImageUrl}
      alt="Imagen seleccionada"
      style={{ maxWidth: '200px', height: 'auto' }}  />}
 
          </div>
          <div>
            <label htmlFor="dropdownOptions">Albums:</label>
            <select id="dropdownOptions">
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={addAlbums}>
              Agregar Album
            </button>
          </div>
          <button type="submit">Subir foto</button>
          <button
            className="button_back"
            type="button"
            onClick={() => navigate("/Home", { state: { user } })}
          >
            Perfil
          </button>
        </form>
      </div>
    </div>
  );
};
