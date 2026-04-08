/* // *****************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
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

// Tipos de habilidades de pokemon (Fuego, eléctrico)
const tipo_mi_pokemon = [];
const tipo_mi_enemigo = [];

// Colores mapeados a partir de imagen en enunciado
//  de proyecto, colores se extrajeron vía Photoshop
//   con el selector/ detector de colores web.
const pokemones_color_sugeridos = {
    
    fire:    { fondo:"#cc3300", texto:"#ff9033" },
    water:   { fondo:"#003366", texto:"#6699ff" },
    grass:   { fondo:"#003333", texto:"#33cc66" },
    electric:{ fondo:"#663300", texto:"#cccc33" },
    psychic: { fondo:"#330033", texto:"#ff66cc" },
    dragon:  { fondo:"#000066", texto:"#6666ff" },
    ghost:   { fondo:"#330066", texto:"#6666ff" },
    normal:  { fondo:"#333333", texto:"#999999" }
    
};

// Colores por defecto si no existe el tipo de pokemon
// en diccionario. (PLAYER)
const player_colores_default = {
    fondo: "#006666",
    texto: "#00cccc",
};

// Colores por defecto si no existe el tipo de pokemon
// en diccionario. (ENEMY)
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
const triner_sabor_definitvo = document.getElementById("trainer_definitive_flavor");
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
// FUNCIONES GENERALES DE RENDERIZACION/ACTUALIZACION DE OBJETOS 
// Y VISUALIZACIÓN DE LA PÁGINA:
// ****************************************************************************************** 

// Método para actualizar objetos en página del panel del pokemon
// por defecto
export function render_Player_Panel(datos_pokemon){
    
    // Se asignan valores de arreglo de datos del pokemon
    // escogido, leídos del API a los objetos del Panel: Player
    // para su actualización visual en los componentes (etiquetas 
    // HTML de la páginas).
    mi_pokemon_imagen.src = datos_pokemon.spriteFront;
    mi_pokemon_nombre.textContent = datos_pokemon.name;

    mi_pokemon_tipos.innerHTML = "";
    tipo_mi_pokemon.length = 0;

    datos_pokemon.types.forEach(tipo => {
        const item = document.createElement("li");
        item.textContent = tipo;
        mi_pokemon_tipos.appendChild(item);
        tipo_mi_pokemon.push(tipo);
    });
    
    mi_pokemon_hp.textContent = datos_pokemon.stats.hp;
    mi_pokemon_ataque.textContent = datos_pokemon.stats.attack;
    mi_pokemon_defensa.textContent = datos_pokemon.stats.defense;
    mi_pokemon_velocidad.textContent = datos_pokemon.stats.speed;

    mi_pokemon_movimientos.innerHTML = "";
    datos_pokemon.moves.forEach(movimiento => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${movimiento.name}</strong><br>P: 
        ${movimiento.power ?? '-'} | A: ${movimiento.accuracy ?? '-'} | PP: 
        ${movimiento.pp ?? '-'}`;
        mi_pokemon_movimientos.appendChild(item);
});
    
    const colores_player = obtener_Colores_Pokemon
    (tipo_mi_pokemon,player_colores_default);
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
    trainer_nombre.textContent = datos_trainer.name;
    trainer_ciudad.textContent = datos_trainer.hometown;
    trainer_frase.textContent = datos_trainer.catchphrase;
    trainer_pokemon_favorito.textContent = datos_trainer.favoritePokemon;
    trainer_nickname.textContent = datos_trainer.nickname;
    trainer_grito_batalla.textContent = datos_trainer.battleCry;
    trainer_movimiento_definitivo.textContent = datos_trainer.definitiveMoveName;
    triner_sabor_definitvo.textContent = datos_trainer.definitiveMoveFlavor;
    trainer_mensaje_victoria.textContent = datos_trainer.winMessage;
    trainer_mensaje_derrota.textContent = datos_trainer.loseMessage;           

}

// Función para actualizar objetos en página del panel del pokemon
// enemigo que se seleccione
export function render_Enemy_Panel(datos_enemigo){
    
    // Si no hay datos válidos, resetear panel enemigo a estado inicial
    if (!datos_enemigo) {
        
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
    mi_enemigo_imagen.src = datos_enemigo.spriteFront;
    mi_enemigo_nombre.textContent = datos_enemigo.name;
    
    mi_enemigo_tipos.innerHTML = "";
    tipo_mi_enemigo.length = 0;

    datos_enemigo.types.forEach(tipo => {
        const item = document.createElement("li");
        item.textContent = tipo;
        mi_enemigo_tipos.appendChild(item);
        tipo_mi_enemigo.push(tipo);
    });
    
    mi_enemigo_hp.textContent = datos_enemigo.stats.hp;
    mi_enemigo_ataque.textContent = datos_enemigo.stats.attack;
    mi_enemigo_defensa.textContent = datos_enemigo.stats.defense;
    mi_enemigo_velocidad.textContent = datos_enemigo.stats.speed;
    mi_enemigo_movimientos.innerHTML = "";
    datos_enemigo.moves.forEach(movimiento => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${movimiento.name}</strong><br>P: 
        ${movimiento.power ?? '-'} | A: ${movimiento.accuracy ?? '-'} | PP: 
        ${movimiento.pp ?? '-'}`;
        mi_enemigo_movimientos.appendChild(item);
});
    
    const colores_enemy = obtener_Colores_Pokemon
    (tipo_mi_enemigo,enemy_colores_default);
    mi_enemigo_articulo.style.backgroundColor = colores_enemy.fondo;
    mi_enemigo_articulo.style.color = colores_enemy.texto;
    mi_enemigo_titulos.style.color = colores_enemy.texto;
   
}

// Método para cambio de modo de visualización de página (Claro/Oscuro)
export function cambiar_Modo_pagina(oscuroActivo){
    
    if (oscuroActivo) {
        pagina.classList.remove('tema_oscuro');
        pagina.classList.add('tema_claro');
        botonTema.textContent = 'Modo oscuro';
    
    } else {
        
        pagina.classList.remove('tema_claro');
        pagina.classList.add('tema_oscuro');
        botonTema.textContent = 'Modo claro';
        
    }
    
}

// Método para actualizar objetos en página del panel del pokemon
// por defecto
export function render_carga_resultados(estado, mensaje){
    
    if (estado === 0)
    {
        mi_enemigo_resultado.textContent = `Resultado:${mensaje}`;
        mi_enemigo_barra_carga.src = "./stage-1/img/Loading_animation_bar.gif";
        
    } else if (estado === 1) {
        
        mi_enemigo_resultado.textContent = `Resultado:${mensaje}`;
        mi_enemigo_barra_carga.src = "./stage-1/img/Lupa.png";
        
    }
    
}

// Función para busca el primer tipo válido del arreglo de tipos del
//  pokemon y retornar su combinación de colores. 
//  Si no encuentra coincidencia, del tipo de pokemon, retorna los 
//  colores por defecto prediseñados, para el pokemón selecionado, como
//  el oponente.
function obtener_Colores_Pokemon(arreglo_tipos, colores_default) {
    
    for (let i = 0; i < arreglo_tipos.length; i++) {
        
        const tipo_actual = arreglo_tipos[i];
        
        if (pokemones_color_sugeridos[tipo_actual]) {
            return pokemones_color_sugeridos[tipo_actual];
        }
    }
    
    return colores_default;
}

/*export function animar_seleccion_random(){
    
    let contador =1;
    for (let i = 1;i < 200; i++)
    {
        if (contador < 6){
             
             mi_enemigo_imagen.src = "./img/S" + contador + ".png";
             
        } else { contador = 1; }
        
        contador++;
       
    }*/

