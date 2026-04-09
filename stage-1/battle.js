/* // *****************************************************************************************
 * Institución: INSTITUTO TECNOLOGICO DE COSTA RICA (TEC)
 * DESARROLLO DE APLICACIONES
 * Curso: PROGRAMACION WEB I GR 1 T I 2026
 * Proyecto No. 2:  My Pokemon Battle
 * Tema: Programación de Javascript, HTML,CSS
 * Peticiones a API's.
 * Archivo: (JAVASCRIPT)/JS (BATTLE.JS)
 * Profesor: Jose Pablo Garzo
 * Autor: Edgardo Mora M.
 * Fecha: 12-04-2026
 * // *****************************************************************************************/ 

// ********************************************************************************************
// OBJETOS DE USO GLOBAL
// ********************************************************************************************
let attackTimeout = null;
let cooldownAnimationId = null;
let controlDatosBatalla = null;
const colapsableStage2 = document.getElementById('bloque_stage_2');             // Bloque colapsable Stage 2 (batalla)
const colapsableLog = document.getElementById('bloque_log');                    // Bloque colapsable Log de eventos juego  
const playerHPstatus = document.getElementById("hp_pokemon_status");            // Barra de estado de pokemón favorito
const enemyHPStatus = document.getElementById("hp_enemy_status");               // Barra de estado de pokemón enemigo
const arenaCuadricula = document.getElementById("arena_grid");                  // Cuadrícula de 3 x 3 para batalla
const battleArena   = document.getElementById("battle_arena");                  // Contenedor de Arena de batalla
const cuadriculaCelda = document.querySelectorAll(".celda");                    // Celda general de cuadrícula
const logEventosJuego = document.getElementById("log_eventos");                 // Contenedor de eventos de batalla
const logResultados = document.getElementById("log_resultados");                // Contenedor de resultados de batalla
const botonAtaqueSimple = document.getElementById("btn_ataque_simple");         // Botón de ataque simple
const botonAtaqueDefinitivo = document.getElementById("btn_ataque_definitivo"); // Botón de ataque definitivo
const barraCooldown = document.querySelector(".barra_cooldown");                // Barra de cool down 
let arenaEscenario = 1;                                                       // Arena por defecto

// Objetos para manipulación individual de celdas de la cuadrícula (grid)

// CELDAS: PLAYER
const playerCells = [
    document.getElementById("player_cell_1"),
    document.getElementById("player_cell_2"),
    document.getElementById("player_cell_3")
];

// CELDAS: ENEMIGO
const enemyCells = [
    document.getElementById("enemy_cell_1"),
    document.getElementById("enemy_cell_2"),
    document.getElementById("enemy_cell_3")
];

// ********************************************************************************************
// FUNCIONES PRINCIPALES: DE CARGA DE DATOS: CARGAR_DATOS_BATALLA()  Y DE INICIO
// DE BATALLA: INICIAR_BATALLA()
// ********************************************************************************************

// Función para dar inicio a batalla, en Stage 2
export function iniciar_Batalla(){
    
    // Limpia batalla anterior
    limpiar_Batalla_Anterior();
    // Carga datos de objeto de estado para batalla
    // (Pokemón favorito y Pokemón enemigo)
    const batalla = cargar_Datos_Batalla("estado_Pokemones");

    // Si los datos de batalla no son válidos, se aborta función
    if (!batalla){
        console.log("No hay datos");
        return;
    }

    // Si los datos de batalla son válidos
    // Se reinicia estado visual y de control del cooldown al empezar batalla
    controlDatosBatalla.attackOnCooldown = false;
    barraCooldown.style.width = "100%";
    botonAtaqueDefinitivo.disabled = false;
    
    // Genera número aleatorio entre 1 y 3, pero evitando repetir
    // // la misma arena inmediata anterior
    let nuevaArena;
    do {
        nuevaArena = Math.floor(Math.random() * 3) + 1;
    } while (nuevaArena === arenaEscenario);
    
    // Se asigna nueva arena ya validada
    arenaEscenario = nuevaArena;
   
    // Dibuja componentes de batalla y estado de objetos con los datos actuales
    render_Battle(batalla);
    // Agrega manejadores de eventos para uso de flechas de teclado, antes se 
    // garantiza eliminar escuchadores de eventos de batallas anteriores
    document.removeEventListener("keydown", manejarMovimiento);
    document.addEventListener("keydown", manejarMovimiento);
    // Programa siguiente ataque de oponente, y ciclo general de la batalla.
    scheduleNextAttack();
    
}

