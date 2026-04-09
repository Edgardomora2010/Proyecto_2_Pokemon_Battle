My Pokémon Battle



Proyecto de curso: Programación Web I – TEC.

Aplicación tipo single-page que integra consumo de: API, manejo de estado y

lógica de combate de pokemones.



Tecnologías

HTML5 / CSS3 / JavaScript (ES6)

PokeAPI

LocalStorage



Enfoque

La app/página se divide en:

Stage 1: selección de pokémon (player / enemy)

Stage 2: batalla de los pokemones.



El croquis o prediseño de la página se llevó a cabo en draw.io, tratando de 

separar las fases de lo que implica la selección del oponente, y la batalla

teniendo en cuenta que el single page, de igual manera tiene que garantizar

transferencia de datos entre objetos, persistencia mediante local storage, 

separación de lógica (JS), render (UI), datos (API + config + localStorage)



Estructura

index.html: estructura o página general (single-page)

styles.css: layout, modo oscuro-claro, arena, paneles para pokemon favorito,

y el del oponente, tratando de cumplir con las indicaciones del enunciado, 

donde se solicita una separación de archivos (index.html, main.js, render.js

trainer.config.js, style.css, y battle.js



Recursos gráficos

Los Header y Footer: fuero adornos diseñados desde 0 en Photoshop con formas, 

adaptados y colores a los del pokemon(es) seleccionados.



imágenes de internet, recortadas y convertidas a transparencia transparencias

en Photoshop.



La Animación de búsqueda de  pokemon contricante de manera random: fue hecha 

en Photoshop, frame a frame con máscaras por capas de blanco y negro, de 

algunos pokemones encontrados en internet.



Arena y otras imágenes: son imágenes de juegos antiguos, etc.



Colores de página, afines con los pokemones seleccionadosm fueron  tomados de

la imagen que muestra el enunciado, por medio del selector de Photoshop, y 

convertidos a colores web cercanos a la gama que se ve en imagen.



La barra de búsqueda de pokemones, corresponde a animaciones encontradas en la 

web pero con modificaciones (recorte, transparencia, escala).



Notas:

En el proyecto se intentó cumplir con la separación de los archivos, de lógica,

interfaz (JS, HTML/CSS), se abarcó: Uso de async/await, fetch, AbortController,

entre otras cosas que solicita el enunciado.

