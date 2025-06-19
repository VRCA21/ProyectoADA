// Mantén los eventos iniciales igual
let eventos = [
  { id: 1, nombre: "Evento A", inicio: 1, fin: 3, ganancia: 50 },
  { id: 2, nombre: "Evento B", inicio: 3, fin: 5, ganancia: 20 },
  { id: 3, nombre: "Evento C", inicio: 2, fin: 6, ganancia: 100 },
  { id: 4, nombre: "Evento D", inicio: 5, fin: 7, ganancia: 200 },
  { id: 5, nombre: "Evento E", inicio: 8, fin: 9, ganancia: 30 },
];

function inicializar() {
  generarFormularios();
  dibujarEventosFijos(eventos);
  document.getElementById("actualizarEventos").onclick = actualizarEventosDesdeFormulario;
  document.getElementById("agregarEvento").onclick = agregarEvento;
  document.getElementById("botonAnimar").onclick = () => animarSeleccionEventos(eventos);
}

function generarFormularios() {
  const contenedor = document.getElementById("formulariosEventos");
  contenedor.innerHTML = "";
  eventos.forEach((evento, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>Nombre:<br><input value="${evento.nombre}" id="nombre${index}" /></label><br>
      <label>Inicio:<br><input type="number" min="1" max="24" value="${evento.inicio}" id="inicio${index}" /></label><br>
      <label>Fin:<br><input type="number" min="1" max="24" value="${evento.fin}" id="fin${index}" /></label><br>
      <label>Ganancia:<br><input type="number" min="1" value="${evento.ganancia}" id="ganancia${index}" /></label><br>
      <button class="eliminarEvento" data-index="${index}">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });

  // Agregar evento a botones eliminar
  document.querySelectorAll(".eliminarEvento").forEach(btn => {
    btn.onclick = (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      eventos.splice(idx, 1);
      generarFormularios();
      actualizarEventosDesdeFormulario(); // refresca graficas
    };
  });
}

function actualizarEventosDesdeFormulario() {
  const nuevosEventos = [];

  for (let index = 0; index < eventos.length; index++) {
    const nombre = document.getElementById(`nombre${index}`).value;
    const inicio = parseInt(document.getElementById(`inicio${index}`).value);
    const fin = parseInt(document.getElementById(`fin${index}`).value);
    const ganancia = parseInt(document.getElementById(`ganancia${index}`).value);

    if (
      isNaN(inicio) || isNaN(fin) ||
      inicio < 1 || fin > 24 ||
      inicio >= fin
    ) {
      alert(`Error en evento "${nombre}": el horario debe estar entre 1 y 24, y el inicio debe ser menor que el fin.`);
      return;
    }

    nuevosEventos.push({ id: index + 1, nombre, inicio, fin, ganancia });
  }

  eventos = nuevosEventos;
  dibujarEventosFijos(eventos);
}

function agregarEvento() {
  eventos.push({
    id: eventos.length + 1,
    nombre: `Evento ${eventos.length + 1}`,
    inicio: 1,
    fin: 2,
    ganancia: 0,
  });
  generarFormularios();
}


// Función para dibujar eje X en svg
function dibujarEjeX(svg, maxTime) {
  const height = svg.getAttribute("height");
  const width = svg.getAttribute("width");
  const ejeY = height - 30;

  // Línea eje
  const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
  linea.setAttribute("x1", 0);
  linea.setAttribute("y1", ejeY);
  linea.setAttribute("x2", width);
  linea.setAttribute("y2", ejeY);
  linea.setAttribute("class", "eje-x");
  svg.appendChild(linea);

  // Marcas y texto eje
  for (let i = 0; i <= maxTime; i++) {
    const x = i * 80;

    // Marca
    const marca = document.createElementNS("http://www.w3.org/2000/svg", "line");
    marca.setAttribute("x1", x);
    marca.setAttribute("y1", ejeY);
    marca.setAttribute("x2", x);
    marca.setAttribute("y2", ejeY + 6);
    marca.setAttribute("stroke", "black");
    marca.setAttribute("stroke-width", "1");
    svg.appendChild(marca);

    // Texto
    const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texto.setAttribute("x", x);
    texto.setAttribute("y", ejeY + 20);
    texto.setAttribute("class", "eje-texto");
    texto.textContent = i;
    svg.appendChild(texto);
  }
}

