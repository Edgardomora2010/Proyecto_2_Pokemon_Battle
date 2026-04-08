/* *******************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Profesor: Jose Pablo Garbanzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
 * ******************************************************************************************/

// ******************************************************************************************
// OBJETOS DE USO GLOBAL
// ******************************************************************************************

// Dirección de la Poke Api
const poke_api = 'https://pokeapi.co/api/v2/pokemon/';
// ******************************************************************************************


// ******************************************************************************************
// FUNCIONES GENERALES DE COMUNICACIÓN CON LA API:
// PARA OBTENCIÓN DE DATOS
// ******************************************************************************************

// Función para devolver datos de cualquier pokemon
export async function get_Pokemon(nombre_pokemon, signal = null) {
    
    // Se eliminan espacios en blanco, y se pasa a minúscula para garantizar
    // calidad en la resolución de datos buscados
    const pokemon = String(nombre_pokemon).trim().toLowerCase();
    // Se realiza petición asincrónica a la PokeAPI
    const res = await fetch(`${poke_api}${pokemon}`, { signal });
    // Lanza error si el pokemón buscado no existe
    if (!res.ok) throw new Error('El pokemón no existe: ' + pokemon);
    // Recibe datos del pokemon en formato JSON
    const datos = await res.json();

    // Toma solo los primeros 4 movimientos del pokemón
    const movimientos_base = datos.moves.slice(0, 4);

    // Solicita detalles reales de los movimientos en paralelo
    const promesas_movimientos = movimientos_base.map(async (m) => {
        
        // Hace una petición a la API usando la URL del movimiento,
        // cada move trae su propia URL)
        const res_move = await fetch(m.move.url, { signal });
        
        // Si la respuesta no es válida, lanza error
        // Esto hace que este movimiento falle, pero no todos (allSettled)
        if (!res_move.ok) {
            throw new Error('No se pudo cargar el movimiento: ' + m.move.name);
        }
        
        // Convierte la respuesta en JSON 
        const datos_move = await res_move.json();
        // Retorna los datos requeridos del movimiento
        return {
           
            name: datos_move.name,          // Nombre del movimiento 
            power: datos_move.power,        // Poder del ataque
            accuracy: datos_move.accuracy,  //Precisión del movimiento 
            pp: datos_move.pp,              // Cantidad de usos del movimiento
            type: datos_move.type ? datos_move.type.name : null, // Tipo del movimiento
            damage_class: datos_move.damage_class ? datos_move.damage_class.name : null // Tipo de daño 
        };
    });

    // Espera todos los movimientos, aunque alguno falle
    const resultados_movimientos = await Promise.allSettled(promesas_movimientos);

    // Se conservan solo los movimientos que sí cargaron correctamente
    const movimientos_detallados = resultados_movimientos
        .filter(resultado => resultado.status === 'fulfilled')
        .map(resultado => resultado.value);

    // Retorna conjunto de datos
    return {
        // Datos básicos pokemón
        name: datos.name,
        // Imagen frontal pokemon
        spriteFront: datos.sprites.front_default,
        // Imagen de espalda Pokemón
        spriteBack: datos.sprites.back_default,
        // Tipo de pokemón
        types: datos.types.map(t => t.type.name),
        // Estadísticas
        stats: {
            hp: datos.stats.find(s => s.stat.name === 'hp').base_stat,
            attack: datos.stats.find(s => s.stat.name === 'attack').base_stat,
            defense: datos.stats.find(s => s.stat.name === 'defense').base_stat,
            speed: datos.stats.find(s => s.stat.name === 'speed').base_stat,
        },
        // Datos detallados de movimientos
        moves: movimientos_detallados
    };
    
}
// ******************************************************************************************