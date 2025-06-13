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
      if (i !== j && (ev.inicio >= evento.fin || ev.fin <= evento.inicio)) {
        grupo.push(j);
      }
    });
    grupo.push(i);
    grupo = [...new Set(grupo)].sort((x, y) => x - y);
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

function dibujarEventosCompatibles(eventosLista, compatiblesGrupos) {
  const cont = document.getElementById("graficaOrdenada");
  cont.innerHTML = "";

  compatiblesGrupos.forEach((grupo, i) => {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    grupo.forEach(idx => {
      const evento = eventosLista[idx];
      const bloque = document.createElement("div");
      bloque.classList.add("bloqueEvento");
      bloque.style.width = (evento.fin - evento.inicio) * 40 + "px";
      bloque.style.marginLeft = (evento.inicio - 1) * 40 + "px";
      bloque.id = `compatibles-${i}-${idx}`;
      bloque.innerHTML = `<span class="labelHora">${evento.inicio} - ${evento.fin}</span>`;
      fila.appendChild(bloque);
    });

    const nombresGanancias = grupo.map(idx => {
      const e = eventosLista[idx];
      return `${e.nombre} (${e.ganancia})`;
    }).join(", ");

    const info = document.createElement("span");
    info.classList.add("nombre-ganancia");
    info.textContent = nombresGanancias;

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
  const n = eventosOrdenados.length;

  const p = new Array(n).fill(-1);
  for (let j = 0; j < n; j++) {
    for (let i = j - 1; i >= 0; i--) {
      if (eventosOrdenados[i].fin <= eventosOrdenados[j].inicio) {
        p[j] = i;
        break;
      }
    }
  }

  let M = new Array(n + 1).fill(0);

  dibujarAnimacion(eventosOrdenados);

  for (let j = 1; j <= n; j++) {
    marcarEventoAnimado(j - 1, "evaluado");

    const gananciaIncluye = eventosOrdenados[j - 1].ganancia + M[p[j - 1] + 1];
    const gananciaExcluye = M[j - 1];
    M[j] = Math.max(gananciaIncluye, gananciaExcluye);

    mostrarGananciaAnimado(j - 1, M[j]);

    await delay(1500);

    if (M[j] === gananciaIncluye) {
      marcarEventoAnimado(j - 1, "seleccionado");
      if (p[j - 1] >= 0) marcarEventoAnimado(p[j - 1], "seleccionado");
    } else {
      marcarEventoAnimado(j - 1, "rechazado");
    }

    await delay(1000);
  }

  alert("Ganancia máxima total: " + M[n]);
  marcarCaminoOptimo(eventosOrdenados, p, M);
  mostrarResumenSeleccionados(eventosOrdenados, p, M);
}

function marcarEventoAnimado(idx, clase) {
  const bloque = document.getElementById(`animado-${idx}`);
  if (!bloque) return;
  bloque.classList.remove("evaluado", "seleccionado", "rechazado", "\u00f3ptimo");
  bloque.classList.add(clase);
}

function mostrarGananciaAnimado(idx, ganancia) {
  const bloque = document.getElementById(`animado-${idx}`);
  if (!bloque) return;
  const label = bloque.querySelector(".ganancia-label");
  if (label) label.textContent = "Ganancia DP: " + ganancia;
}

function marcarCaminoOptimo(eventosOrdenados, p, M) {
  let j = eventosOrdenados.length;
  while (j > 0) {
    if (eventosOrdenados[j - 1].ganancia + (p[j - 1] >= 0 ? M[p[j - 1] + 1] : 0) >= M[j - 1]) {
      marcarEventoAnimado(j - 1, "\u00f3ptimo");
      j = p[j - 1] + 1;
    } else {
      j = j - 1;
    }
  }
}

function mostrarResumenSeleccionados(eventosOrdenados, p, M) {
  let j = eventosOrdenados.length;
  let seleccionados = [];
  while (j > 0) {
    if (eventosOrdenados[j - 1].ganancia + (p[j - 1] >= 0 ? M[p[j - 1] + 1] : 0) >= M[j - 1]) {
      seleccionados.push(eventosOrdenados[j - 1]);
      j = p[j - 1] + 1;
    } else {
      j = j - 1;
    }
  }
  seleccionados.reverse();
  const resumen = document.createElement("div");
  resumen.innerHTML = `<h3>Eventos Seleccionados:</h3><ul>` + seleccionados.map(e => `<li>${e.nombre} (${e.inicio}-${e.fin}, Ganancia: ${e.ganancia})</li>`).join("") + `</ul>`;
  document.getElementById("graficaAnimada").appendChild(resumen);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function inicializar() {
  dibujarEventosFijos(eventos);
  dibujarEventosCompatibles(eventos, calcularCompatibles(eventos));
  dibujarAnimacion(eventos);
  document.getElementById("btnAnimar").onclick = () => animarSeleccionEventos(eventos);
}

window.onload = inicializar;
