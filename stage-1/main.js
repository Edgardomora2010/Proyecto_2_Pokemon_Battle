/* ******************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Archivo: (JAVASCRIPT)/JS (main.js)
 * Profesor: Jose Pablo Garbanzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
 * *****************************************************************************************/

// ******************************************************************************************
// IMPORTS: FUNCIONES EN: RENDER.JS, TRAINER.CONFIG.JS 
// 
//  Se importan funciones necesaria de otros archivos como:  render.js para poder accesar
//  y actualizar objetos visuales de la página. 
//  También datos en el archivo trainer.config.js
// ******************************************************************************************
//
// ******************************************************************************************
// STAGE-1:
// ******************************************************************************************
// API.JS
import { get_Pokemon } from './api.js';                // Devuelve datos de cualquier Pokemon
// RENDER.JS
import { render_Player_Panel } from './render.js';     // Actualiza panel de player:mi pokemon
import { render_Trainer_Panel } from './render.js';    // Actualiza panel de trainer card
import { render_Enemy_Panel } from './render.js';      // Actualiza panel de pokemón oponente
import { render_carga_resultados } from './render.js'; // Actualiza visualización de carga datos
import { cambiar_Modo_pagina } from './render.js';     // Cambia página a modo oscuro
import { animar_seleccion_random } from './render.js'; // Anima búsqueda de pokemón oponente
// TRAINER.CONFIG.JS                              
import TRAINER from '../trainer.config.js';            // Devuelve datos del trainer card 
//
// ******************************************************************************************
// STAGE-2:
// ******************************************************************************************
import { iniciar_Batalla } from './battle.js';          // Función para iniciar batalla (Stage 2)
import { limpiar_Batalla_Anterior } from './battle.js'; // Función para limpiar batalla (Srage 2)
// ******************************************************************************************

// ******************************************************************************************
// OBJETOS DE USO GLOBAL
// ******************************************************************************************

// OBJETOS GLOBALES: para manejo de estados.
const state = {
    player: null,    // Pokemón favorito
    trainer: null,   // Trainer card
    enemy: null      // Pokemón contrincante
};

// OBJETOS PARA ALMACENAR DATOS
let trainer_datos = null;
let player_datos  = null;
let enemy_datos   = null;
let controller_busqueda = null;

// ESTADO GLOBAL DE BATALLA
let controlDatosBatalla = null;

// ARREGLOS (Nombres completos)
let lista_completa_pokemones = [];

// OBJETOS GENERALES DEL HTML/DOM
const pagina = document.body;                                                   // Página general
const oponente_seleccianado = document.getElementById("txt_nombre_enemigo");    // Nombre oponente
const botonTema = document.getElementById('bttn_tema');                         // Bóton claro/oscuro  
const botonBuscarOponente = document.getElementById('btn_buscar_oponente');     // Botón buscar oponente
const botonBuscarAlAzar   = document.getElementById('btn_random');              // Botón buscar oponente random
const botonIniciarBatalla = document.getElementById('btn_iniciar_batalla');     // Botón iniciar batalla
const listaResultadosBusqueda = document.getElementById('resultados_busqueda'); // Lista de sugerencias pokemones
const lblMensajeError  =   document.getElementById('error_busqueda');           // Mensaje de error, pokemón no encontrado
const bloqueStage2 = document.getElementById("bloque_stage_2");                 // Bloque/Sección colapsable para Stage 2
const bloqueLog    = document.getElementById("bloque_log");                     // Bloque/Sección colapsable para Log de juego
// ******************************************************************************************
// ******************************************************************************************


// ******************************************************************************************
// FUNCIÓN PRINCIPAL: Carga con el inicio de página, el DOM
// el pokemón favorito, y los datos de Trainer card
// ******************************************************************************************