// Función de carga de información en objetos y estado, guardados en el local storage
// Se lee valores y asigna a objetos y variables, que garanticen la batalla
function cargar_Datos_Batalla(llave){

    // Lee datos en el localstorage 
    const datos = localStorage.getItem(llave);
    
    // Si los datos no son válidos de aborta función de carga
    if (!datos) return null;

    // Si los datos son válidos, se parsea el JSON, y asignan sus valores a los 
    // objetos/variables
    const estado = JSON.parse(datos);
    
    // Si no existen datos para los pokemones (player y enemigo), se aborta función
    // de carga
    if (!estado.player || !estado.enemy) return null;

    // Si los datos son válidos 
    controlDatosBatalla = {
        // Se obtienen datos básicos guardados en los objetos
        player: estado.player,
        enemy: estado.enemy,
        trainer: estado.trainer,

        // Se calculan puntos de vida reales para los pokemones 
        playerHP: Math.floor(estado.player.stats.hp * 2.5),
        enemyHP: Math.floor(estado.enemy.stats.hp * 2.5),

        // Se asigna una posición central inicial, para los pokemones 
        // dentro de la cuadrícula
        playerPosition: 2,
        enemyPosition: 2,

        // Estado inicial, de ataques y estado de ataques
        incomingAttack: null,
        locked: false,
        definitiveUsed: false,
        attackOnCooldown: false,

        // estado inicial de batalla
        phase: "fighting",
        // log de eventos de batalla inicial (vacío)
        log: []
    };

    // Se retorna objeto de control de batalla, con valores iniciados
    // básicos para iniciar batalla, sobre este se actualizará en tiempo real
    // cambios en el estado y variables del objeto con forme se desarrolla la
    // batalla
    return controlDatosBatalla;
}
// ********************************************************************************************
// ********************************************************************************************


// ********************************************************************************************
// FUNCIONES DE ACTUALIZACIÓN (RENDER) DE LA INTERFAZ DE LA PÁGINA, COMPONENTES
// Y ESTADOS VISUALES DE LA BATALLA
// ********************************************************************************************

