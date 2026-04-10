My Pokémon Battle
Técnico en Desarrollo de Applicaciones de Software
Proyecto de curso: Programación Web I – TEC.
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Archivo: (JAVASCRIPT)/JS (main.js)
 * Profesor: Jose Pablo Garbanzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
Detalles: Aplicación tipo single-page que integra consumo de: API, manejo de estado y
lógica de combate de pokemones.

Tecnologías
HTML5 / CSS3 / JavaScript 
PokeAPI
LocalStorage

Retos: (Se expondrá en video con más detalle) 
1) Orden y estructura del código
2. Comprensión de funciones avanzadas
3. Integración de la lógica del sistema
4. Adaptación al entorno web
5. Control y depuración de errores (bugs)

Dirección de video de proyecto:
https://www.loom.com/share/d6b9e4e2c1f54b4ba4797ec6b587e233

Ruta del proyecto:
https://github.com/Edgardomora2010/Proyecto_2_Pokemon_Battle

Página publicada funcional: 
https://edgardomora2010.github.io/Proyecto_2_Pokemon_Battle/

Enfoque/Abordaje
La app/página se divide en:
Stage 1: selección de pokémon (player/enemy)
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

Arena y otras imágenes, e animaciones: son imágenes de juegos antiguos, 
y recursos encontrados en internet, etc.

Colores de página, afines con los pokemones seleccionadosm fueron  tomados de
la imagen que muestra el enunciado, por medio del selector de Photoshop, y 
convertidos a colores web cercanos a la gama que se ve en imagen.

La barra de búsqueda de pokemones, corresponde a animaciones encontradas en la 
web pero con modificaciones (recorte, transparencia, escala).

Notas:
En el proyecto se intentó cumplir con la separación de los archivos, de lógica,
interfaz (JS, HTML/CSS), se abarcó: Uso de async/await, fetch, AbortController,
entre otras cosas que solicita el enunciado.

