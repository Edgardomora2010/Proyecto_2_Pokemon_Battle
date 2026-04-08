/* ******************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Profesor: Jose Pablo Garbanzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
 * *****************************************************************************************/

// ******************************************************************************************
// IMPORTS: FUNCIONES EN: RENDER.JS, TRAINER.CONFIG.JS 
// 
// Se importan funciones en archivo render.js para poder accesar y actualizar objetos
// visuales de la página. También datos en el archivo trainer.config.js
// ******************************************************************************************
//
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
import { iniciar_Batalla } from './battle.js';
// ******************************************************************************************


// ******************************************************************************************
// OBJETOS DE USO GLOBAL
// ******************************************************************************************

// ESTADO GLOBAL
const state = {
    player: null,
    trainer: null,
    enemy: null
};

// OBJETOS PARA ALMACENAR DATOS
let trainer_datos = null;
let player_datos  = null;
let enemy_datos   = null;
let controller_busqueda = null;

// ESTADO GLOBAL DE BATALLA
let controlDatosBatalla = null;

// ARREGLOS
let lista_completa_pokemones = [];

// OBJETOS GENERALES DEL HTML/DOM
const pagina = document.body;
const oponente_seleccianado = document.getElementById("txt_nombre_enemigo");
const botonTema = document.getElementById('bttn_tema');
const botonBuscarOponente = document.getElementById('btn_buscar_oponente');
const botonBuscarAlAzar   = document.getElementById('btn_random');
const botonIniciarBatalla = document.getElementById('btn_iniciar_batalla');
const listaResultadosBusqueda = document.getElementById('resultados_busqueda');
const lblMensajeError  =   document.getElementById('error_busqueda');

//
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES RELACIONADAS CON ALMACENAMIENTO DE DATOS DEL NAVEGADOR
// ******************************************************************************************

// Función para guardar datos del último Pokemón seleccionado, y que este se mantenga tras
// cerrar navegador
function guardar_Local_Storage(clave,valor)
{ 
    if (valor !== ""){
        window.localStorage.setItem(clave,valor);
    }
    
}

// Función para obtener datos guardados del último Pokemón seleccionado, y que este se
// mantenga tras cerrar navegador
function obtener_Local_Storage(clave){ 
    
    const valor = window.localStorage.getItem(clave); 
    return valor;
    
}

// Función para eliminar datos guardados del último Pokemón seleccionado, y que este se
// mantenga tras cerrar navegador
function eliminar_Local_Storage(clave){ 
    
    const valor = window.localStorage.removeItem(clave); 
    return valor;

}

function cargar_Datos_Batalla(llave){
    
    // Se llama a función de lectura de datos en almacenamiento local
    const datos_guardados = obtener_Local_Storage(llave);
    // Si no hay nada guardado, retorna null y se aborta carga de datos
    if (!datos_guardados) {
        return null;
    }
    
    // Si si existen datos válidos, se convierte string JSON en objeto real
    const estado_Pokemones = JSON.parse(datos_guardados);
    
    // Si faltan datos importantes, retorna null y aborta carga
    if (!estado_Pokemones.player || !estado_Pokemones.enemy || !estado_Pokemones.trainer) {
        return null;
    }
    
    // Crea el estado real de la pelea
    controlDatosBatalla = {
        
        // Datos base heredados desde Stage 1, y coservados en el local storage
        // sirve si se desea pasar datos entre páginas, para este caso se utilizó sigle
        // page sin embargo es importante hacer uso de estructura de almacenamiento
        player: estado_Pokemones.player,
        enemy: estado_Pokemones.enemy,
        trainer: estado_Pokemones.trainer,
    
        // HP reales de batalla
        playerHP: Math.floor(estado_Pokemones.player.stats.hp * 2.5),
        enemyHP: Math.floor(estado_Pokemones.enemy.stats.hp * 2.5),
        
        // Posiciones en arena
        playerPosition: 2,
        enemyPosition: 2,
        
        // Ataque enemigo actual
        incomingAttack: null,
        
        // Control de pelea
        locked: false,
        definitiveUsed: false,
        attackOnCooldown: false,
        
        // Estado general de batalla
        phase: "fighting",
        
        // Registro de eventos
        log: []
    };
    
    return controlDatosBatalla;
    
}

