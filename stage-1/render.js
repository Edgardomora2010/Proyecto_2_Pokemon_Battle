/* // *****************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Archivo: (JAVASCRIPT)/JS (RENDER.JS)
 * Profesor: Jose Pablo Garzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
 * // *****************************************************************************************/ 

// ********************************************************************************************
// OBJETOS DE USO GLOBAL
// ********************************************************************************************

// PAGINA
const pagina = document.body;
const botonTema = document.getElementById('bttn_tema');

// Tipos de habilidades de pokemon (Fuego, eléctrico),Ya que un solo pokemón puede 
// tener varios
const tipo_mi_pokemon = [];
const tipo_mi_enemigo = [];

// Colores mapeados a partir de imagen en enunciado de proyecto, colores se extrajeron
//  vía Photoshop (con el selector/detector de colores web).
const pokemones_color_sugeridos = {
    
    // USO:    Background       Letras
    fire:    { fondo:"#cc3300", texto:"#ff9033" },
    water:   { fondo:"#003366", texto:"#6699ff" },
    grass:   { fondo:"#003333", texto:"#33cc66" },
    electric:{ fondo:"#663300", texto:"#cccc33" },
    psychic: { fondo:"#330033", texto:"#ff66cc" },
    dragon:  { fondo:"#000066", texto:"#6666ff" },
    ghost:   { fondo:"#330066", texto:"#6666ff" },
    normal:  { fondo:"#333333", texto:"#999999" }
    
};

// Colores por defecto para: (PLAYER/Pokemón favorito) si no existe el tipo de
// pokemon en el diccionario (tipo pokemón, color de fondo, color de letra). 
const player_colores_default = {
    fondo: "#006666", // Fondo
    texto: "#00cccc", // Texto 
};

// Colores por defecto para: (Pokemón ENEMY), si no existe el tipo de pokemon
//  en diccionario (tipo pokemón, color de fondo, color de letra).
const enemy_colores_default = {
    fondo: "#660000",
    texto: "#ff3333"
};

// OBJETOS DENTRO DE:PLAYER_PANEL (HTML)
// Los objetos se indentifican por su id único.
const mi_pokemon_imagen = document.getElementById("player_sprite");
const mi_pokemon_nombre = document.getElementById("player_name");
const mi_pokemon_tipos = document.getElementById("lista_player_types");
const mi_pokemon_hp = document.getElementById("hp");
const mi_pokemon_ataque = document.getElementById("attack");
const mi_pokemon_defensa = document.getElementById("defense");
const mi_pokemon_velocidad = document.getElementById("speed");
const mi_pokemon_movimientos = document.getElementById("lista_player_moves");
const mi_pokemon_titulos = document.getElementById("titulo_player_panel");
const mi_pokemon_articulo = document.getElementById("articulo_1");

// OBJETOS DENTRO DE: TRAINER_CARD_PANEL (HTML)
// Los objetos se indentifican por su id único.
const trainer_nombre = document.getElementById("trainer_name");
const trainer_ciudad = document.getElementById("trainer_town");
const trainer_frase = document.getElementById("trainer_phrase");
const trainer_pokemon_favorito = document.getElementById("trainer_favorite_pokemon");
const trainer_nickname = document.getElementById("trainer_nickname");
const trainer_grito_batalla = document.getElementById("trainer_battle_cry");
const trainer_movimiento_definitivo = document.getElementById("trainer_definitive_move");
const trainer_sabor_definitivo = document.getElementById("trainer_definitive_flavor");
const trainer_mensaje_victoria = document.getElementById("trainer_win_message");
const trainer_mensaje_derrota = document.getElementById("trainer_lose_message");
const trainer_articulo = document.getElementById("articulo_2");
const trainer_boton_inicar_batalla = document.getElementById('btn_iniciar_batalla');