async function init() {
    
    try {
        
        // Carga todos los nombres de los pokemones, solicitándolos
        // a la API. Esto para poder crear una búsqueda sugerida real
        // a la hora de buscar por nombres
        // Según documentación de la API, se pueden solicitar 1000 pokemones
        // en un solo Fetch
        await request_todos_Nombres_Pokemones(1000);
        
        // Solicitud de datos al trainer.config.js
        trainer_datos = TRAINER;
        // Guadar estado (trainer)
        state.trainer = trainer_datos;
         // Actualizar Interfaz Gráfica (IU)
        render_Trainer_Panel(state.trainer);
        
        // Solicitud de datos a la API para nuestro pokemon 
        player_datos = await request_Pokemon(trainer_datos.favoritePokemon);
        // Guadar estado (player)
        state.player = player_datos;
        // Actualizar Interfaz Gráfica (IU)
        render_Player_Panel(state.player);
        
        // Lee datos guardado del último pokemón oponente buscado y los
        // asigna
        const enemigo = obtener_Local_Storage("enemigo");
        
        // Si el enemigo es válido (llave y valor)
        if (enemigo){
            // Se asigna nombre del último pokemón buscado al componente html
            // de búsqueda de oponente
            oponente_seleccianado.value = enemigo;
        }

        // Estado inicial de botón de iniciar batalla
        botonIniciarBatalla.disabled = true;
        bloqueStage2.open = false;
        bloqueLog.open = false;

        // Registro de eventos luego de que el DOM y datos iniciales existen
        oponente_seleccianado.addEventListener('keyup', buscarConDebounce);
        
    // Si ocurre un error en la carga de los datos
    } catch (error) {
        console.error(error);
    }
    
}
// ******************************************************************************************
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES RELACIONADAS CON ALMACENAMIENTO DE DATOS DEL NAVEGADOR EN (WINDOWS.LOCALSTORAGE)
// ******************************************************************************************

// Función para guardar datos del último Pokemón seleccionado
function guardar_Local_Storage(clave, valor)
{   
    // Si no hay valor válido, no guarda
    if (valor === "" || valor === null) return;
    // Se guarda el valor en localStorage
    window.localStorage.setItem(clave, valor);
}

// Función para obtener datos guardados del último Pokemón seleccionado, y que este se
// mantenga tras cerrar navegador
function obtener_Local_Storage(clave){ 
    
    // Si la clave no es un valor válido, se aborta lectura de clave almacenada
    if (!clave) return;
    // Si la clave es válida, se obtiene valor almacenado.
    const valor = window.localStorage.getItem(clave); 
    return valor;
}

// Función para eliminar datos guardados del último Pokemón seleccionado, y que este se
// mantenga tras cerrar navegador
function eliminar_Local_Storage(clave){ 
    
    // Si la clave no es un valor válido, se aborta lectura de clave almacenada
    if (!clave) return;
    // Si la clave es válida, se elimina valor almacenado.
    const valor = window.localStorage.removeItem(clave); 
    return valor;
}

// Función para carga datos de: (player, enemy, trainer) desde localStorage,
// valida su integridad y recupera el estado inicial de los objetos para  
// preparar una batalla.
function cargar_Datos_Batalla(llave){
    
    // Se llama a función de lectura de datos en almacenamiento local
    const datos_guardados = obtener_Local_Storage(llave);
    // Si no hay nada guardado, retorna null y se aborta carga de datos
    if (!datos_guardados) {
        return null;
    }
    
    let estado_Pokemones;
    
    // Si si existen datos válidos, se convierte string JSON en objeto real
    try {
        estado_Pokemones = JSON.parse(datos_guardados);
    } catch (error) {
        console.error("Error leyendo estado_Pokemones:", error);
        return null;
    }
    
    // Si faltan datos importantes, retorna null y aborta carga
    if (!estado_Pokemones.player || !estado_Pokemones.enemy || !estado_Pokemones.trainer) {
        return null;
    }
    
    // Crea el estado real para la batalla
    controlDatosBatalla = {
        
        // Se obtiene datos base heredados desde Stage 1, y coservados en el local storage
        // sirve si se desea pasar datos entre páginas, para este caso se utilizó sigle-page
        // sin embargo se respecta enunciado sobre lectura del estado de los objetos mediante
        // el localstorage
        
        // Datos completos de los 3 paneles (pokemón favorito/trainer card/enemigo)
        player: estado_Pokemones.player,
        enemy: estado_Pokemones.enemy,
        trainer: estado_Pokemones.trainer,
    
        // Se crean valores de HP (puntos de vida) reales para batalla
        playerHP: Math.floor(estado_Pokemones.player.stats.hp * 2.5),
        enemyHP: Math.floor(estado_Pokemones.enemy.stats.hp * 2.5),
        
        // Se inicia pokemones en matrix (arena) de (3x3), en posición 2 (centro)
        playerPosition: 2,
        enemyPosition: 2,
        
        // Ataque enemigo actual
        incomingAttack: null,
        
        // Control de batalla (bloqueo)
        locked: false,
        
        // estados o banderas 
        definitiveUsed: false,
        attackOnCooldown: false,
        
        // Estado general de batalla
        phase: "fighting",
        
        // Registro de eventos
        log: []
    };
    
    // Retorna objeto listo para una batalla (core del stage 2)
    return controlDatosBatalla;
}
// ******************************************************************************************
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES: REQUEST GENERALES DE INTERACCIÓN Y COMUNICACIÓN CON EL API.JS, 
// Y EL TRAINER.CONFIG.JS
// ******************************************************************************************