function dibujarEventosFijos(eventos) {
  const svg = document.getElementById("svgFija");
  svg.innerHTML = "";

  // Calcular máximo tiempo para el eje
  const maxTime = Math.max(24,...eventos.map(e => e.fin));

  eventos.forEach((evento, i) => {
    const x = evento.inicio * 80;
    const y = i * 35;
    const width = (evento.fin - evento.inicio) * 80;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", 30);
    rect.setAttribute("fill", "#7fa7ff");

    svg.appendChild(rect);

    // Nombre y ganancia fuera del bloque
    const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texto.setAttribute("x", x + width + 5);
    texto.setAttribute("y", y + 20);
    texto.textContent = `${evento.nombre} ($${evento.ganancia})`;
    svg.appendChild(texto);
  });

  dibujarEjeX(svg, maxTime);
}

function dibujarEventosAnimados(eventos) {
  const svg = document.getElementById("svgAnimada");
  svg.innerHTML = "";

  // Asegurar que el eje llegue a 24 como mínimo
  const maxTime = Math.max(24, ...eventos.map(e => e.fin));

  // Ordenamos por ganancia descendente (sin modificar el arreglo original)
  const eventosOrdenados = [...eventos].sort((a, b) => b.ganancia - a.ganancia);

  eventosOrdenados.forEach((evento, i) => {
    const x = evento.inicio * 80;
    const y = i * 35;
    const width = (evento.fin - evento.inicio) * 80;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", 30);
    rect.setAttribute("id", `bloque-${eventos.indexOf(evento)}`); // Usa índice original
    rect.setAttribute("class", "normal");
    svg.appendChild(rect);

    const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texto.setAttribute("x", x + width + 5);
    texto.setAttribute("y", y + 20);
    texto.textContent = `${evento.nombre} ($${evento.ganancia})`;
    svg.appendChild(texto);
  });

  dibujarEjeX(svg, maxTime);
}



async function animarEventos(eventosOrdenados) {
  const n = eventosOrdenados.length;

  for (let i = 0; i < n; i++) {
    resetearColores();
    marcarBloqueVerdeFijo(i, eventosOrdenados);
    marcarCompatibilidad(i, eventosOrdenados);
    marcarBloquesAnterioresGris(i, eventosOrdenados);
    await delay(1500);
  }
}


function resetearColores() {
  eventos.forEach((_, idx) => {
    const bloque = document.getElementById(`bloque-${idx}`);
    if (bloque) {
      bloque.classList.remove("verde-fijo", "verde", "rojo", "gris");
      bloque.classList.add("normal");
    }
  });
}

function marcarBloqueVerdeFijo(idxFijo, eventosOrdenados) {
  const originalIdx = eventos.indexOf(eventosOrdenados[idxFijo]);
  const bloque = document.getElementById(`bloque-${originalIdx}`);
  if (bloque) {
    bloque.classList.remove("normal");
    bloque.classList.add("verde-fijo");
  }
}

function marcarCompatibilidad(idxFijo, eventosOrdenados) {
  const eventoFijo = eventosOrdenados[idxFijo];

  eventosOrdenados.forEach((evento, idx) => {
    const originalIdx = eventos.indexOf(evento);
    const bloque = document.getElementById(`bloque-${originalIdx}`);
    if (!bloque || idx <= idxFijo) return;

    if (evento.inicio >= eventoFijo.fin) {
      bloque.classList.remove("normal", "rojo", "gris");
      bloque.classList.add("verde");
    } else {
      bloque.classList.remove("normal", "verde", "gris");
      bloque.classList.add("rojo");
    }
  });
}