// Método para animar la búsqueda de los pokemón cuando se selecciona buscar
// un pokemón al azar. Para esta animación se optó por algo sencillo, la transición
// de un arreglo de imágenes de pokemones diseñados modificadas en photophop, que al
// irse asignando al componente de imagen, de forma secuencial, den la idea de movimiento
// o animación. Se indaga un poco, como realizar este tipo de animaciones, ya que inicial
// mente se intentó mediante ciclo for, pero no se actualizaba en tiempo real la visualización,
// o no funcionaba de la manera en que quizás si es posible en otro lenguajes no web, tal que
// fue necesario implementer interval
export function animar_seleccion_random(){
    
    return new Promise((resolve) => {
        
        // Inicia con 1, ya que la primera imagen que conforma la animación tiene tal
        // número 
        let contador = 1;
        let vueltas = 0;

        const intervalo = setInterval(() => {
            
            // Se asigna imagen a componente html de imagen del enemigo
            // cada imagen tiene un número indentificador, por lo que al
            // aumentar en contador, reasigna la nueva imagen
            mi_enemigo_imagen.src = `./stage-1/img/S${contador}.png`;

            contador++;
            
            // El contador no debe superar el número 5, ya que la animación
            // contiene solo imágenes. Cada vez que llega al máximo, se reincia
            // para repetir animación.
            if (contador > 6) {
                contador = 1;
                vueltas++;
            }

            if (vueltas >= 9) {
                clearInterval(intervalo);
                resolve();
            }

        }, 100);
          
        
    });
    
}