// Función general para comunicarse con el Poke-API para obtener los datos de 
// cualquier Pokemón.
async function request_Pokemon(nombre_pokemon, signal = null) {
    try {
        // Llama a función de la API para traer datos del
        // Pokemón deseado
        const datos = await get_Pokemon(nombre_pokemon, signal);
        // Retorna conjunto de datos requeridos del pokemón solicitado
        return datos;
        
    // Si ocurre un error en la carga de los datos
    } catch (error) {
        
        // Si la petición fue cancelada por AbortController,
        // no se toma como error real
        if (error.name === "AbortError") {
            return null;
        }
        
        // Se lanza error
        console.error(error);
        return null;
        
    }
    
}

// Función devuelve un arreglo con una cantidad determinada de Pokemones, dentro de la 
// documentación del Poke-Api e investigación se leyó que se pueden solicitar hasta 1000
// por fetch, por lo tanto el motivo de esta función es conocer una buena cifra de pokemones
// antes de sugerir nombres similares mediante la función debounce.
async function request_todos_Nombres_Pokemones(cantidadLimite){
    
    try {
        // Carga lista bastante completa de pokemones para suggestions
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=" + cantidadLimite);
        
        if (!res.ok) {
            throw new Error("No se pudo obtener la lista de pokemones.");
        }
        
        const data = await res.json();
        // Solo guardamos nombres en un arreglo
        lista_completa_pokemones = data.results.map(p => p.name);
        // Pruebas
        console.log(lista_completa_pokemones);
        }
    
    catch (error)
        
    {
        // Se lanza error
        console.error("Error cargando lista completa de pokemones:", error);
    }
    
}
// ******************************************************************************************
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES AUXILIARES: DEBOUNCE, REST_ARGUMENTS, Y OTRAS
// ******************************************************************************************

// Función auxiliar que permite a otra función recibir múltiples argumentos
// agrupándolos en un arreglo ("rest") Se usa internamente por debounce para
//  manejar parámetros dinámicos. Se mantiene idéntico al uso dado en clases.
function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
        var length = Math.max(arguments.length - startIndex, 0),
            rest = Array(length),
            index = 0;
        for (; index < length; index++) {
            rest[index] = arguments[index + startIndex];
        }
        switch (startIndex) {
            case 0: return func.call(this, rest);
            case 1: return func.call(this, arguments[0], rest);
            case 2: return func.call(this, arguments[0], arguments[1], rest);
        }
        var args = Array(startIndex + 1);
        for (index = 0; index < startIndex; index++) {
            args[index] = arguments[index];
        }
        args[startIndex] = rest;
        return func.apply(this, args);
    };
}