// OBJETOS DENTRO DE:ENEMY_PANEL (HTML)
// Los objetos se indentifican por su id único.
const mi_enemigo_imagen = document.getElementById("enemy_sprite");
const mi_enemigo_nombre = document.getElementById("enemy_name");
const mi_enemigo_tipos = document.getElementById("lista_enemy_types");
const mi_enemigo_hp = document.getElementById("enemy_hp");
const mi_enemigo_ataque = document.getElementById("enemy_attack");
const mi_enemigo_defensa = document.getElementById("enemy_defense");
const mi_enemigo_velocidad = document.getElementById("enemy_speed");
const mi_enemigo_movimientos = document.getElementById("lista_enemy_moves");
const mi_enemigo_titulos = document.getElementById("titulo_enemy_panel");
const mi_enemigo_articulo = document.getElementById("articulo_3");
const mi_enemigo_resultado = document.getElementById("resultado_carga");
const mi_enemigo_barra_carga = document.getElementById("barra_carga");
// ******************************************************************************************
// ******************************************************************************************


// ****************************************************************************************** 
// FUNCIONES GENERALES DE RENDERIZACION/ACTUALIZACION DE OBJETOS 
// Y VISUALIZACIÓN DE LA PÁGINA:
// ****************************************************************************************** 

// Método para actualizar objetos en página del panel del pokemon
// por defecto
export function render_Player_Panel(datos_pokemon){
    
    // Si los datos son inválidos se aborta actualización
    // de objetos 
    if (!datos_pokemon) return;

    // Se asignan valores de arreglo de datos del pokemon
    // escogido, leídos del API a los objetos del Panel: Player
    // para su actualización visual en los componentes (etiquetas 
    // HTML de la páginas).
    
    // Imagen
    mi_pokemon_imagen.src = datos_pokemon.spriteFront;
    // Nombre
    mi_pokemon_nombre.textContent = datos_pokemon.name;

    // Tipo
    mi_pokemon_tipos.innerHTML = "";
    tipo_mi_pokemon.length = 0;
    datos_pokemon.types.forEach(tipo => {
        const item = document.createElement("li");
        item.textContent = tipo;
        mi_pokemon_tipos.appendChild(item);
        tipo_mi_pokemon.push(tipo);
    });
    
    // Estadísticas
    mi_pokemon_hp.textContent = datos_pokemon.stats.hp;
    mi_pokemon_ataque.textContent = datos_pokemon.stats.attack;
    mi_pokemon_defensa.textContent = datos_pokemon.stats.defense;
    mi_pokemon_velocidad.textContent = datos_pokemon.stats.speed;

    // Movimientos
    mi_pokemon_movimientos.innerHTML = "";
    datos_pokemon.moves.forEach(movimiento => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${movimiento.name}</strong><br>P: 
        ${movimiento.power ?? '-'} | A: ${movimiento.accuracy ?? '-'} | PP: 
        ${movimiento.pp ?? '-'}`;
        mi_pokemon_movimientos.appendChild(item);
    });
    
    // Asignación de colores según tipo de pokemón
    // Se llama a función para obtener colores de pokemón favorito, se pasan como argumentos
    // el tipo(s) de pokemón que es, y colores por defecto para ese pokemón en caso de que
    // no se encuentre ese tipo de pokemón en el diccionario de colores y tipos de pokemones
    const colores_player = obtener_Colores_Pokemon(tipo_mi_pokemon,player_colores_default);
    mi_pokemon_articulo.style.backgroundColor = colores_player.fondo;
    mi_pokemon_articulo.style.color = colores_player.texto;
    mi_pokemon_titulos.style.color = colores_player.texto;
    
}

// Método para actualizar objetos en página del panel de trainer
// por defecto
export function render_Trainer_Panel(datos_trainer){
    
    // Se asignan valores de arreglo de datos del trainer
    // con datos preasignados por defecto, para su actualización
    //  visual en los componentes (etiquetas HTML de la páginas).
    trainer_nombre.textContent = datos_trainer.name;                      // Nombre
    trainer_ciudad.textContent = datos_trainer.hometown;                  // Ciudad
    trainer_frase.textContent = datos_trainer.catchphrase;                // Frase
    trainer_pokemon_favorito.textContent = datos_trainer.favoritePokemon; // Pokemón favorito
    trainer_nickname.textContent = datos_trainer.nickname;                // Apodo
    trainer_grito_batalla.textContent = datos_trainer.battleCry;          // Grito de batalla
    trainer_movimiento_definitivo.textContent = datos_trainer.definitiveMoveName; // Movimiento definitivo
    trainer_sabor_definitivo.textContent = datos_trainer.definitiveMoveFlavor;      // 
    trainer_mensaje_victoria.textContent = datos_trainer.winMessage;              // Mensaje victoria
    trainer_mensaje_derrota.textContent = datos_trainer.loseMessage;              // Mensaje de derrota 

}

// Función para actualizar objetos en página del panel del pokemon
// enemigo que se seleccione
export function render_Enemy_Panel(datos_enemigo){
    
    // Si no hay datos válidos, resetear panel enemigo a estado inicial (skeleton)
    if (!datos_enemigo) {
        
        //Se carga imagen por defecto (signo de pregunta)
        mi_enemigo_imagen.src = "./stage-1/img/Question_mark.png"; 
        mi_enemigo_nombre.textContent = "";
        mi_enemigo_tipos.innerHTML = "";
        mi_enemigo_hp.textContent = "";
        mi_enemigo_ataque.textContent = "";
        mi_enemigo_defensa.textContent = "";
        mi_enemigo_velocidad.textContent = "";
        mi_enemigo_movimientos.innerHTML = "";
        mi_enemigo_articulo.style.backgroundColor = "";
        mi_enemigo_articulo.style.color = "";
        mi_enemigo_titulos.style.color = "";
        trainer_boton_inicar_batalla.disabled = true;
        return;
    }
    
    // Se asignan valores de arreglo de datos del pokemon enemigo
    // escogido, leídos del API a los objetos del Panel: Enemy
    // para su actualización visual en los componentes (etiquetas 
    // HTML de la páginas).
    
    // Imagen real
    mi_enemigo_imagen.src = datos_enemigo.spriteFront;
    // Nombre
    mi_enemigo_nombre.textContent = datos_enemigo.name;
    
    // Tipos
    mi_enemigo_tipos.innerHTML = "";
    tipo_mi_enemigo.length = 0;
    datos_enemigo.types.forEach(tipo => {
        const item = document.createElement("li");
        item.textContent = tipo;
        mi_enemigo_tipos.appendChild(item);
        tipo_mi_enemigo.push(tipo);
    });
    
    // Estadísticas
    mi_enemigo_hp.textContent = datos_enemigo.stats.hp;
    mi_enemigo_ataque.textContent = datos_enemigo.stats.attack;
    mi_enemigo_defensa.textContent = datos_enemigo.stats.defense;
    mi_enemigo_velocidad.textContent = datos_enemigo.stats.speed;
    
    // Movimientos
    mi_enemigo_movimientos.innerHTML = "";
    datos_enemigo.moves.forEach(movimiento => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${movimiento.name}</strong><br>P: 
        ${movimiento.power ?? '-'} | A: ${movimiento.accuracy ?? '-'} | PP: 
        ${movimiento.pp ?? '-'}`;
        mi_enemigo_movimientos.appendChild(item);
    });
    
    
    // Asignación de colores según tipo de pokemón
    // Se llama a función para obtener colores de pokemón, se pasan como argumentos
    // el tipo(s) de pokemón que es, y colores por defecto para el pokemón  (oponente) 
    // en caso de que no se encuentre ese tipo de pokemón en el diccionario de 
    // colores y tipos de pokemones
    const colores_enemy = obtener_Colores_Pokemon
    (tipo_mi_enemigo,enemy_colores_default);
    mi_enemigo_articulo.style.backgroundColor = colores_enemy.fondo;
    mi_enemigo_articulo.style.color = colores_enemy.texto;
    mi_enemigo_titulos.style.color = colores_enemy.texto;
}

