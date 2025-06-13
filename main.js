// Datos iniciales (puedes modificar aquí o desde la interfaz) 
let eventos = [
  { nombre: "Evento A", inicio: 1, fin: 3, ganancia: 5 },
  { nombre: "Evento B", inicio: 2, fin: 5, ganancia: 6 },
  { nombre: "Evento C", inicio: 4, fin: 7, ganancia: 5 },
  { nombre: "Evento D", inicio: 6, fin: 9, ganancia: 4 },
  { nombre: "Evento E", inicio: 8, fin: 10, ganancia: 11 }
];

function compararEventos(a, b) {
  return a.fin - b.fin;
}

function calcularCompatibles(eventosLista) {
  let compatiblesGrupos = [];
  eventosLista.forEach((evento, i) => {
    let grupo = [];
    eventosLista.forEach((ev, j) => {
      if (i === j || ev.inicio >= evento.fin || ev.fin <= evento.inicio) {
        grupo.push(j);
      }
    });
    compatiblesGrupos.push(grupo);
  });
  return compatiblesGrupos;
}

function dibujarEventosFijos(eventosLista) {
  const cont = document.getElementById("graficaSeparados");
  cont.innerHTML = "";

  eventosLista.forEach((evento, i) => {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    const bloque = document.createElement("div");
    bloque.classList.add("bloqueEvento");
    bloque.style.width = (evento.fin - evento.inicio) * 40 + "px";
    bloque.style.marginLeft = (evento.inicio - 1) * 40 + "px";
    bloque.id = `fijo-${i}`;
    bloque.innerHTML = `<span class="labelHora">${evento.inicio} - ${evento.fin}</span>`;

    fila.appendChild(bloque);

    const info = document.createElement("span");
    info.classList.add("nombre-ganancia");
    info.textContent = `${evento.nombre} (Ganancia: ${evento.ganancia})`;
    fila.appendChild(info);

    cont.appendChild(fila);
  });

  agregarNumeracionHorizontal(cont, eventosLista);
}

function dibujarAnimacion(eventosLista) {
  const cont = document.getElementById("graficaAnimada");
  cont.innerHTML = "";

  eventosLista.forEach((evento, i) => {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    const bloque = document.createElement("div");
    bloque.classList.add("bloqueEvento");
    bloque.style.width = (evento.fin - evento.inicio) * 40 + "px";
    bloque.style.marginLeft = (evento.inicio - 1) * 40 + "px";
    bloque.id = `animado-${i}`;
    bloque.innerHTML = `<span class="labelHora">${evento.inicio} - ${evento.fin}</span>`;

    fila.appendChild(bloque);

    const info = document.createElement("span");
    info.classList.add("nombre-ganancia");
    info.textContent = `${evento.nombre} (Ganancia: ${evento.ganancia})`;
    fila.appendChild(info);

    const labelGanancia = document.createElement("div");
    labelGanancia.className = "ganancia-label";
    bloque.appendChild(labelGanancia);

    cont.appendChild(fila);
  });

  agregarNumeracionHorizontal(cont, eventosLista);
}

function agregarNumeracionHorizontal(contenedor, eventosLista) {
  const numeracionPrev = contenedor.querySelector(".numeracion");
  if (numeracionPrev) numeracionPrev.remove();

  const maxFin = Math.max(...eventosLista.map(ev => ev.fin));
  const minInicio = Math.min(...eventosLista.map(ev => ev.inicio));

  const numeracionDiv = document.createElement("div");
  numeracionDiv.classList.add("numeracion");

  for (let t = minInicio; t <= maxFin; t++) {
    const span = document.createElement("span");
    span.textContent = t;
    numeracionDiv.appendChild(span);
  }

  contenedor.appendChild(numeracionDiv);
}

