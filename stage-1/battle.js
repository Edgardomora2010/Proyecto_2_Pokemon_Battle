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
let attackTimeout = null;
let controlDatosBatalla = null;
const colapsableStage2 = document.getElementById('bloque_stage_2');
const colapsableLog = document.getElementById('bloque_log');
const playerHPstatus = document.getElementById("hp_pokemon_status");
const enemyHPStatus = document.getElementById("hp_enemy_status");
const arenaCuadricula = document.getElementById("arena_grid");
const battleArena   = document.getElementById("battle_arena");
const cuadriculaCelda = document.querySelectorAll(".celda");
const logEventosJuego = document.getElementById("log_eventos");
const logResultados = document.getElementById("log_resultados");

// Objetos para manipulación individual de celdas de la cuadrícula (grid)
// CELDAS: PLAYER
const playerCells = [
    document.getElementById("player_cell_1"),
    document.getElementById("player_cell_2"),
    document.getElementById("player_cell_3")
];

// Objetos para manipulación individual de celdas de la cuadrícula (grid)
// CELDAS: ENEMIGO
const enemyCells = [
    document.getElementById("enemy_cell_1"),
    document.getElementById("enemy_cell_2"),
    document.getElementById("enemy_cell_3")
];


// ********************************************************************************************
// FUNCIONES PRINCIPALES
// ********************************************************************************************

export function iniciar_Batalla(){

    const batalla = cargar_Datos_Batalla("estado_Pokemones");

    if (!batalla){
        console.log("No hay datos");
        return;
    }

    render_Battle(batalla);
    document.addEventListener("keydown", manejarMovimiento);
    scheduleNextAttack();
    
}


function cargar_Datos_Batalla(llave){

    const datos = localStorage.getItem(llave);
    if (!datos) return null;

    const estado = JSON.parse(datos);
    if (!estado.player || !estado.enemy) return null;

    controlDatosBatalla = {
        player: estado.player,
        enemy: estado.enemy,
        trainer: estado.trainer,

        playerHP: Math.floor(estado.player.stats.hp * 2.5),
        enemyHP: Math.floor(estado.enemy.stats.hp * 2.5),

        playerPosition: 2,
        enemyPosition: 2,

        incomingAttack: null,
        locked: false,
        definitiveUsed: false,
        attackOnCooldown: false,

        phase: "fighting",
        log: []
    };

    return controlDatosBatalla;
}

function manejarMovimiento(event){
    
    if (!controlDatosBatalla) return;
    if (controlDatosBatalla.locked) return;
    if (controlDatosBatalla.phase !== "fighting") return;

    if (event.key === "ArrowLeft" && controlDatosBatalla.playerPosition > 1){
        controlDatosBatalla.playerPosition--;
    }

    if (event.key === "ArrowRight" && controlDatosBatalla.playerPosition < 3){
        controlDatosBatalla.playerPosition++;
    }

    render_Battle(controlDatosBatalla);
}

function render_Battle(state){
    
    // Se expanden bloques colapsados por defecto, cuando la batalla es válida
    colapsableStage2.open = true;
    colapsableLog.open = true;
    
    // HP status Pokemón favorito
    // Objeto invisible hasta que se activa la batalla
    playerHPstatus.style.display = "flex";
    playerHPstatus.textContent = "Player HP: " + state.playerHP;
    // HP status pokemón enemigo
    enemyHPStatus.style.display = "flex";
    enemyHPStatus.textContent = "Enemy HP: " + state.enemyHP;
    
    // Imagen de fondo para arena
    arenaCuadricula.style.display = "grid";
    // arena_grid transparente
    arenaCuadricula.style.backgroundColor = "transparent";
    
    // TODAS las celdas transparentes
    cuadriculaCelda.forEach(celda => {
        celda.style.backgroundColor = "transparent";
    });
    
    // Imagen de fondo de arena
    battleArena.style.backgroundImage = "url('./img/Arena_1.png')";
    
    // Limpia celdas enemigo
    enemyCells.forEach(celda => {
        celda.innerHTML = "";
    });
    
    // Limpiar celdas player
    playerCells.forEach(celda => {
        celda.innerHTML = "";
    });
    
    // Dibujar player según posición actual
    const imagenPlayer = document.createElement("img");
    imagenPlayer.src = state.player.spriteBack;
    imagenPlayer.alt = state.player.name;
    playerCells[state.playerPosition - 1].appendChild(imagenPlayer);
    
    // Dibujar enemigo en celda fija
    const imagenEnemy = document.createElement("img");
    imagenEnemy.src = state.enemy.spriteFront;
    imagenEnemy.alt = state.enemy.name;
    enemyCells[state.enemyPosition - 1].appendChild(imagenEnemy);
    
    // Alerta sobre celda de pokemon favorito que va a ser atacada por el oponente
    if (state.incomingAttack !== null) {
        const alertarCelda = playerCells[state.incomingAttack - 1];
        alertarCelda.style.backgroundColor = "red";
    }
    
    logEventosJuego.innerHTML = state.log.map(evento => `<p>${evento}</p>`).join("");


        
}