// Método para cambio de modo de visualización de página (Claro/Oscuro)
export function cambiar_Modo_pagina(oscuroActivo){
    
    // Si el tema actual, es oscuro habilita tema
    // claro
    if (oscuroActivo) {
        pagina.classList.remove('tema_oscuro');
        pagina.classList.add('tema_claro');
        botonTema.textContent = 'Modo oscuro';
    
    // Si el tema actual, es el claro, habilita
    // el tema oscuro
    } else {
        pagina.classList.remove('tema_claro');
        pagina.classList.add('tema_oscuro');
        botonTema.textContent = 'Modo claro';    
    }
    
}

// Método para actualizar objetos en página del panel del pokemon oponente 
// habilita una barra de carga, mientras se completa la búsqueda o solicitud
// de pokemón al API. No obstante este método, lo que hace es la representación
// visual de ese proceso, (se animará mientra).
export function render_carga_resultados(estado, mensaje){
    
      // Muestra mensaje en argumentos
       mi_enemigo_resultado.textContent = `Resultado:${mensaje}`;
      
    // Barra cargando mientras estado = 0
    if (estado === 0)
    {
        mi_enemigo_barra_carga.src = "./stage-1/img/Loading_animation_bar.gif";
    } else if (estado === 1) {
        // imagen de lupa de encontrado, y esconde barra cargando mientras estado = 1
        mi_enemigo_barra_carga.src = "./stage-1/img/Lupa.png";
    }
    
}

