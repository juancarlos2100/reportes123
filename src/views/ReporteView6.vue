<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Ventas Periodo Turno</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
      <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
      </select>
      <label for="turnoInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Turno Inicial:</label>
      <input type="number" v-model="turnoInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
      <label for="turnoFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Turno Final:</label>
      <input type="number" v-model="turnoFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>

    <!-- Tabla para los productos individuales -->
    <div>
    <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Inicio</th>
          <th>Compras</th>
          <th>Jarras</th>
          <th>Ventas</th>
          <th>Precio</th>
          <th>Importe</th>
          <th>Fin</th>
          <th>Fin calculado</th>
          <th>Diferencia</th>
          <th>Porcentaje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in productosIndividuales" :key="index">
          <td>{{ adeudo['producto'] }}</td>
          <td>{{ parseFloat(adeudo['inicio']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['compras']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['jarras']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['ventas']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['precio']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['importe']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['fin']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['fin_calculado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ parseFloat(adeudo['porcentaje']).toFixed(2) }}%</td>
        </tr>
        <!-- Nueva fila para mostrar las sumas totales -->
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>{{ sumarColumna('inicio').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('compras').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('jarras').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('ventas').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td>. </td>
          <td><strong>{{ sumarColumna('ventas').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('fin').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('fin_calculado').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td><strong>{{ sumarColumna('diferencia').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          <td>.</td>
        </tr>
      </tbody>
    </table>
    </div>
    <!-- Contenedor principal -->
    <div style="display: flex; justify-content: center; height: 500px;">
      <!-- Contenedor para el gráfico de pastel -->
      <div style="width: 50%; align-items: center;">
        <canvas id="pieChart"></canvas>
      </div>
      <!-- Contenedor para el gráfico de barras -->
      <div style="width: 50%;align-items: center;">
        <canvas id="barChart"></canvas>
      </div>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      isDarkMode: true, // Variable para controlar el modo oscuro
      resultados: [],
      selectedEstacion: null,
      mostrarResultados: false,
      productosIndividuales: [],
      total: {},
      dbm: null,
      turnoInicio: null,
      turnoFin: null,
      estaciones: {},
      pieChart: null,
      barChart: null
    };
  },

  methods: {
    async cargarEstaciones() {
      const url = 'http://192.168.1.68/admin/get.php/estaciones';
      try {
        const response = await axios.get(url);
        this.estaciones = response.data.data.reduce((acc, item) => {
          acc[item.id_dbm] = `${item.id_dbm} - ${item.nombre}`;
          return acc;
        }, {});
      } catch (error) {
        console.error("Error al obtener las estaciones:", error);
      }
    },
    async filtrarDatos() {
      if (this.turnoInicio && this.turnoFin && this.dbm) {
        const turnoInicioInt = parseInt(this.turnoInicio);
        const turnoFinInt = parseInt(this.turnoFin);
        const url = `http://192.168.1.68/admin/get.php/periodoturno`;

        const params = {
          turnoInicio: turnoInicioInt,
          turnoFin: turnoFinInt,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          this.productosIndividuales = response.data.data;

          // Buscar el total y asignarlo
          this.total = this.productosIndividuales.find(item => item.id === 'total');
          // Filtrar los productos individuales
          this.productosIndividuales = this.productosIndividuales.filter(item => item.id !== 'total');

          // Actualizar los gráficos
          this.updateChart();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        console.error("Por favor, selecciona una estación y proporciona los turnos de inicio y fin.");
      }
    },
    sumarColumna(columna) {
      return this.productosIndividuales.reduce((total, adeudo) => {
        return total + parseFloat(adeudo[columna]);
      }, 0);
    },
    calcularPromedioPrecio() {
      const totalPrecio = this.sumarColumna('precio');
      return totalPrecio / this.productosIndividuales.length;
    },
    calcularPorcentajePromedio() {
      const totalPorcentaje = this.sumarColumna('porcentaje');
      return totalPorcentaje / this.productosIndividuales.length;
    },
    updateChart() {
  // Obtener los datos para los gráficos
  const labelsPie = this.productosIndividuales.map(producto => producto.producto);
  const dataPie = this.productosIndividuales.map(producto => parseFloat(producto.importe));
  const dataBarCompras = this.productosIndividuales.map(producto => parseFloat(producto.compras));
  const dataBarVentas = this.productosIndividuales.map(producto => parseFloat(producto.ventas));

  // Colores base y resaltados para los gráficos
  const baseColors = [
    'rgba(255, 51, 102, 0.3)', // Rosa neón
    'rgba(102, 255, 51, 0.3)', // Verde neón
    'rgba(255, 255, 51, 0.3)', // Amarillo neón
    'rgba(51, 204, 255, 0.3)', // Azul neón
    'rgba(204, 102, 255, 0.3)', // Morado neón
    'rgba(255, 153, 51, 0.3)' // Naranja neón
  ];
  const neonHoverColors = [
    'rgba(255, 51, 102, 6)', // Rosa neón
    'rgba(102, 255, 51, 6)', // Verde neón
    'rgba(255, 255, 51, 6)', // Amarillo neón
    'rgba(51, 204, 255, 6)', // Azul neón
    'rgba(204, 102, 255, 6)', // Morado neón
    'rgba(255, 153, 51, 6)' // Naranja neón
  ];

  // Crear gráfico de pastel
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  if (this.pieChart) {
    this.pieChart.destroy();
  }
  this.pieChart = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: labelsPie,
      datasets: [{
        data: dataPie,
        backgroundColor: baseColors,
        hoverBackgroundColor: neonHoverColors,
        borderColor: '#ffffff', // Borde blanco
        borderWidth: 2 // Ancho del borde
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Importe por Combustible',
          color: this.isDarkMode ? '#ffffff' : '#000000' // Color del título dependiendo del modo
        },
        labels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del legend según el modo oscuro
          }
      },
      
    }
  });

  // Crear gráfico de barras
  const ctxBar = document.getElementById('barChart').getContext('2d');
  if (this.barChart) {
    this.barChart.destroy();
  }
  this.barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: labelsPie,
      datasets: [{
        label: 'Compras',
        data: dataBarCompras,
        backgroundColor: baseColors,
        hoverBackgroundColor: neonHoverColors,
        borderColor: '#ffffff', // Borde blanco
        borderWidth: 2 // Ancho del borde
      }, {
        label: 'Ventas',
        data: dataBarVentas,
        backgroundColor: baseColors.map(color => color.replace('0.7', '1')), // Colores más intensos
        hoverBackgroundColor: neonHoverColors.map(color => color.replace('0.7', '1')), // Colores más intensos al pasar el cursor
        borderColor: '#ffffff', // Borde blanco
        borderWidth: 2 // Ancho del borde
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Compras y Ventas por Combustible',
          color: this.isDarkMode ? '#ffffff' : '#000000' // Color del título dependiendo del modo
        },
        labels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del legend según el modo oscuro
          }
      },
      scales: {
          x: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje x según el modo oscuro
            }
          },
          y: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje y según el modo oscuro
            }
          }
        }
    }
  });
},
async downloadPDF() {
      let doc = new jsPDF({ orientation: 'landscape' });

      // Título del informe con periodo de fechas, turno inicial, turno final y estación
      const titulo = `Ventas Periodo - Turno Inicial: ${this.turnoInicio} - Turno Final: ${this.turnoFin} - Estación: ${this.estaciones[this.dbm]} `;
      doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });

      // Tabla de datos
      const ventasTableData = [];
      const tableRows = document.querySelectorAll('table tbody tr');
      tableRows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
          rowData.push(cell.textContent.trim());
        });
        ventasTableData.push(rowData);
      });

      // Agregar tabla al PDF
      autoTable(doc, {
        head: [['Producto', 'Inicio', 'Compras', 'Jarras', 'Ventas', 'Precio', 'Importe', 'Fin', 'Fin calculado', 'Diferencia', 'Porcentaje']],
        body: ventasTableData,
        startY: 20,
        headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
      });

      // Footer del PDF
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 2);
      }

      // Guardar el PDF
      doc.save('Informe_Ventas_Periodo.pdf');
    }

  },
  mounted() {
    this.cargarEstaciones();
  }
};
</script>