//
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES GENERALES DE INTERACCIÓN Y COMUNICACIÓN
// CON EL API.JS, EL RENDER.JS PARA LA VISUALIZACIÓN
// Y EL TRAINER.CONFIG.JS
// ******************************************************************************************

// Función general para comunicarse con el API para obtener
// los datos de cualquier Pokemón.
async function request_Pokemon(nombre_pokemon, signal = null) {
    try {
        // Llama a función de la API para traer datos del
        // Pokemón deseado
        const datos = await get_Pokemon(nombre_pokemon, signal);
        // Retorna conjunto de datos requeridos
        return datos;
        
    // Si ocurre un error en la carga de los datos
    } catch (error) {
        
        // Si la petición fue cancelada por AbortController,
        // no se toma como error real
        if (error.name === "AbortError") {
            return null;
        }
        
        console.error(error);
        return null;
        
    }
}

async function request_todos_Nombres_Pokemones(cantidadLimite){
    
    try {
        // Carga lista completa de pokemones para suggestions
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=" + cantidadLimite);
        const data = await res.json();
        // Solo guardamos nombres
        lista_completa_pokemones = data.results.map(p => p.name);
        console.log(lista_completa_pokemones);
        }
    catch (error)
    {
        console.error("Error cargando lista completa de pokemones:", error);
    }
    
}

// ******************************************************************************************
// FUNCIONES AUXILIARES: DEBOUNCE, RESTARGUMENTS, Y OTRAS
// ******************************************************************************************

// Función auxiliar que permite a otra función recibir múltiples argumentos
// agrupándolos en un arreglo ("rest") Se usa internamente por debounce para
//  manejar parámetros dinámicos.
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

