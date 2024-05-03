<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
   <header>
     <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
   </header>
   <h1>Reporte Operativo</h1>
   <h2> Empresas de Reembolso</h2>
   <div>
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
   <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

   </div>
   
   <div class="container" style="display: flex; height: 100%;">
     <!-- Lado izquierdo -->
     <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
      <h1>Transacciones Registradas</h1>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Razón Social</th>
              <th>SaldoInicial</th>
              <th>Cargos</th>
              <th>Abonos</th>
              <th>Final</th>
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['cliente'] }}</td>
              <td>{{ adeudo['razon_social'] }}</td>
              <td>${{ parseFloat(adeudo['saldo_inicio']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['cargos']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['abonos']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['saldo_fin']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>TOTAL</strong></td>
              <td><strong>${{ parseFloat(totalRegistros.saldo_inicio).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
              <td><strong>${{ parseFloat(totalRegistros.cargos).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
              <td><strong>${{ parseFloat(totalRegistros.abonos).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
              <td><strong>${{ parseFloat(totalRegistros.saldo_fin).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6">No se encontraron registros que coincidan con su búsqueda</td>
            </tr>
          </tbody>
        </table>

       <br>
     </div>

     <!-- Lado derecho -->
     <div class="right-container" style="flex: 0 0 45%; overflow: auto;">
       <h1>Tablero de Gráficas</h1>
       <h3>Proporción de Cargos-Abonos</h3>
       <div class="chart-container">
         <canvas id="myBarChart"></canvas>
       </div>
       <!-- Nuevo gráfico de pastel (chart2) -->
       <div class="chart-container2">
         <h3>Proporción de Cargos y Abonos </h3>
         <canvas id="myPieChart"></canvas>
       </div>
       <br>
       <br>
        <!--<div class="cont-total">
          <h1>Total por Proveedor</h1>
         <table :class="{ 'tabla-totales': !isDarkMode, 'dark-mode-table': isDarkMode }">
             <thead>
               <tr>
                 <th>Nombre</th>
                 <th>Cargos</th>
                 <th>Abonos</th>
                 <th>Diferencia</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="(total, nombre) in totalesPorNombre" :key="nombre">
                 <td><strong>{{ nombre }}</strong></td>
                 <td>${{ total.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                 <td>${{ total.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                 <td>${{ total.diferencia.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
               </tr>
             </tbody>
           </table>
       </div>-->
     </div>
   </div>
     </div>
</template>

<script>
import axios from "axios";
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';



export default {
 data() {
   return {
     isDarkMode: true, // Variable para controlar el modo oscuro
     resultados: [],
     resultadosOriginales: [], // Nuevo atributo
     idTipo: null,
     estatus: null,
     fechaInicio: null,
     fechaFin: null,
     dbm: null, // Nuevo atributo para la estación
     estaciones: {},
     totalesPorNombre: {},
     mostrarResultados: false,
     turnoInicio: null,
      turnoFin: null,
      totalRegistros: {} 
   };
 },
 methods: {
   async cargarEstaciones() {
     const url = 'http://gasserver.dyndns.org:8081/admin/get.php/estaciones';
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
      const url = `http://gasserver.dyndns.org:8081/admin/get.php/empresarembolso`;

      const params = {
        turnoInicio: turnoInicioInt,
        turnoFin: turnoFinInt,
        dbm: parseInt(this.dbm)
      };

      try {
        const response = await axios.get(url, {
          params,
          timeout: 30000 // Establecer el tiempo de espera en 20 segundos
        });
        this.resultadosOriginales = response.data.data;
        this.resultados = [...this.resultadosOriginales];
        this.mostrarResultados = true;
        
        // Calcula los totales y asigna a la propiedad totalRegistros
        this.totalRegistros = this.sumarRegistros(); 

        // Luego actualiza el gráfico de barras
        this.updateChart(); 
      } catch (error) {
        console.error("Error al obtener datos de la API:", error);
      }
    } else {
      // Manejo si no se selecciona una estación o no se proporcionan fechas
      this.resultados = [];
      this.mostrarResultados = false;
      this.totalRegistros = {}; // Reinicia los totales
    }
  },

    sumarRegistros() {
    let total = {
      saldo_inicio: 0,
      cargos: 0,
      abonos: 0,
      saldo_fin: 0
    };

    this.resultados.forEach((registro) => {
      total.saldo_inicio += Number(registro.saldo_inicio);
      // Asegúrate de convertir la cadena a número y quitar el signo negativo si es necesario
      total.cargos += (Number(registro.cargos));
      total.abonos += Number(registro.abonos);
      total.saldo_fin += Number(registro.saldo_fin);
    });

    return total;
  },
  updateChart() {
  const ctxBar = document.getElementById('myBarChart');
  const ctxPie = document.getElementById('myPieChart'); 
  
  // Destruye el gráfico existente si ya está creado
  if (this.barChart) {
    this.barChart.destroy();
  }
  if (this.pieChart) {
    this.pieChart.destroy();
  }

  // Define los colores neon para las barras del gráfico
  const neonBaseColorsBar = [ 'rgba(41, 255, 218, 0.4)',
                            'rgba(1, 196, 231, 0.4)',
                            'rgba(248, 45, 151, 0.4)',
                            'rgba(56, 64, 151, 0.4)',
                          
                          ];

  const neonHoverColorsBar = [
                            'rgba(41, 255, 218, 0.8)',
                              'rgba(1, 196, 231, 0.8)',
                              'rgba(248, 45, 151, 0.8)',
                              'rgba(56, 64, 151, 0.8)',
                            ];

  // Crea un nuevo gráfico de barras
  this.barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Abonos', 'Cargos', 'Saldo Final', 'Saldo Inicial'],
      datasets: [{
        data: [
          Math.abs(this.totalRegistros.abonos),
          Math.abs(this.totalRegistros.cargos),
          Math.abs(this.totalRegistros.saldo_fin),
          Math.abs(this.totalRegistros.saldo_inicio)
        ],
        backgroundColor: neonBaseColorsBar, 
        hoverBackgroundColor: neonHoverColorsBar,
        borderColor: this.isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)', 
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: '.',
          font: {
            size: 14,
            weight: 'bold',
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', 
          },
          ticks: {
            color: this.isDarkMode ? '#ffffff' : '#000000' 
          }
        },
        y: {
          grid: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', 
          },
          ticks: {
            color: this.isDarkMode ? '#ffffff' : '#000000' 
          }
        }
      }
    }
  });

    // Crea un nuevo gráfico circular
    this.pieChart = new Chart(ctxPie, {
  type: 'pie',
  data: {
    labels: ['Abonos', 'Cargos', 'Saldo Final', 'Saldo Inicial'],
    datasets: [{
      data: [
        Math.abs(this.totalRegistros.abonos),
        Math.abs(this.totalRegistros.cargos),
        Math.abs(this.totalRegistros.saldo_fin),
        Math.abs(this.totalRegistros.saldo_inicio)
      ],
      backgroundColor: neonBaseColorsBar, 
      hoverBackgroundColor: neonHoverColorsBar,
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Resumen Financiero', // Título del gráfico
        font: {
          size: 14,
          weight: 'bold',
          color: this.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
        }
      },
      legend: {
        display: true, // Muestra la leyenda
        labels: {
          color: this.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
        }
      }
    }
  }
});


  
},
async downloadPDF() {
  // Crear documento PDF
  let doc = new jsPDF();

  // Título del reporte
   // Título del informe con periodo de fechas, turno inicial, turno final y estación
   const titulo = `Saldos Empresas de Reembolso \n Turno Inicial: ${this.turnoInicio} - Turno Final: ${this.turnoFin} \n Estación: ${this.estaciones[this.dbm]} `;
    doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });


  // Obtener datos de la tabla
  const transaccionesTableData = [];
  const rows = document.querySelectorAll(".left-container table tbody tr");
  rows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll("td");
    cells.forEach(cell => {
      rowData.push(cell.innerText.trim());
    });
    transaccionesTableData.push(rowData);
  });

  // Agregar tabla de transacciones al PDF
  doc.autoTable({
    head: [['Cliente', 'Razón Social', 'SaldoInicial', 'Cargos', 'Abonos', 'Final']],
    body: transaccionesTableData,
    startY: 50,
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
  doc.save('Reporte_Transacciones_Registradas.pdf');
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
.chart-container2 {
 width: 60%;
 height: 300px;
 margin-left: 200px;
 margin-right: 10px;
 margin-bottom: 200px;
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
 width: 100vw;
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
.dark-mode-table td:first-child {
  column-width: 50%; /* Reduce a la mitad el ancho de la primera columna */
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
.dark-mode-saldo-anterior-table {
 color: #fff; /* Color del texto en modo oscuro */
 background-color: #333; /* Color de fondo en modo oscuro */
 border-collapse: collapse; /* Colapsar los bordes de la tabla */
 width: 95%; /* Ancho de la tabla */
 margin-bottom: 2px; /* Margen inferior */
 text-align: right; /* Alineación del texto a la derecha */
 margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
 border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
 padding: 8px; /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
 background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
 color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
.dark-mode .tabla-totales {
 background-color: #333; /* Fondo oscuro */
 color: #fff; /* Texto blanco */
 border-collapse: collapse; /* Colapso de bordes */
 width: 100%; /* Ancho completo */
}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
 border: 1px solid #fff; /* Borde blanco */
 padding: 8px; /* Espaciado interno */
 text-align: center; /* Alineación centrada */
}

.dark-mode .tabla-totales th {
 background-color: #555; /* Color de fondo para encabezados */
}
.dark-mode-saldo-anterior-table {
 color: #fff; /* Color del texto en modo oscuro */
 background-color: #333; /* Color de fondo en modo oscuro */
 border-collapse: collapse; /* Colapsar los bordes de la tabla */
 width: 95%; /* Ancho de la tabla */
 margin-bottom: 2px; /* Margen inferior */
 text-align: right; /* Alineación del texto a la derecha */
 margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
 border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
 padding: 8px; /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
 background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
 color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
.dark-mode .tabla-totales {
 background-color: #333; /* Fondo oscuro */
 color: #fff; /* Texto blanco */
 border-collapse: collapse; /* Colapso de bordes */
 width: 100%; /* Ancho completo */
}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
 border: 1px solid #fff; /* Borde blanco */
 padding: 8px; /* Espaciado interno */
 text-align: center; /* Alineación centrada */
}

.dark-mode .tabla-totales th {
 background-color: #555; /* Color de fondo para encabezados */
}

</style>


