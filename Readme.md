# Manual de Configuracion

## Grupo 12

| Nombre           | Carnet       |
|:----------------:|:------------:|
|Kemel Efrain Josue Ruano Jeronimo | 202006373 |
|Jonatan Leonel Garcia Arana | 202000424 |
|Estephanie Edelweiss Lemus Herrera | 201603064 |
|Eduardo Isaí Ajsivinac Xico | 201503584 |

## Configuraciones realizadas


### Arquitectura Utilizada
<div style="text-align: justify">
    <strong> Aplicación Web en la Nube: </strong> Combina frontend interactivo, backend/API y almacenamiento de datos en la nube para ofrecer aplicaciones escalables y seguras, desplegada en plataformas como AWS.
</div>

### Usuarios IAM Utilizados

Usuario RDS y Politicas 
* Este usuario es que tiene los permisos sobre la RDS
![rds](./Images/userrds.jpeg)

Usuario EC2 y Politicas
* Este Usuario tiene los permisos para las EC2
![ec2](./Images/ec2.jpeg)

Usuario S3 y Politicas
* UsuarioS3 ,  este usuario tiene los permisos para el bucket para conectarse y poder ingresar objetos o eliminarlos.
![user3](./Images/S3.PNG)


### EC2 Creadas
![ec2create](./Images/insec2.jpeg)

### Base de datos
![base](./Images/Base.jpeg)



### Bucket de Imagenes
![bucket](./Images/bucketimage.PNG)

### Aplicacion Web
#### Fronted
* Login y Registro
![login](./Images/login.PNG)
![registro](./Images/registro.PNG)

* Home
![home](./Images/home.PNG)

#### Backend
Existen dos un hecho en Python y uno en Nodejs
* Seleccione una opcion para ver configuracion
[Python](https://github.com/Jona1056/GRUPO12_PRAC1_SEMI/tree/main/Backend_Python) &nbsp; ,
[Nodejs](https://github.com/Jona1056/GRUPO12_PRAC1_SEMI/tree/main/backend_node)