// Calcula un tiempo aleatorio entre 3 y 10 segundos.
// Programa la ejecución de un ataque enemigo después de ese tiempo.
// Cuando llega ese moment, ejecuta el ataque enemigo completo (resolveEnemyAttack)
// Espera a que termine (incluye warning de 600 ms)
// Verifica si la batalla sigue activa.
// Si sigue en "fighting", se vuelve a llamar a sí misma, y crea un ataque recursivo
function scheduleNextAttack() {

    // Genera un tiempo aleatorio entre 3 y 10 segundos (en milisegundos)
    const delay = (3 + Math.random() * 7) * 1000;

    // Programa que algo pase después de "delay" ms
    // setTimeout NO bloquea, solo agenda la ejecución
    attackTimeout = setTimeout(async () => {

        // Ejecuta el ataque enemigo (warning + resolución)
        // "await" espera a que esa función termine (porque es async)
        await resolveEnemyAttack();

        // Si la batalla sigue activa...
        if (controlDatosBatalla.phase === 'fighting') {

            // ...se vuelve a programar otro ataque
            // esto crea el "loop" enemigo
            scheduleNextAttack();
        }

    }, delay); // tiempo de espera antes de ejecutar todo lo de arriba
}

async function resolveEnemyAttack() {

    // Se selecciona celda objetivo aleatoria (1, 2 o 3)
    const targetCell = Math.floor(Math.random() * 3) + 1;

    // Se asigna celda de ataque entrante (warning visual)
    controlDatosBatalla.incomingAttack = targetCell;

    // Se asegura que el jugador aún puede moverse (fase de reacción)
    controlDatosBatalla.locked = false;

    // Se actualiza interfaz para mostrar warning en la celda
    render_Battle(controlDatosBatalla);

    // Se espera ventana de reacción (~600 ms)
    await wait(600);

    // Se bloquea movimiento del jugador (ya no puede esquivar)
    controlDatosBatalla.locked = true;

    // Se actualiza interfaz para reflejar bloqueo
    render_Battle(controlDatosBatalla);

    // Se evalúa si el jugador está en la celda atacada
    if (controlDatosBatalla.playerPosition === targetCell) {

        // Se calcula daño enemigo y se resta al HP del jugador
        const damage = calcEnemyDamage(controlDatosBatalla.enemy);
        if ((controlDatosBatalla.playerHP - damage) > 0)
        {
            controlDatosBatalla.playerHP -= damage; 
        }
        else 
        {
            controlDatosBatalla.playerHP = 0;
            logresultados.log.push(controlDatosBatalla.trainer.loseMessage);
            
        }
        
        // Se registra evento en log
        controlDatosBatalla.log.push("Hit! Recibiste daño.");
         

    } else {

        // Se registra esquive en log
        controlDatosBatalla.log.push("Dodged! Esquivaste el ataque.");
    }

    // Se limpia celda de ataque entrante
    controlDatosBatalla.incomingAttack = null;

    // Se desbloquea movimiento para siguiente ciclo
    controlDatosBatalla.locked = false;

    // Se revisa si la batalla terminó
    checkBattleEnd();

    // Se actualiza interfaz final del ataque
    render_Battle(controlDatosBatalla);
    
}
    
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calcEnemyDamage(enemy){
    
    const opponentAttackStat = enemy.stats.attack;
    const damage = Math.floor(opponentAttackStat * 0.4) + Math.floor(Math.random() * 20);
    return damage;
    
}

function checkBattleEnd(){
    
    //if (controlDatosBatalla.enemyHP <= 0){}
    
    
}