<style scoped>
.content-container {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}

.chart-container {
  width: 95%;
  height: 500px;
  margin-left: 5px;
  margin-right: 10px;
}

.table-container {
  width: 100%;
}
  /* Estilos para las etiquetas de fecha */
  label[for="fechaInicio"], label[for="fechaFin"] {
    font-family: "Arial", sans-serif; /* Cambiar la fuente */
    font-size: 20px; /* Cambiar el tamaño de fuente */
  }

  table {
  width: 95%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}

/* Reducir el ancho de la primera columna a la mitad */
table tr td:first-child {
  width: 20%;
}

.table:hover {
  transform: translateY(-0.3rem);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.tabla-totales {
  width: 800px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: 90px;
  margin-right: auto;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-0.03rem)scale(1.03);
  
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.5);
}

.tabla-totales th,
.tabla-totales td {
  padding: 15px; /* Ajusta el relleno de las celdas según sea necesario */
  font-size: 17px; /* Ajusta el tamaño de la fuente según sea necesario */
}





th,
td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px; /* Ajusta según sea necesario */
}

th {
  background-color: #f2f2f2;
}
.imagen-encabezado {
  width: 350px; /* Cambia esto al ancho que desees */
  height: 100px; /* Cambia esto a la altura que desees */
  display: block;
  margin-left: 30px;
  margin-right: auto;
}
.title{
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;
  
}
.boton-descargar {
  background-color: #53980d; /* Verde */
  width: 150px;
  height: 40px;
  border-width: thin;
  border: 1px solid #3b6e22;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 25px;
  margin-top: 10px;
  padding-left: 10px;
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  transition: transform 0.5s ease, box-shadow 0.5s ease, background-color 0.5s ease;
}