// Función para Retrasar la ejecución de una función hasta que el usuario deja 
// de interactuar. Evitando múltiples ejecuciones consecutivas de búsqueda.
// Se mantiene idéntico al uso dado en clases.
function debounce(func, wait, immediate) {
    var timeout, previous, args, result, context;

    var later = function() {
        var passed = Date.now() - previous;
        if (wait > passed) {
            timeout = setTimeout(later, wait - passed);
        } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);

            if (!timeout) args = context = null;
        }
    };

    var debounced = restArguments(function(_args) {
        context = this;
        args = _args;
        previous = Date.now();
        if (!timeout) {
            timeout = setTimeout(later, wait);
            if (immediate) result = func.apply(context, args);
        }
        return result;
    });

    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = args = context = null;
    };

    return debounced;
}

// Función de búsqueda aplicado retraso de función debouce, para búsqueda
// de los pokemones.
const buscarConDebounce = debounce(async function () {

    // El nombre del pokemón buscado, garantizando que no haya espacios en
    // blanco y que el nombre sea en minúscula
    const nombre = oponente_seleccianado.value.trim().toLowerCase();

    // Al escribir un nuevo nombre, se invalida la batalla anterior confirmada
    resetear_Stage_2();
    // Se deshabilita botón de batalla para evitar pelear con datos anteriores
    botonIniciarBatalla.disabled = true;

    // Si no hay texto digitado, limpia sugerencias y resetea estado enemigo
    if (!nombre) {
        
        listaResultadosBusqueda.innerHTML = "";
        state.enemy = null;
        enemy_datos = null;
        render_Enemy_Panel(state.enemy);
        render_carga_resultados(1,"No se encontraron datos.");
        botonIniciarBatalla.disabled = true;
        
        return;
    }

    // Cancela la búsqueda anterior si todavía estaba en proceso
    if (controller_busqueda) {
        controller_busqueda.abort();
    }

    // Crea un nuevo controlador para la búsqueda actual
    controller_busqueda = new AbortController();

    // Filtra nombres de pokemones ya cargados en memoria local
    // La sugerencia se hace contra arreglo de pokemones, con nombres
    // precargados y conocidos, ya que contra el API, lo que devuelve
    // es un conjunto de todos los datos de un pokemon o varios
    const sugerencias = lista_completa_pokemones
         // Donde los nombres en arreglo de pokemones, coincidan
         // con lo digitado
        .filter(pokemon => pokemon.startsWith(nombre))
        .slice(0, 8);

    // Muestra elementos coincidentes
    console.log("Sugerencias encontradas:", sugerencias);

    // Limpia lista visual anterior
    listaResultadosBusqueda.innerHTML = "";

    // Si no hay coincidencias, muestra mensaje y sale
    if (sugerencias.length === 0) {
        lblMensajeError.textContent = "No se encontraron coincidencias.";
        botonIniciarBatalla.disabled = true;
        return;
    }

    // Limpia mensaje de error si sí hay coincidencias
    lblMensajeError.textContent = "";

    // Renderiza sugerencias clickeables debajo del input
    sugerencias.forEach(nombrePokemon => {
        const item = document.createElement("li");
        item.textContent = nombrePokemon;
        item.style.cursor = "pointer";

        // Le agrega lister al elemento para poderle dar click
        item.addEventListener("click", async () => {
            
            // Si había una petición anterior en proceso, la cancela
            if (controller_busqueda) {
                controller_busqueda.abort();
            }

            // Crea nuevo controlador para la petición seleccionada
            controller_busqueda = new AbortController();
            
            // Al seleccionar nueva sugerencia, se invalida batalla anterior confirmada
            resetear_Stage_2();
            // Se deshabilita botón de batalla
            botonIniciarBatalla.disabled = true;

            // Asigna elemento clickead, a campo input de texto de búsqueda de pokemón
            oponente_seleccianado.value = nombrePokemon;
            // Limpia lista de resultados
            listaResultadosBusqueda.innerHTML = "";
            
            // Una vez establecido el pokemón que se desea solicitar a la Poke-Api, se
            // inicia proceso de carga o espera, llamando a función que muestra barra 
            // de carga
            render_carga_resultados(0,"Cargando datos...");
            // Solicita datos reales del pokemón seleccionado
            enemy_datos = await request_Pokemon(nombrePokemon, controller_busqueda.signal);

            // Si el API devuelve datos válidos
            if (enemy_datos) {
                // Se actualiza objeto de estado para el enemigo
                state.enemy = enemy_datos;
                // Se llama a función que llena detalles de enemigo (movimientos, HP, etc)
                render_Enemy_Panel(state.enemy);
                // Se vuelve a llamar a función de barra de carga, está vez ocultándola, y
                // indicando éxito
                render_carga_resultados(1,"Datos cargados con éxito.");
                // Se guarda última búsqueda de pokemón enemigo efectiva, en localstorage
                // para que pueda ser recordada tras cerrar navegador.
                guardar_Local_Storage("enemigo",nombrePokemon);
                lblMensajeError.textContent = "";
                
                // No se habilita batalla aquí, se obliga a confirmar con botón 
                // "Retar oponente"
                botonIniciarBatalla.disabled = true;
                
            // Si los datos no son válidos, se limpian objetos
            } else {
                state.enemy = null;
                enemy_datos = null;
                render_Enemy_Panel(state.enemy);
                render_carga_resultados(1,"No se encontraron datos.");
                lblMensajeError.textContent = "No se encontró un Pokemón con ese nombre.";
                botonIniciarBatalla.disabled = true;
            }
        });

        listaResultadosBusqueda.appendChild(item);
    });

}, 400);

