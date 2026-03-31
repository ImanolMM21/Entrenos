'use strict';

const STORAGE_KEY = 'entrenamientos';
const SERIES_PER_EXERCISE = 5;

const ejercicios = {
  1: [
    'Press plano con mancuernas',
    'Remo con mancuernas en banco',
    'Press militar sentado con mancuernas',
    'Curl bíceps inclinado (banco 45°)',
    'Fondos en paralelas (peso corporal)',
    'Elevaciones de piernas en paralelas (piernas estiradas)'
  ],
  2: [
    'Peso muerto rumano con mancuernas',
    'Sentadilla goblet a banco',
    'Hip thrust con mancuerna',
    'Zancadas hacia atrás con mancuernas',
    'Crunch con mancuerna en pecho',
    'Elevaciones de talones sentado'
  ],
  3: [
    'Thrusters con mancuernas',
    'Remo renegado',
    'Swings con kettlebell',
    'Curl martillo alterno + Press Arnold (superserie)',
    'Crunch con pies apoyados'
  ]
};

const dom = {
  dia: document.getElementById('dia'),
  fecha: document.getElementById('fecha'),
  contenedorEjercicios: document.getElementById('contenedor-ejercicios'),
  resumen: document.getElementById('resumen'),
  btnGuardar: document.getElementById('btnGuardar'),
  manualFecha: document.getElementById('manualFecha'),
  manualDia: document.getElementById('manualDia'),
  manualNombre: document.getElementById('manualNombre'),
  manualTexto: document.getElementById('manualTexto'),
  btnManual: document.getElementById('btnManual'),
  historial: document.getElementById('historial')
};

function getEntrenamientos() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const parsedData = rawData ? JSON.parse(rawData) : [];
    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
}

function saveEntrenamientos(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function crearFilaInputs(ejIndex, setIndex) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" name="ej${ejIndex}_s${setIndex}" min="0" aria-label="Series" /></td>
    <td><input type="number" name="ej${ejIndex}_p${setIndex}" step="0.1" min="0" aria-label="Peso" /></td>
    <td><input type="number" name="ej${ejIndex}_r${setIndex}" min="0" aria-label="Repeticiones" /></td>
  `;
  return tr;
}

function crearTablaEjercicio(ejIndex) {
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th scope="col">Series</th><th scope="col">Peso</th><th scope="col">Repeticiones</th></tr></thead>';

  const tbody = document.createElement('tbody');
  for (let set = 1; set <= SERIES_PER_EXERCISE; set += 1) {
    tbody.appendChild(crearFilaInputs(ejIndex, set));
  }
  table.appendChild(tbody);

  return table;
}

function mostrarEjercicios() {
  const diaSeleccionado = dom.dia.value;
  dom.contenedorEjercicios.innerHTML = '';

  if (!diaSeleccionado) return;

  ejercicios[diaSeleccionado].forEach((nombreEjercicio, index) => {
    const wrapper = document.createElement('article');
    wrapper.className = 'exercise';

    const title = document.createElement('h3');
    title.className = 'exercise-title';
    title.textContent = `${index + 1}. ${nombreEjercicio}`;

    wrapper.appendChild(title);
    wrapper.appendChild(crearTablaEjercicio(index + 1));
    dom.contenedorEjercicios.appendChild(wrapper);
  });
}

function generarResumen() {
  const diaSeleccionado = dom.dia.value;
  const ejerciciosDivs = dom.contenedorEjercicios.querySelectorAll('.exercise');
  const bloques = [];

  ejerciciosDivs.forEach((ejDiv, i) => {
    const nombreEjercicio = ejercicios[diaSeleccionado][i];
    const filas = ejDiv.querySelectorAll('tbody tr');
    const lineas = [];

    filas.forEach((fila) => {
      const [inputSeries, inputPeso, inputRepes] = fila.querySelectorAll('input');
      const series = inputSeries.value;
      const peso = inputPeso.value;
      const repes = inputRepes.value;

      if (series && peso && repes) {
        lineas.push(`${series} x ${peso} x ${repes}`);
      }
    });

    if (lineas.length > 0) {
      bloques.push(`${nombreEjercicio}:\n${lineas.join('\n')}`);
    }
  });

  return bloques.join('\n\n').trim();
}

function guardarEnHistorial(fecha, nombre, texto) {
  const data = getEntrenamientos();
  data.push({ fecha, nombre, texto });
  saveEntrenamientos(data);
  mostrarHistorial();
}

function guardarEntreno() {
  const fecha = dom.fecha.value;
  const diaSeleccionado = dom.dia.value;

  if (!fecha || !diaSeleccionado) {
    alert('Selecciona día y fecha');
    return;
  }

  const resumen = generarResumen();

  if (!resumen) {
    alert('No has introducido datos.');
    return;
  }

  dom.resumen.value = resumen;
  const diaTexto = dom.dia.selectedOptions[0].text;
  guardarEnHistorial(fecha, diaTexto, resumen);
}

function cargarManual() {
  const fecha = dom.manualFecha.value;
  const dia = dom.manualDia.value;
  const nombreLibre = dom.manualNombre.value;
  const nombre = dia || nombreLibre || 'Entreno manual';
  const texto = dom.manualTexto.value.trim();

  if (!fecha || !texto) {
    alert('Completa fecha y resumen');
    return;
  }

  guardarEnHistorial(fecha, nombre, texto);
}

function borrarEntreno(index) {
  const data = getEntrenamientos();
  data.splice(index, 1);
  saveEntrenamientos(data);
  mostrarHistorial();
}

function toggleDetalle(toggleButton, detalle) {
  const isHidden = detalle.hasAttribute('hidden');

  if (isHidden) {
    detalle.removeAttribute('hidden');
    toggleButton.setAttribute('aria-expanded', 'true');
  } else {
    detalle.setAttribute('hidden', '');
    toggleButton.setAttribute('aria-expanded', 'false');
  }
}

function crearEntradaHistorial(entrada, realIndex) {
  const item = document.createElement('article');
  item.className = 'entrada-historial';

  const header = document.createElement('div');
  header.className = 'entrada-header';

  const title = document.createElement('strong');
  title.textContent = `${entrada.fecha} - ${entrada.nombre || 'Entreno'}`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'Ver/ocultar';
  toggle.setAttribute('aria-expanded', 'false');

  const borrar = document.createElement('button');
  borrar.type = 'button';
  borrar.textContent = 'Borrar';
  borrar.className = 'btn-borrar';

  const detalle = document.createElement('div');
  detalle.className = 'detalle-entreno';
  detalle.textContent = entrada.texto;
  detalle.setAttribute('hidden', '');

  toggle.addEventListener('click', () => toggleDetalle(toggle, detalle));
  borrar.addEventListener('click', () => borrarEntreno(realIndex));

  header.appendChild(title);
  header.appendChild(toggle);
  header.appendChild(borrar);

  item.appendChild(header);
  item.appendChild(detalle);

  return item;
}

function mostrarHistorial() {
  const data = getEntrenamientos();
  dom.historial.innerHTML = '';

  data
    .slice()
    .reverse()
    .forEach((entrada, i) => {
      const realIndex = data.length - 1 - i;
      dom.historial.appendChild(crearEntradaHistorial(entrada, realIndex));
    });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./service-worker.js').catch((error) => {
    console.error('Error al registrar Service Worker:', error);
  });
}

function init() {
  dom.dia.addEventListener('change', mostrarEjercicios);
  dom.btnGuardar.addEventListener('click', guardarEntreno);
  dom.btnManual.addEventListener('click', cargarManual);

  mostrarHistorial();
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