// Función para dibujar estado actual de batalla, actualiza vida, ataques, y la parte 
// visual de los componentes involucrados.
function render_Battle(state){
    
    // Se expanden bloques colapsados por defecto, cuando la batalla es válida
    colapsableStage2.open = true;
    colapsableLog.open = true;
    
    // HP status Pokemón favorito
    playerHPstatus.style.display = "flex";   // Objeto invisible hasta que se activa la batalla
    playerHPstatus.textContent = "Player HP: " + state.playerHP;
    // HP status pokemón enemigo
    enemyHPStatus.style.display = "flex";   // Objeto invisible hasta que se activa la batalla
    enemyHPStatus.textContent = "Enemy HP: " + state.enemyHP;
    
    // Imagen de fondo para arena
    arenaCuadricula.style.display = "grid";
    // arena_grid transparente
    arenaCuadricula.style.backgroundColor = "transparent";
    
    // TODAS las celdas transparentes para visualización de imagen de fondo de
    //  arena de batalla
    cuadriculaCelda.forEach(celda => {
        celda.style.backgroundColor = "transparent";
    });
    
    //battleArena.style.backgroundImage = "url('./stage-1/img/Arena_1.png')"; por defecto
    // Imagen de fondo de arena aleatorio  (el aleatorio se genera en inicio de batalla)
    battleArena.style.backgroundImage = "url('./stage-1/img/Arena_" + arenaEscenario + ".png')";
    
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
    
    // Dibujar enemigo en celda fija, ya que el oponente no se mueve
    const imagenEnemy = document.createElement("img");
    imagenEnemy.src = state.enemy.spriteFront;
    imagenEnemy.alt = state.enemy.name;
    enemyCells[state.enemyPosition - 1].appendChild(imagenEnemy);
    
    // Alerta sobre celda de pokemon favorito que va a ser atacada por el oponente
    if (state.incomingAttack !== null) {
        const alertarCelda = playerCells[state.incomingAttack - 1];
        alertarCelda.style.backgroundColor = "red";
    }
    
    // Se deshabilita visualmente el ataque definitivo si ya fue utilizado
    botonAtaqueDefinitivo.disabled = state.definitiveUsed;
    
    // Si la fase de batalla terminó
    if (state.phase === "ended"){
        
        // Si el jugador llegó a 0, en puntos de vida
        if (state.playerHP === 0) {
            // Mostrar en log resultados que perdió, mensaje para las derrotas
            // según el trainer card
             logResultados.innerHTML = `<p>${state.trainer.loseMessage}</p>`;
            
        }
        
        // Si el pokemón enemigo fue el que llegó a 0
        if (state.enemyHP === 0) {
            // Mostrar en log resultados, mensaje de victoria, según el trainer
            // card
            logResultados.innerHTML = `<p>${state.trainer.winMessage}</p>`;
        }
        
    }
    
    // actualiza el log de eventos de batalla en el DOM, de acuerdo a los estados
    // guardado en variable state.log de la batalla, que guarda cuando el enemigo
    // o el player son atacados
    logEventosJuego.innerHTML = state.log.map(evento => `<p>${evento}</p>`).join("");
}


// ********************************************************************************************
// FUNCIONES AUXILIARES PROPUESTAS Y BRINDADAS EN ENUNCIADO PARA RESOLUCION DE
// PROBLEMAS DE LA BATALLA
// ********************************************************************************************

// Calcula un tiempo aleatorio entre 3 y 10 segundos.
// Programa la ejecución de un ataque enemigo después de ese tiempo.
// Cuando llega ese moment, ejecuta el ataque enemigo completo (resolveEnemyAttack)
// Espera a que termine (incluye warning de 600 ms)
// Verifica si la batalla sigue activa.
// Si sigue en "fighting", se vuelve a llamar a sí misma, y crea un ataque recursivo.
// Se generó tal cual lo propone el enunciado.
function scheduleNextAttack() {

    // Genera un tiempo aleatorio entre 3 y 10 segundos (en milisegundos)
    const delay = (3 + Math.random() * 7) * 1000;

    // Programa que algo pase después de "delay" ms
    // setTimeout NO bloquea, solo agenda la ejecución
    attackTimeout = setTimeout(async () => {

        // Ejecuta el ataque enemigo (warning + resolución)
        // "await" espera a que esa función termine (porque es async)
        await resolveEnemyAttack();
        // Si la batalla sigue activa
        if (controlDatosBatalla && controlDatosBatalla.phase === 'fighting') {
            // e vuelve a programar otro ataque creando "loop" necesario
            // para el enemigo
            scheduleNextAttack();
        }

    }, delay); // tiempo de espera antes de ejecutar todo lo de arriba
}