// Método para limpiar objetos en stage 2, producto de una batalla previa.
function resetear_Stage_2(){
    
    // Limpia objetos sucios por batalla anterior 
    limpiar_Batalla_Anterior();
    // Se cierran bloques visuales de batalla previa
    bloqueStage2.open = false;
    bloqueLog.open = false;

    // Se eliminan datos previos de batalla almacenados
    eliminar_Local_Storage("estado_Pokemones");
}
// ******************************************************************************************
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES DE MANEJO DE EVENTOS Y COMPORTAMIENTO DE OBJETOS (EVENTLISTENERS())
// ****************************************************************************************** 

// AUTOARRANQUE: Al ejecutarse la página, DOM, invoca función principal (init)
document.addEventListener('DOMContentLoaded', init);
    
// Método de comportamiento (click) de botón de cambio de tema/estilo 
// de página. (Modo Claro/oscuro)
botonTema.addEventListener('click', () => {
   
    const oscuroActivo = pagina.classList.contains('tema_oscuro');
    console.log(oscuroActivo);
    // Llama a función de cambio de estilo, en render.js
    cambiar_Modo_pagina(oscuroActivo);    
});

// Método de comportamiento (click) de botón de buscar oponente
botonBuscarOponente.addEventListener('click', async () => {
    
    // Resetea componentes sucios en stage 2 si ha existido una batalla previa
    resetear_Stage_2();
    
    // Se garantiza que el nombre escrito del pokemón oponente, no tenga espacios
    // al inicio o final, y que sea en minúscula
    const nombre_oponente = oponente_seleccianado.value.trim().toLowerCase();
    
    // Se valida que el nombre del pokemón escrito, no sea un valor vacío
    if (nombre_oponente === '')
    {
        // Limpia objetos si la búsqueda es vacía
        lblMensajeError.textContent = "Por favor debe ingresar un nombre de Pokemón válido.";
        state.enemy = null;
        enemy_datos = null;
        render_Enemy_Panel(state.enemy);
        render_carga_resultados(1,"No se encontraron datos.");
        botonIniciarBatalla.disabled = true;
                    
    } else {
        
         try {
             
             // simula búsqueda (barra de carga de datos)
             render_carga_resultados(0,'Cargando datos...');
             // Solicita de datos a la API para nuestro pokemón
             enemy_datos = await request_Pokemon(nombre_oponente);
             
             // Si el pokemón existe y devolvió datos válidos
             if (enemy_datos) {
                 
                 // Guada estado (enemy)
                 state.enemy = enemy_datos;
                 // Actualiza Interfaz Gráfica (IU)
                 render_Enemy_Panel(state.enemy);
                 render_carga_resultados(1,"Datos cargados con éxito.");
                 guardar_Local_Storage("enemigo",nombre_oponente);
                 lblMensajeError.textContent = "";
                 
                // Si los objetos de estado de los datos no tiene información válida,
                //  no se sigue con batalla.
                if(!state.player){ return; }
                if(!state.enemy) { return; }
                 
                 // Si son vpalidos, se actualiza en almacenamiento local 
                 const estado_Pokemones = {
                     player: state.player,
                     enemy: state.enemy,
                     trainer: state.trainer
                 };
                 
                 // Se guardó nombre del último pokemón digitado que trajo datos 
                 guardar_Local_Storage("enemigo",enemy_datos.name);
                 
                 // Se guardan datos del pokemon favorito, oponente y trainer 
                 // para iniciar batalla (listo)
                 guardar_Local_Storage("estado_Pokemones", JSON.stringify(estado_Pokemones));
                 
                 // Se habilita botón de batalla dado que ambos pokemones favorito y
                 // oponente cumplen para la batalla
                 botonIniciarBatalla.disabled = false;
                 
             } else {
                 
                 // Limpia estado enemigo
                 state.enemy = null;
                 enemy_datos = null;
                 
                 // Resetea panel enemigo
                 render_Enemy_Panel(state.enemy);
                 render_carga_resultados(1,"No se encontraron datos.");
                 lblMensajeError.textContent = "No se encontró un Pokemón con ese nombre.";
                 botonIniciarBatalla.disabled = true;
             }
             
        
    // Si ocurre un error en la carga de los datos
    } catch (error) {
        
        console.error(error);
        state.enemy = null;
        enemy_datos = null;
        render_Enemy_Panel(state.enemy);
        render_carga_resultados(1,"No se encontraron datos.");
        lblMensajeError.textContent = "Ocurrió un error al buscar el Pokemón.";
        botonIniciarBatalla.disabled = true;
        
    }
           
    }
            
});
    
