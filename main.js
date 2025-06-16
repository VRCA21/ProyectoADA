// Mantén los eventos iniciales igual
let eventos = [
  { id: 1, nombre: "Clase A", inicio: 1, fin: 3, ganancia: 50 },
  { id: 2, nombre: "Clase B", inicio: 3, fin: 5, ganancia: 20 },
  { id: 3, nombre: "Clase C", inicio: 0, fin: 6, ganancia: 100 },
  { id: 4, nombre: "Clase D", inicio: 5, fin: 7, ganancia: 200 },
  { id: 5, nombre: "Clase E", inicio: 8, fin: 9, ganancia: 30 },
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
      <label>Inicio:<br><input type="number" min="0" value="${evento.inicio}" id="inicio${index}" /></label><br>
      <label>Fin:<br><input type="number" min="0" value="${evento.fin}" id="fin${index}" /></label><br>
      <label>Ganancia:<br><input type="number" min="0" value="${evento.ganancia}" id="ganancia${index}" /></label><br>
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
  eventos = eventos.map((_, index) => ({
    id: index + 1,
    nombre: document.getElementById(`nombre${index}`).value,
    inicio: parseInt(document.getElementById(`inicio${index}`).value),
    fin: parseInt(document.getElementById(`fin${index}`).value),
    ganancia: parseInt(document.getElementById(`ganancia${index}`).value),
  }));
  dibujarEventosFijos(eventos);
}

function agregarEvento() {
  eventos.push({
    id: eventos.length + 1,
    nombre: `Evento ${eventos.length + 1}`,
    inicio: 0,
    fin: 1,
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
  const maxTime = Math.max(...eventos.map(e => e.fin));

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

function animarSeleccionEventos(eventos) {
  const svg = document.getElementById("svgAnimada");
  svg.innerHTML = "";

  const sorted = [...eventos].sort((a, b) => a.fin - b.fin);
  const n = sorted.length;
  const dp = Array(n).fill(0);
  const prev = Array(n).fill(-1);

  for (let i = 0; i < n; i++) {
    for (let j = i - 1; j >= 0; j--) {
      if (sorted[j].fin <= sorted[i].inicio) {
        prev[i] = j;
        break;
      }
    }
  }

  // Calcular máximo tiempo para el eje
  const maxTime = Math.max(...sorted.map(e => e.fin));

  function mostrarPaso(i) {
    svg.innerHTML = "";
    let y = 0;
    for (let k = 0; k <= i; k++) {
      const evento = sorted[k];
      const x = evento.inicio * 80;
      const width = (evento.fin - evento.inicio) * 80;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", width);
      rect.setAttribute("height", 30);
      rect.setAttribute("fill", "#ffa07a");
      svg.appendChild(rect);

      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("x", x + width + 5);
      texto.setAttribute("y", y + 20);
      texto.textContent = `${evento.nombre} ($${evento.ganancia})`;
      svg.appendChild(texto);

      y += 35;
    }

    dibujarEjeX(svg, maxTime);
  }

  let i = 0;
  const interval = setInterval(() => {
    if (i >= n) {
      clearInterval(interval);
      return;
    }
    dp[i] = Math.max(
      sorted[i].ganancia + (prev[i] !== -1 ? dp[prev[i]] : 0),
      i > 0 ? dp[i - 1] : 0
    );
    mostrarPaso(i);
    i++;
  }, 1000);
}

window.onload = inicializar;