// Función para resolver el ataque del pokemón enemigo.
// Selecciona una celda objetivo aleatoria, muestra advertencia visual
// antes de que el ataque rebaje puntos, esperando que el jugador se 
// mueva, y luego evalúa si el ataque impacta o es esquivado. 
// Aplica daño si corresponde, registra el evento en el log, actualiza 
// el estado de la batalla y refresca la interfaz gráfica.
async function resolveEnemyAttack() {

    // Se selecciona celda objetivo aleatoria (1, 2 o 3)
    const targetCell = Math.floor(Math.random() * 3) + 1;
    // Se asigna celda de ataque entrante (warning visual)
    controlDatosBatalla.incomingAttack = targetCell;
    // Se asegura que el jugador aún puede moverse (fase de reacción)
    controlDatosBatalla.locked = false;
    // Se actualiza interfaz para mostrar warning en la celda
    render_Battle(controlDatosBatalla);

    // Se espera ventana de reacción (600 ms)
    await wait(600);
    // Se bloquea movimiento del jugador (ya no puede esquivar)
    controlDatosBatalla.locked = true;
    // Se actualiza interfaz para reflejar bloqueo
    render_Battle(controlDatosBatalla);
    // Se evalúa si el jugador está en la celda atacada
    if (controlDatosBatalla.playerPosition === targetCell) {

        // Se calcula daño enemigo y se resta al HP del jugador
        const damage = calcEnemyDamage(controlDatosBatalla.enemy);
        // Se evita que el ataque enemigo, reste puntos por debajo de 0
        if ((controlDatosBatalla.playerHP - damage) > 0)
        {
            // si el nivel actual de puntos de vida, menos el ataque actual,
            // sigue siendo mayor a 0 se acepta ataque enemigo
            controlDatosBatalla.playerHP -= damage; 
        }
        
        // Si los puntos de vida actuales, menos el ataque enemigo, son 
        // inferiores a 0, no se puede aceptar ataque en negativo, automáticamente
        // significa que el jugar perdió y vida llegó a 0.
        else 
        {
            // Se actualiza punto de vida de jugador
            controlDatosBatalla.playerHP = 0;
        }
        // Se registra evento en log
        controlDatosBatalla.log.push("Hit! Recibiste daño de: " + damage);
         
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

// Función auxiliar para pausar ejecución asincrónica durante una cantidad
// determinada de milisegundos. Se utiliza para crear una ventana de espera
// o reacción entre eventos de batalla.
function wait(ms){
    
    // Se retorna una promesa que se resolverá automáticamente luego del tiempo
    // indicado en milisegundos
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para calcular el daño que causará el pokemón enemigo sobre el
// pokemón favorito. El daño se basa en el stat de ataque del enemigo,
// multiplicado por un factor fijo, más una variación aleatoria adicional.
function calcEnemyDamage(enemy){
    
    // Se obtiene el stat de ataque del pokemón enemigo
    const opponentAttackStat = enemy.stats.attack;
    // Se calcula daño final: parte proporcional al ataque base del enemigo
    // más un valor aleatorio entre 0 y 19
    const damage = Math.floor(opponentAttackStat * 0.4) + Math.floor(Math.random() * 20);
    // Se retorna el daño calculado
    return damage;
    
}

// Función para verificar si la batalla ha terminado.
// La batalla finaliza cuando alguno de los pokemones llega a 0 HP.
// Además, se detienen procesos activos como ataques automáticos y animaciones.
function checkBattleEnd(){
    
    // Si no existe estado de batalla, se aborta función
    if (!controlDatosBatalla) return;
    
    // Si alguno de los pokemones llegó a 0 HP
    if (controlDatosBatalla.enemyHP === 0 || controlDatosBatalla.playerHP === 0 )
    {
        // Se cambia la fase de la batalla a finalizada
        controlDatosBatalla.phase = "ended";
    
        // Si existe un ataque programado pendiente, se cancela
        if (attackTimeout) {
            clearTimeout(attackTimeout);
            attackTimeout = null;
        }

        // Si existe animación de cooldown en ejecución, se detiene
        if (cooldownAnimationId) {
            cancelAnimationFrame(cooldownAnimationId);
            cooldownAnimationId = null;
        }

        // Se elimina control de movimiento del jugador mediante teclado
        // para evitar que se realicen acciones posteriores al fin de la
        //  batalla
        document.removeEventListener("keydown", manejarMovimiento);
    }
    
}

// ******************************************************************************************
// FUNCIONES DE MANEJO DE EVENTOS Y COMPORTAMIENTO DE OBJETOS (EVENTLISTENERS())
// ****************************************************************************************** 

// Función para iniciar y controlar el cooldown del ataque simple.
// Reduce visualmente la barra de cooldown y bloquea el botón mientras
// el ataque se encuentra en tiempo de espera.
// Se mantiene función tal cual como la brinda el enunciado.
function startCooldown(durationMs, barElement){
    
    // Se obtiene tiempo inicial de referencia
    const start = performance.now();
    // Se marca estado de cooldown activo
    controlDatosBatalla.attackOnCooldown = true;
    // Se deshabilita botón de ataque simple durante cooldown
    botonAtaqueSimple.disabled = true;
    // Función interna que se ejecuta en cada frame de animación
    function tick(now){
        
        // Si la batalla no es válida o ya terminó, se reinicia estado
        if (!controlDatosBatalla || controlDatosBatalla.phase !== "fighting"){
            controlDatosBatalla.attackOnCooldown = false;
            barElement.style.width = "100%";
            botonAtaqueSimple.disabled = false;
            cooldownAnimationId = null;
            return;
        }
        
        // Tiempo transcurrido desde inicio
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        // Se reduce el ancho de la barra de cooldown en función del progreso
        barElement.style.width = `${(1 - progress) * 100}%`;

        // Si el cooldown no ha terminado, continúa animación
        if (progress < 1){
            cooldownAnimationId = requestAnimationFrame(tick);
        }
        else{
            // Si el cooldown terminó, se restablece estado
            controlDatosBatalla.attackOnCooldown = false;
            barElement.style.width = "100%";
            botonAtaqueSimple.disabled = false;
            cooldownAnimationId = null;
        }
    }

    // Se inicia animación del cooldown
    cooldownAnimationId = requestAnimationFrame(tick);
}

// Método para manejar las acciones o comportamiento click  de botón
//  de ataque simple
botonAtaqueSimple.addEventListener('click', () => {
    
    // Si el objeto no es váldo, se aborta función
    if (!controlDatosBatalla) return;
    // Si la fase difiere de batalla, se aborta función
    if (controlDatosBatalla.phase !== "fighting") return;
    // si la variable de estado cooldowan del objeto de batalla,
    // es true , no se puede atacar se aborta función, para evitar
    // hacer daño
    if (controlDatosBatalla.attackOnCooldown) return;

    // Se calcula daño del jugador usando su stat de ataque, el enunciado
    // plantea que este es siempre igual
    const damage = Math.floor(controlDatosBatalla.player.stats.attack * 0.4) + Math.floor(Math.random() * 20);
    
    // Siempre que los puntos de vida actuales del enemigo, menos el ataque actual, sean
    // superiores a 0, el ataque es válido sin acabar con el juego.
    if ((controlDatosBatalla.enemyHP - damage) > 0)
    {
        // Se resta ataque a los puntos de vida(HP) del enemigo
        controlDatosBatalla.enemyHP -= damage;
    }
    
    // Si los puntos de vida del enemigo,menos el ataque, restan por debajo de 0
    // entonces fin de juego, y se actuliza el objeto de estado, para el oponente
    else
    {
        controlDatosBatalla.enemyHP = 0;
    }
    
    // Se registra evento en log
    controlDatosBatalla.log.push("Atacaste al enemigo y causaste: " + damage);
    
    // Se activa cooldown del ataque simple (2 a 4 segundos)
    const cooldownMs = (2 + Math.random() * 2) * 1000;
    // Se inicia animación de cooldown y bloqueo de ataque
    startCooldown(cooldownMs, barraCooldown);
    // Se verifica fin de batalla
    checkBattleEnd();
    // Se actualiza interfaz
    render_Battle(controlDatosBatalla);
    
});

// Método para manejar las acciones o comportamiento click  de botón
//  de ataque definitivo
botonAtaqueDefinitivo.addEventListener('click', () => {
    
    // Se valida que objeto tenga datos válidos, si no se aborta función
    if (!controlDatosBatalla) return;
    // Se valida que la fase sea de batalla, o se aborta función
    if (controlDatosBatalla.phase !== "fighting") return;
    // Si se usó previamente ataque definitivo, y tiene un estado true,
    //se aborta función
    if (controlDatosBatalla.definitiveUsed) return;

    // Se marca uso único del ataque definitivo y actualiza estado
    controlDatosBatalla.definitiveUsed = true;
    // Se elimina todo el HP del enemigo
    controlDatosBatalla.enemyHP = 0;
    // Se registra evento en log indicando uso del ataque definitivo
    controlDatosBatalla.log.push(controlDatosBatalla.trainer.definitiveMoveName);
    // Se verifica fin de batalla
    checkBattleEnd();
    // Se actualiza interfaz de página
    render_Battle(controlDatosBatalla);
});

// Función para control de movimiento del pokemón favorito, este puede moverse 
// únicamente dentro del rango de movimiento de derecha a izquierda y viceversa
//  en una cuadrícula de (1 x 3)
function manejarMovimiento(event){
    
    // Si los datos de objeto no son válidos, se aborta función
    if (!controlDatosBatalla) return;
    // Si existe un bloque se aborta función, para no permitir un movimiento indebido.
    if (controlDatosBatalla.locked) return;
    // Si el objeto, está habilitado y la fase no está iniciada de batalla, se aborta función
    if (controlDatosBatalla.phase !== "fighting") return;

    // Si el objeto está habilitado y en modo batalla, se permite movimiento
    
    //DESPLAZAMIENTO IZQUIERDO, siempre mayor a 1, para no salirse del rango
    // de la cuadrícula
    if (event.key === "ArrowLeft" && controlDatosBatalla.playerPosition > 1){
        controlDatosBatalla.playerPosition--;
    }

    //DESPLAZAMIENTO DERECHO, siempre mayor a 1, para no salirse del rango
    // de la cuadrícula
    if (event.key === "ArrowRight" && controlDatosBatalla.playerPosition < 3){
        controlDatosBatalla.playerPosition++;
    }

    // Se llama función para actualizar interfaz gráfica de página, con ello batalla
    // con lo real sucediendo.
    render_Battle(controlDatosBatalla);
}
// ****************************************************************************************** 
// ****************************************************************************************** 

// Función para limpiar completamente el estado de una batalla anterior.
// Se utiliza antes de iniciar una nueva batalla para evitar estados residuales.
export function limpiar_Batalla_Anterior(){
    
    // Si existe timeout previo, se limpia
    if (attackTimeout) {
        // se llama a función clearTimeout
        clearTimeout(attackTimeout);
        attackTimeout = null;
    }

    // Si existe animación previa de cooldown, se limpia
    if (cooldownAnimationId) {
        cancelAnimationFrame(cooldownAnimationId);
        cooldownAnimationId = null;
    }

    // Se elimina listener de movimiento previo
    document.removeEventListener("keydown", manejarMovimiento);
    // Se limpia estado de batalla
    controlDatosBatalla = null;
    // Se limpian textos de logs
    logEventosJuego.innerHTML = "";
    logResultados.innerHTML = "";
    // Se ocultan estados de HP
    playerHPstatus.style.display = "none";
    enemyHPStatus.style.display = "none";
    playerHPstatus.textContent = "";
    enemyHPStatus.textContent = "";
    // Se limpia cuadrícula visual
    cuadriculaCelda.forEach(celda => {
        celda.style.backgroundColor = "transparent";
        celda.innerHTML = "";
    });

    // Se oculta arena (se elimina imagen de fondo previa)
    battleArena.style.backgroundImage = "";
    // Se oculta grid de batalla
    arenaCuadricula.style.display = "none";
    // Se reinicia cooldown visual
    barraCooldown.style.width = "100%";
    // Se rehabilita botón definitivo para nueva batalla
    botonAtaqueDefinitivo.disabled = false;

}

