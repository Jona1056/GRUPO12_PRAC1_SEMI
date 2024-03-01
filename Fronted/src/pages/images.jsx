import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Images.css"; // Importa tu archivo CSS
import { useNavigate } from 'react-router-dom';

export const Images = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
  const bucket_url2 = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Publicadas/';
  const [fotosPerfil, setFotosPerfil] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [fotosAlbum, setFotosAlbum] = useState([]);
  const url = `${bucket_url}${user.image}`;
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFotosPerfil();
    fetchAlbums();
  }, []);
  
  useEffect(() => {
    const fetchFotosAlbum = async () => {
      if (albums.length > 0) {
        const albumIds = albums.map((album) => album.id);
        const albumNames = albums.map((album) => album.name);
        const requestOptions2 = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ albums: albumIds, names: albumNames }),
        };
  
        try {
          const response2 = await fetch('http://localhost:8081/GetFotosAlbum', requestOptions2);
          if (!response2.ok) {
            throw new Error(`HTTP error! Status: ${response2.status}`);
          }
          const data2 = await response2.json();
          console.log(data2);
            setFotosAlbum(data2);
          
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }
    };
  
    fetchFotosAlbum();
  }, [albums]);
  

  const fetchFotosPerfil = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: user.username, name: user.name }),
    };
    try {
      const response = await fetch('http://localhost:8081/GetFotosPerfil', requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setFotosPerfil(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchAlbums = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: user.username, name: user.name }),
    };
    try {
      const response = await fetch('http://localhost:8081/GetAlbumns', requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAlbums(data);
      //hacer otra peticion para obtener las fotos de los albumes
    
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  return (
    <div className="home-container2">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
        </div>
      </div>
      <div className="buttons-container">
        <button
          className="button_back"
          type="button"
          onClick={() => navigate("/UploadPhoto", { state: { user } })}
        >
          Subir Foto
        </button>
        <button
          className="button_back"
          type="button"
          onClick={() => navigate("/EditAlbum", { state: { user } })}
        >
          Editar Album
        </button>
        <button
          className="button_back"
          type="button"
          onClick={() => navigate("/Home", { state: { user } })}
        >
          Perfil
        </button>
      </div>
      <p className="title">Fotos de Perfil</p>
      <div className="carousel-container">
        <div className="carousel">
          {/* Mapear las fotos de perfil y mostrarlas en el carrusel */}
          {fotosPerfil.map((foto, index) => (
            <img key={index} src={`${bucket_url}${foto.foto}`} alt={`Foto ${index}`} className="carousel-image" />
          ))}
        </div>
      </div>
      <p className="title">Fotos de Álbumes</p>
      {/* Mostrar fotos de los álbumes si fotosAlbum es un array */}
      {Object.keys(fotosAlbum).map((albumTitle, index) => (
  <div key={index} className="album-container">
    <h2>{albumTitle}</h2>
    <div className="carousel-container">
      <div className="carousel">
        {fotosAlbum[albumTitle].map((foto, fotoIndex) => (
          <img
            key={fotoIndex}
            src={`${bucket_url2}${foto}`}
            alt={`${bucket_url2}${foto}`}
            className="carousel-image"
          />
        ))}
      </div>
    </div>
  </div>
))}
</div>

  );
     }