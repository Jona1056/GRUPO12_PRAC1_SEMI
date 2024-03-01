import { useLocation } from "react-router-dom";
import "./Home.css"; // Importa tu archivo CSS
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const location = useLocation();
  const { user } = location.state;
  const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
  //yrl de la imagen
  const url = `${bucket_url}${user.image}`;
  console.log(url);
  const navigateTo = useNavigate();
    
  const edit_profile = () => {
    navigateTo("/EditProfile", { state: { user: user,image:url } });
  }

  const upload_photo = () => {
    navigateTo("/UploadPhoto", { state: { user: user,image:url } });
  }
  const images = () => {
    navigateTo("/Images", { state: { user: user,image:url } });
  }

  const edit_album = () => {
    navigateTo("/EditAlbum", { state: { user: user,image:url } });
  }
  
  return (
    <div className="home-container">
      <div className="user-info">
        <img src={`${url}`} alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: {user.username}</p>
          <p>Nombre: {user.name}</p>
        </div>
      </div>
      <div className="Botones-css">
      <button onClick={images} className="batman">
        <span>VER FOTOS</span>
      </button >
      <button onClick={upload_photo}className="batman">
        <span >SUBIR FOTO</span>
      </button>
      <button onClick={edit_profile}className="batman">
        <span>EDITAR PERFIL</span>
      </button>
      <button onClick={edit_album} className="batman">
        <span>EDITAR ALBUMES</span>
      </button>
    
      </div>
    </div>
  );
};