function marcarBloquesAnterioresGris(idxFijo, eventosOrdenados) {
  for (let i = 0; i < idxFijo; i++) {
    const originalIdx = eventos.indexOf(eventosOrdenados[i]);
    const bloque = document.getElementById(`bloque-${originalIdx}`);
    if (bloque) {
      bloque.classList.remove("normal", "verde", "rojo", "verde-fijo");
      bloque.classList.add("gris");
    }
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calcularEventosSeleccionados(eventos) {
  // Ordenar eventos por fin (si no lo están ya)
  const ordenados = eventos.slice().sort((a,b) => a.fin - b.fin);

  // Calcular p[i]: índice del evento compatible más cercano que termina antes del inicio de evento i
  const p = [];
  for (let i = 0; i < ordenados.length; i++) {
    let j = i - 1;
    while (j >= 0 && ordenados[j].fin > ordenados[i].inicio) j--;
    p[i] = j;
  }

  // Programación dinámica para max ganancia
  const M = [0];
  for (let i = 0; i < ordenados.length; i++) {
    const incluir = ordenados[i].ganancia + (p[i] >= 0 ? M[p[i] + 1] : 0);
    const excluir = M[i];
    M[i+1] = Math.max(incluir, excluir);
  }

  // Reconstruir solución óptima
  const seleccionados = [];
  let i = ordenados.length -1;
  while(i >= 0) {
    if (ordenados[i].ganancia + (p[i] >= 0 ? M[p[i] +1] : 0) >= M[i]) {
      seleccionados.unshift(ordenados[i]);
      i = p[i];
    } else {
      i--;
    }
  }

  return { seleccionados, gananciaTotal: M[M.length-1] };
}

function mostrarResumen(resumenData) {
  // Quitar resumen anterior si existe
  const resumenPrevio = document.getElementById("resumenFinal");
  if (resumenPrevio) resumenPrevio.remove();

  const contenedor = document.createElement("div");
  contenedor.id = "resumenFinal";

  contenedor.innerHTML = `<h3>Eventos Seleccionados:</h3>
    <ul>
      ${resumenData.seleccionados.map(e => `<li>${e.nombre} (${e.inicio}-${e.fin}), Ganancia: ${e.ganancia}</li>`).join('')}
    </ul>
    <p><strong>Ganancia Total: ${resumenData.gananciaTotal}</strong></p>`;

  document.getElementById("graficaAnimada").appendChild(contenedor);

  // Opcional: pintar bloques seleccionados en verde fijo
  resumenData.seleccionados.forEach(ev => {
    const idx = eventos.findIndex(e => e.nombre === ev.nombre && e.inicio === ev.inicio && e.fin === ev.fin);
    if (idx >= 0) {
      const bloque = document.getElementById(`bloque-${idx}`);
      if (bloque) {
        bloque.classList.remove("normal", "rojo", "verde", "gris");
        bloque.classList.add("verde-fijo");
      }
    }
  });
}

async function iniciarAnimacionYResumen() {
  if (eventos.length === 0) return;

  const eventosOrdenados = [...eventos].sort((a, b) => b.ganancia - a.ganancia);
  await animarEventos(eventosOrdenados); // Animación en orden por ganancia
  const resumen = calcularEventosSeleccionados(eventos); // Usamos el orden original para DP
  mostrarResumen(resumen);
}


document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("botonAnimar").addEventListener("click", () => {
    iniciarAnimacionYResumen(); // Esta es la función que debe manejar la animación
  });

  document.getElementById("agregarEvento").addEventListener("click", agregarEvento);
  document.getElementById("actualizarEventos").addEventListener("click", actualizarEventosDesdeFormulario);
});


function inicializar() {
  generarFormularios();
  dibujarEventosFijos(eventos);
  dibujarEventosAnimados(eventos); // <-- Aquí también
  document.getElementById("actualizarEventos").onclick = actualizarEventosDesdeFormulario;
  //document.getElementById("agregarEvento").onclick = agregarEvento;
  document.getElementById("botonAnimar").onclick = () => animarSeleccionEventos(eventos);
}


window.onload = inicializar;