// Función para busca el primer tipo válido del arreglo de tipos del
//  pokemon y retornar su combinación de colores. 
//  Si no encuentra coincidencia, del tipo de pokemon, retorna los 
//  colores por defecto prediseñados, para el pokemón selecionado, como
//  el oponente.
function obtener_Colores_Pokemon(arreglo_tipos, colores_default) {
    
    // Recorre arreglo de tipos de pokemón, que pueda tener un pokemón
    // cada pokemón favorito y enemigo tiene su arreglo individual, de tipos.
    for (let i = 0; i < arreglo_tipos.length; i++) {
        
        // lectura actual, de elemento del arreglo
        const tipo_actual = arreglo_tipos[i];
        
        // Si el primer tipo de pokemón del arreglo, existen en  el diccionario
        // de tipos de pokemones y colores, entonces retornará ese elemento del 
        // diccionario que contiene (tipo pokemón, color de fondo, color de letra)
        if (pokemones_color_sugeridos[tipo_actual]) {
            return pokemones_color_sugeridos[tipo_actual];
        }
    }
    
    // Si no se encontró ese tipo de pokemón, el en diccionario de tipos de pokemones,
    // y colores, devolverá los colores por defecto para el pokemón (fondo, y letra)
    // cada pokemon (favorito, y enemigo) también tiene un set de colores por defecto
    // si no se encuentran en el diccionario general de tipos de pokemones. 
    return colores_default;
}

/*export function animar_seleccion_random(){
    
    let contador =1;
    for (let i = 1;i < 200; i++)
    {
        if (contador < 6){
             
             mi_enemigo_imagen.src = "./stage-1/img/S" + contador + ".png";
             
        } else { contador = 1; }
        
        contador++;
       
    }*/

// Método para animar la búsqueda de los pokemón cuando se selecciona buscar 
// un pokemón al azar. Para esta animación se optó por algo sencillo, la transición
// de un arreglo de imágenes de pokemones diseñados en photophop, que al
// irse asignando al componente de imagen, de forma secuencial, den la idea de movimiento
// o animación. Se indaga un poco, como realizar correctamente este tipo de animaciones en web,
//  ya que inicialmente se intentó mediante un sencillo ciclo for, pero no se actualizaba 
//  en tiempo real la visualización, o no funcionaba de la manera en que quizás si es posible 
//  en otros lenguajes no web, tal que fue necesario implementer interval, y otros ajustes.
export function animar_seleccion_random(){
    
    // se devuelve una promesa 
    return new Promise((resolve) => {
        
        // Inicia con 1, ya que la primera imagen que conforma la animación tiene tal
        // número 
        let contador = 1;
        let vueltas = 0;

        // Se crea un intervalo que ejecuta la animación cada 100ms
        const intervalo = setInterval(() => {
            
            // Se asigna imagen a componente html de imagen del enemigo
            // cada imagen tiene un número indentificador, por lo que al
            // aumentar en contador, reasigna la nueva imagen
            mi_enemigo_imagen.src = `./stage-1/img/S${contador}.png`;

            // Se incrementa el contador para avanzar al siguiente frame de la animación
            contador++;
            
            // El contador no debe superar el número 5, ya que la animación
            // contiene solo imágenes. Cada vez que llega al máximo, se reincia
            // para repetir animación.
            if (contador > 6) {
                contador = 1;
                // Se incrementa el número de ciclos completos de animación
                vueltas++;
            }

            // Cuando se completan suficientes ciclos, se detiene la animación
            if (vueltas >= 9) {
                // Se limpia el intervalo para detener la ejecución repetitiva
                clearInterval(intervalo);
                // Se resuelve la promesa para indicar que la animación terminó
                resolve();
            }

        }, 100);
          
        
    });
    
}