.boton-descargar:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
  transform: translateY(0.5rem); /* Mover hacia abajo */
}

.boton-descargar:active {
  transform: scale(1.05) translateY(0.5rem); /* Aumentar un poco el tamaño y mover hacia abajo al hacer clic */
}
.boton-filtrar {
  background-color: #53980d; /* Verde */
  width: 100px;
  height: 40px;
  border-width: thin;
  border: 1px solid #3b6e22;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 20px;
  border-radius: 25px;
  margin-top: 50px;
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  transition: transform 0.5s ease, box-shadow 0.5s ease, background-color 0.5s ease;
}

.boton-filtrar:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
  transform: translateY(-0.5rem); /* Desplazamiento hacia arriba */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* Sombra debajo */
}

.boton-filtrar:active {
  transform: scale(1.2); /* Aumentar un poco el tamaño al hacer clic */
}
.cont-total{
  margin-top: 60px;
  align-items: center;
}
.dark-mode {
  background-color: #333; /* Color de fondo oscuro */
  color: #fff; /* Color de texto blanco */
  min-height: 100vh;
}
.dark-mode-select,
.dark-mode-input {
  background-color: #444; /* Color de fondo oscuro para select e input */
  color: #fff; /* Color de texto blanco para select e input */
}
.dark-mode-table {
  color: #fff; /* Color del texto en modo oscuro */
  background-color: #333; /* Color de fondo en modo oscuro */
  border-collapse: collapse; /* Colapsar los bordes de la tabla */
  width: 95%; /* Ancho de la tabla */
  margin-top: 20px; /* Margen superior */
  margin-bottom: 8px; /* Margen inferior */
  margin-left: 20px;
}

.dark-mode-table th,
.dark-mode-table td {
  border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
  padding: 8px; /* Espaciado interno de las celdas */
  text-align: left; /* Alineación del texto en las celdas */
}

.dark-mode-table th {
  background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
  color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
</style>