// Retrasa la ejecución de una función hasta que el usuario deja de interactuar.
// Evitando múltiples ejecuciones consecutivas.
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

    const nombre = oponente_seleccianado.value.trim().toLowerCase();

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
    const sugerencias = lista_completa_pokemones
        .filter(pokemon => pokemon.startsWith(nombre))
        .slice(0, 8);

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

        item.addEventListener("click", async () => {
            
            // Si había una petición anterior en proceso, la cancela
            if (controller_busqueda) {
                controller_busqueda.abort();
            }

            // Crea nuevo controlador para la petición seleccionada
            controller_busqueda = new AbortController();
            
            oponente_seleccianado.value = nombrePokemon;
            listaResultadosBusqueda.innerHTML = "";
            render_carga_resultados(0,"Cargando datos...");

            // Solicita datos reales del pokemón seleccionado
            enemy_datos = await request_Pokemon(nombrePokemon, controller_busqueda.signal);

            if (enemy_datos) {
                state.enemy = enemy_datos;
                render_Enemy_Panel(state.enemy);
                render_carga_resultados(1,"Datos cargados con éxito.");
                guardar_Local_Storage("enemigo",nombrePokemon);
                lblMensajeError.textContent = "";
                botonIniciarBatalla.disabled = false;
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
//
// ******************************************************************************************


// FUNCIÓN PRINCIPAL: Carga con el inicio de pagina el DOM
// Los el pokemón favorita, y los datos de Trainer card
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
        // Guadar estado
        state.trainer = trainer_datos;
         // Actualizar Interfaz Gráfica (IU)
        render_Trainer_Panel(state.trainer);
        
        // Solicitud de datos a la API para nuestro pokemon 
        player_datos = await get_Pokemon(trainer_datos.favoritePokemon);
        // Guadar estado
        state.player = player_datos;
        // Actualizar Interfaz Gráfica (IU)
        render_Player_Panel(state.player);
        
        // Lee datos guardado del último pokemón oponente buscado y los
        // asigna
        const enemigo = obtener_Local_Storage("enemigo");
        
        // Si el enemigo es válido (llave y valor)
        if (enemigo){
            // Se asigna nombre del último pokemón buscado al componente html.
            oponente_seleccianado.value = enemigo;
        }

        // Estado inicial de botón de iniciar batalla
        botonIniciarBatalla.disabled = true;
        
        // Registro de eventos luego de que el DOM y datos iniciales existen
        oponente_seleccianado.addEventListener('keyup', buscarConDebounce);
        
    // Si ocurre un error en la carga de los datos
    } catch (error) {
        console.error(error);
    }
    
}


// ******************************************************************************************
// MANEJADORES DE EVENTOS PARA COMPONENTES DEL DOM
// ****************************************************************************************** 

// AUTOARRANQUE: Al ejecutarse la página, DOM, invoca init
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
    
    // Se garantiza que el nombre escrito del pokemón oponente, no tenga espacios
    // al inicio o final, y que sea en minúscula
    const nombre_oponente = oponente_seleccianado.value.trim().toLowerCase();
    
    // Se valida que el nombre del pokemón escrito, no sea un valor vacío
    if (nombre_oponente === '')
    {
        lblMensajeError.textContent = "Por favor debe ingresar un nombre de Pokemón válido.";
        state.enemy = null;
        enemy_datos = null;
        render_Enemy_Panel(state.enemy);
        render_carga_resultados(1,"No se encontraron datos.");
        botonIniciarBatalla.disabled = true;
                    
    } else {
        
         try {
             
             render_carga_resultados(0,'Cargando datos...');
             
             // Solicita de datos a la API para nuestro pokemón
             enemy_datos = await request_Pokemon(nombre_oponente);
             
             // Si el pokemón existe y devolvió datos válidos
             if (enemy_datos) {
                 
                 // Guada estado
                 state.enemy = enemy_datos;
                 
                 // Actualiza Interfaz Gráfica (IU)
                 render_Enemy_Panel(state.enemy);
                 render_carga_resultados(1,"Datos cargados con éxito.");
                 guardar_Local_Storage("enemigo",nombre_oponente);
                 lblMensajeError.textContent = "";
                 
                // Si los objetos de estado de los datos no tiene información válida, no se sigue
                // con batalla.
                if(!state.player){ return; }
                if(!state.enemy) { return; }
                 
                 // objeto para almacenar datos en almacenamiento local 
                 const estado_Pokemones = {
                     player: state.player,
                     enemy: state.enemy,
                     trainer: state.trainer
                 };
                 
                 // Se guardó nombre del último pokemón digitado que trajo datos 
                 guardar_Local_Storage("enemigo",enemy_datos.name);
                 // Se guardan datos de los pokemones y trainer para iniciar batalla
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
    
// Método de comportamiento (click) de botón para buscar oponentes al azar
botonBuscarAlAzar.addEventListener('click', async () => {
    
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
        
        // objeto para almacenar datos en almacenamiento local 
        const estado_Pokemones = {
            player: state.player,
            enemy: state.enemy,
            trainer: state.trainer
        };
        
        // Se guardó nombre del último pokemón digitado que trajo datos
        guardar_Local_Storage("enemigo",enemy_datos.name);
        // Se guardan datos de los pokemones y trainer para iniciar batalla
        guardar_Local_Storage("estado_Pokemones", JSON.stringify(estado_Pokemones));
        // Se habilita botón de batalla dado que ambos pokemones favorito y
        // oponente cumplen para la batalla
        botonIniciarBatalla.disabled = false;
        
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

botonIniciarBatalla.addEventListener('click', async () => {
    
    iniciar_Batalla();

});