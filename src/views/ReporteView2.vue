<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Bancos</h2>
    <div> 
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" maxlength="10" style="margin-right:10px; width: 150px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" maxlength="10" style="margin-right:10px; width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>
    </div>

    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 40%; overflow: auto;">
        <h1>Transacciones Registradas</h1>
        <table class="table">
          <thead>
            <tr>
              <th>id de estacion</th>
              <th>Fecha Contable</th>
              <th>Saldo</th>
              <!--<th>Status</th>-->
              <th>Banco</th>
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['id_dbm'] }}</td>
              <td>{{ adeudo['fecha_contable'] }}</td>
              <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <!--<td>{{ adeudo['estado'] }}</td>-->
              <td>{{ adeudo['banco'] }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5">No se encontraron registros que coincidan con su búsqueda</td>
            </tr>
          </tbody>
        </table>
        <br>
      </div>

  <!-- Lado derecho -->
  <div class="right-container" style="flex: 0 0 60%; overflow: auto;">
    <h1>Tablero de Gráficas</h1>
    <div class="chart-container">
      <canvas id="myChart"></canvas>
    </div>
    <!-- Nuevo gráfico de pastel (chart2) -->
    <div class="chart-container">
      <canvas id="myPieChart"></canvas>
    </div>
    <div class="cont-total">
      <h2>Total de Saldo por Banco</h2>
      <table class="tabla-totales">
        <thead>
          <tr>
            <th>Banco</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(saldo, banco) in totalesPorBanco" :key="banco">
            <td><strong>{{ banco }}</strong></td>
            <td><strong>${{ Number(saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
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
      resultados: [],
      selectedEstacion: null,
      estaciones: {
        1: 'OKTAN REMDU',
        2: 'OKTAN SMART ENERGY',
        3: 'OKTAN COLIBRI',
        4: 'OKTAN CASCADA',
        5: 'GASOLINERA EL MAYORAZGO',
        6: 'GASOLINERA GRANJAS SAN ISIDRO',
        7: 'GASOLINERA CASTILLOTLA',
        8: 'OKTAN PERIFERICO SAN JOSE',
        9: 'OKTAN EKO',
        10: 'OKTAN MAGNUS',
        11: 'OKTAN CLEAN ENERGY',
        12: 'SERVI OKTAN',
        13: 'SERVIOK',
        14: 'GRUPO GASOLINERO EXITO',
        15: 'SERVI K-FIVER',
        16: 'SERVICIO GAS 5',
        17: 'GASOLINERIA SAN FERNANDO',
        18: 'OKTAN SERVITALLERES',
        19: 'OKTAN SERVI PENINSULAR',
        20: 'SERVIGAS-VANGUARD'
      },
      mostrarResultados: false,
      resultadosOriginales: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
      dbm: null,
    };
  },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = `http://gasserver.dyndns.org:8081/admin/get.php/transaccionesbanco`;
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data; // Guardar los datos originales
          this.resultados = [...this.resultadosOriginales]; // Actualizar resultados con los datos originales
          this.calcularUltimoSaldoPorBanco();
          this.mostrarResultados = true; // Mostrar la tabla de resultados
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        // Manejo si no se selecciona una estación o no se proporcionan fechas
        
      }
    },

    calcularUltimoSaldoPorBanco() {
      const registrosUnicos = {};
      this.totalesPorBanco = this.resultados.reduce((totales, adeudo) => {
        if (adeudo['banco'] && adeudo['saldo']) {
          // Verificar si ya existe un registro para este banco
          if (!Object.prototype.hasOwnProperty.call(registrosUnicos, adeudo['banco'])) {
            // Si no existe, añadir este registro como el último
            totales[adeudo['banco']] = adeudo['saldo'];
            registrosUnicos[adeudo['banco']] = adeudo;
          } else {
            // Si ya existe, comparar las fechas para determinar cuál es más reciente
            const registroExistente = registrosUnicos[adeudo['banco']];
            const fechaActual = new Date(adeudo['fecha']);
            const fechaExistente = new Date(registroExistente['fecha']);

            if (fechaActual > fechaExistente) {
              // Si la fecha actual es más reciente, actualizar el registro
              totales[adeudo['banco']] = adeudo['saldo'];
              registrosUnicos[adeudo['banco']] = adeudo;
            }
          }
        }
        return totales;
      }, {});
      this.updateChart();
    },



    updateChart() {
      if (this.myChart) {
        this.myChart.destroy();
        this.myPieChart.destroy(); // Destruye el gráfico de pastel también
      }
      this.generateChart();
    },
    generateChart() {
  const bancos = Object.keys(this.totalesPorBanco);
  const saldos = Object.values(this.totalesPorBanco);
  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Calcula los valores absolutos de los saldos
  const saldosAbsolutos = saldos.map(saldo => Math.abs(saldo));

  // Definir una matriz de colores para las barras y el pastel
  const colores = [
    'rgba(255, 100, 10, 0.4)',   // Naranja claro
    'rgba(0, 207, 24, 0.4)',    // Verde claro
    'rgba(255, 183, 0, 0.4)',   // Amarillo claro
    'rgba(0, 0, 255, 0.4)',     // Azul
    'rgba(255, 0, 0, 0.4)',     // Rojo
    'rgba(255, 193, 7, 0.4)',   // Amarillo pastel
    'rgba(29, 233, 182, 0.4)',  // Verde pastel
    'rgba(255, 99, 132, 0.4)',  // Rosa pastel
    'rgba(173, 216, 230, 0.4)', // Azul pastel
    'rgba(222, 159, 64, 0.4)',  // Naranja pastel
    'rgba(255, 205, 210, 0.4)', // Rosa claro
    'rgba(144, 238, 144, 0.4)', // Verde claro
    'rgba(173, 255, 47, 0.4)',  // Verde amarilloso
    'rgba(176, 224, 230, 0.4)', // Azul cielo
    'rgba(220, 208, 255, 0.4)', // Lavanda
];

  // Define una matriz de colores de resaltado para cada rebanada
  const coloresResaltados = [
    'rgba(255, 100, 10, 0.9)',   // Naranja claro
    'rgba(0, 207, 24, 0.9)',    // Verde claro
    'rgba(255, 183, 0, 0.9)',   // Amarillo claro
    'rgba(0, 0, 255, 0.9)',     // Azul
    'rgba(255, 0, 0, 0.9)',     // Rojo
    'rgba(255, 193, 7, 0.9)',   // Amarillo pastel
    'rgba(29, 233, 182, 0.9)',  // Verde pastel
    'rgba(255, 99, 132, 0.9)',  // Rosa pastel
    'rgba(173, 216, 230, 0.9)', // Azul pastel
    'rgba(222, 159, 64, 0.9)',  // Naranja pastel
    'rgba(255, 205, 210, 0.9)', // Rosa claro
    'rgba(144, 238, 144, 0.9)', // Verde claro
    'rgba(173, 255, 47, 0.9)',  // Verde amarilloso
    'rgba(176, 224, 230, 0.9)', // Azul cielo
    'rgba(220, 208, 255, 0.9)', // Lavanda
  ];


  // Gráfico de barras
  this.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bancos,
      datasets: [{
        label: `Saldo por Banco del ${this.fechaInicio} al ${this.fechaFin}`,
        data: saldosAbsolutos,
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.4', '1')),
        borderWidth: 1,
        hoverBackgroundColor: coloresResaltados,
        hoverBorderWidth: 2
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Saldo por Banco'
        }
      },
      animation: {
        duration: 3000 // Ajusta la duración de la animación a 2000 milisegundos (2 segundos)
      }
    }
  });

  // Gráfico de pastel
  const ctx2 = document.getElementById('myPieChart').getContext('2d');
  this.myPieChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: bancos,
      datasets: [{
        label: `Saldo por Banco del ${this.fechaInicio} al ${this.fechaFin}`,
        data: saldosAbsolutos,
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.4', '1')),
        borderWidth: 0.5,
        hoverBackgroundColor: coloresResaltados,
        hoverBorderColor: colores.map(color => color.replace('0.4', '1')),
        hoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Distribución de Saldos por Banco'
        }
      },
      animation: {
        duration: 3000 // Ajusta la duración de la animación a 2000 milisegundos (2 segundos)
      }
    }
  });
},
async downloadPDF() {
  let doc = new jsPDF();
  let yOffset = 10;

  // Encabezado del PDF
  doc.text('Reporte Operativo', doc.internal.pageSize.getWidth() / 2, yOffset, { align: 'center', fontStyle: 'bolder' });
  doc.text('Transacciones Bancos', doc.internal.pageSize.getWidth() / 2, yOffset + 10, { align: 'center' });
  doc.text(`Del: ${this.fechaInicio} - al : ${this.fechaFin}`, doc.internal.pageSize.getWidth() / 2, yOffset + 20, { align: 'center', fontSize: 12 });

  // Generar tabla de transacciones bancarias
  const tableData = [];
  this.resultados.forEach(adeudo => {
    const rowData = [
      adeudo.fecha_contable,
      `$${parseFloat(adeudo.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      adeudo.estado,
      adeudo.banco
    ];
    tableData.push(rowData);
  });

  // Agregar tabla de transacciones bancarias al PDF
  autoTable(doc, {
    head: [['Fecha Contable', 'Saldo', 'Status', 'Banco']],
    body: tableData,
    startY: yOffset + 40,
    headStyles: { fillColor: '#D3D3D3', textColor: '#000000' } 
  });

  // Generar tabla de totales por banco
  const totalTableData = [];
  for (const [banco, saldo] of Object.entries(this.totalesPorBanco)) {
    totalTableData.push([banco, `$${Number(saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }

  // Agregar tabla de totales por banco al PDF
  autoTable(doc, {
    head: [['Banco', 'Saldo Final']],
    body: totalTableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' } 
  });

  // Crear el gráfico solo si el canvas está presente en el DOM
  const canvas = document.getElementById('myChart');
  if (canvas) {
    // Destruir el gráfico existente si existe
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Generar el gráfico
    const ctx = canvas.getContext('2d');
    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(this.totalesPorBanco),
        datasets: [{
          label: `Saldo por Banco del ${this.fechaInicio} al ${this.fechaFin}`,
          data: Object.values(this.totalesPorBanco),
          backgroundColor: 'rgba(96, 150, 96, 0.2)',
          borderColor: 'rgba(96, 150, 96, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Exportar el gráfico como imagen
    const chartImage = await this.myChart.toBase64Image();

    // Agregar la imagen del gráfico al PDF
    const imgProps = doc.getImageProperties(chartImage);
    const aspectRatio = imgProps.width / imgProps.height;
    const imgWidth = doc.internal.pageSize.getWidth() - 20;
    const imgHeight = imgWidth / aspectRatio;
    doc.addImage(chartImage, 'PNG', 10, doc.lastAutoTable.finalY + 20, imgWidth, imgHeight);
  }

  // Footer del PDF
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 10);
  }

  // Guardar el PDF
  doc.save('Reporte_Transacciones_Bancos.pdf');
}



  },
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
  height: 800px;
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
  margin-left: auto;
  margin-right: 200px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-1rem)scale(1.04);
  transform: translateX(-3rem)scale(1.04);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.9);
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
</style>