// Método de comportamiento (click) de botón para buscar oponentes al azar (random)
botonBuscarAlAzar.addEventListener('click', async () => {
    
    resetear_Stage_2();
    // Actualiza datos de búsqueda
    render_carga_resultados(0,"Cargando datos...");
    
    // Espera a que termine la animación de búsqueda (en render.js)
    await animar_seleccion_random();

    // Genera un id aleatorio para los pokemon, se leyó que la api 
    // puede contener hasta 1000 pokemones.
    const id_random = Math.floor(Math.random() * 999) + 1;

    // Solicitud de datos del pokemón aleatorio
    enemy_datos = await request_Pokemon(id_random);

    // Si se devolvió un pokemón válido
    if (enemy_datos) {
        
        state.enemy = enemy_datos;
        render_Enemy_Panel(state.enemy);
        lblMensajeError.textContent = "";
        render_carga_resultados(1,"Datos cargados con éxito.");
        oponente_seleccianado.value = enemy_datos.name;
     
         // Si los objetos de estado de los datos no tiene información válida, no se sigue
         // // con batalla.
         if(!state.player){ return; }
        if(!state.enemy) { return; }
        
        // Se guardó nombre del último pokemón digitado que trajo datos
        guardar_Local_Storage("enemigo",enemy_datos.name);

        // No se habilita batalla aquí, se obliga a confirmar con botón "Retar oponente"
        botonIniciarBatalla.disabled = true;
        
    } else {
        
        // Si el valor es nulo
        state.enemy = null;
        enemy_datos = null;
        render_Enemy_Panel(state.enemy);
        render_carga_resultados(1,"No se pudo cargar el pokemón aleatoriamente.");
        lblMensajeError.textContent = "No se pudo cargar el pokemón aleatoriamente.";
        botonIniciarBatalla.disabled = true;
        
    }
    
});

// Acción del botón para iniciar batalla, deben haber datos válidos de estado
//  para la batalla,y el botón estar habilitado.
botonIniciarBatalla.addEventListener('click', async () => {
    
    // Llama a función en battle.js que inicia batalla
    iniciar_Batalla();
});
// ******************************************************************************************
// ******************************************************************************************