async function animarSeleccionEventos(eventosLista) {
  const eventosOrdenados = [...eventosLista].sort(compararEventos);
  const compatiblesGrupos = calcularCompatibles(eventosOrdenados);
  dibujarAnimacion(eventosOrdenados);

  for (let i = 0; i < eventosOrdenados.length; i++) {
    const grupo = compatiblesGrupos[i];

    for (let j = 0; j < eventosOrdenados.length; j++) {
      if (j < i) {
        marcarEventoAnimado(j, "gris");
      } else if (j === i) {
        marcarEventoAnimado(j, "evaluado");
      } else if (grupo.includes(j)) {
        marcarEventoAnimado(j, "compatible");
      } else {
        marcarEventoAnimado(j, "incompatible");
      }
      await delay(300);
    }

    await delay(1000);
  }

  // Cálculo con DP
  const p = obtenerP(eventosOrdenados);
  const M = calcularGananciaMaxima(eventosOrdenados, p);

  // Muestra resumen
  mostrarResumenSeleccionados(eventosOrdenados, p, M);
}

function marcarEventoAnimado(idx, clase) {
  const bloque = document.getElementById(`animado-${idx}`);
  if (!bloque) return;
  bloque.classList.remove("evaluado", "compatible", "incompatible", "gris");
  bloque.classList.add(clase);
}

function mostrarGananciaAnimado(idx, ganancia) {
  const bloque = document.getElementById(`animado-${idx}`);
  if (!bloque) return;
  const label = bloque.querySelector(".ganancia-label");
  if (label) label.textContent = "Ganancia DP: " + ganancia;
}

function obtenerP(eventos) {
  const p = [];
  for (let i = 0; i < eventos.length; i++) {
    let j = i - 1;
    while (j >= 0 && eventos[j].fin > eventos[i].inicio) {
      j--;
    }
    p.push(j);
  }
  return p;
}

function calcularGananciaMaxima(eventosOrdenados, p) {
  const M = [0];
  for (let i = 0; i < eventosOrdenados.length; i++) {
    const incl = eventosOrdenados[i].ganancia + (p[i] >= 0 ? M[p[i] + 1] : 0);
    const excl = M[i];
    M.push(Math.max(incl, excl));
  }
  return M;
}


function mostrarResumenSeleccionados(eventosOrdenados, p, M) {
  // Limpiar resultados anteriores
  const resumenPrev = document.getElementById("resumenFinal");
  if (resumenPrev) resumenPrev.remove();

  let j = eventosOrdenados.length;
  let seleccionados = [];
  while (j > 0) {
    if (eventosOrdenados[j - 1].ganancia + (p[j - 1] >= 0 ? M[p[j - 1] + 1] : 0) >= M[j - 1]) {
      seleccionados.push({ ...eventosOrdenados[j - 1], idx: j - 1 });
      j = p[j - 1] + 1;
    } else {
      j = j - 1;
    }
  }
  seleccionados.reverse();

  // Crear resumen
  const resumen = document.createElement("div");
  resumen.id = "resumenFinal";
  resumen.innerHTML = `<h3>Eventos Seleccionados:</h3><ul>` +
    seleccionados.map(e => `<li>${e.nombre} (${e.inicio}-${e.fin}, Ganancia: ${e.ganancia})</li>`).join("") +
    `</ul>`;

  const total = seleccionados.reduce((acc, ev) => acc + ev.ganancia, 0);
  const totalText = document.createElement("p");
  totalText.innerHTML = `<strong>Ganancia Total: ${total}</strong>`;
  resumen.appendChild(totalText);

  document.getElementById("graficaAnimada").appendChild(resumen);

  // Marcar en verde los seleccionados
  seleccionados.forEach(ev => marcarEventoAnimado(ev.idx, "seleccionado"));
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function inicializar() {
  dibujarEventosFijos(eventos);
  dibujarAnimacion(eventos);
  document.getElementById("btnAnimar").onclick = () => animarSeleccionEventos(eventos);
}

window.onload = inicializar;
