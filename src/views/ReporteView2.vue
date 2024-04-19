<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Logotipo de oktan">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Bancos</h2>
    <div>
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" @change="cargarBancos" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option value="" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="banco" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Banco:</label>
        <select id="banco" v-model="bancoSeleccionado" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" :disabled="!dbm">
          <option value="" disabled selected>Seleccione un banco</option>
          <option v-for="(nombre, id) in bancos" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" :disabled="!bancoSeleccionado">

        <input type="time" v-model="horaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" :disabled="!bancoSeleccionado">

        <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" :disabled="!horaInicio">

        <input type="time" v-model="horaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"  style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" :disabled="!horaInicio">

        <button class="boton-filtrar" type="submit" :disabled="!horaFin">Filtrar</button>
      </form>

      <button class="boton-descargar" @click="downloadPDF" :disabled="!horaFin">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel" :disabled="!horaFin">Descargar XLS</button>
    </div>



    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 54%; overflow: auto;">
        <h1>Transacciones Registradas</h1>
          <!-- Nueva tabla para mostrar el Saldo Anterior -->
          <table :class="{ 'saldo-anterior-table': !isDarkMode, 'dark-mode-saldo-anterior-table': isDarkMode }" style="margin-bottom: 2px; text-align: right;">
          <thead>
            <tr>
              <th style="text-align: right;">Saldo Anterior</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="resultados.length > 0"> <!-- Verificamos si hay resultados en la tabla principal -->
              <td style="text-align: right;">${{ (resultados[0].saldo - resultados[0].monto).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            </tr>
            <tr v-else>
              <td colspan="2">No hay transacciones registradas</td>
            </tr>
          </tbody>
        </table>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
          <thead>
            <tr>
              <th>Banco</th>
              <!--<th>id</th>-->
              <th>Descripcion</th>
              <th>Movimiento</th>
              <th>Fecha Contable</th>
              <th>Monto</th>
              <th>Saldo</th>
              
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['banco'] }}</td>
              <!-- <td>{{ adeudo['id_transaccion'] }}</td>-->
              <td>{{ adeudo['descripcion'].length > 45 ? adeudo['descripcion'].slice(0, 45) + '...' : adeudo['descripcion'] }}</td>
              <td><strong>{{ adeudo['id_tipo'] === '1' ? 'Abonos' : (adeudo['id_tipo'] === '2' ? 'Cargos' : 'otro') }}</strong></td>
              <td>{{ adeudo['fecha_contable'] }}</td>
              <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
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
  <div class="right-container" style="flex: 0 0 44%; overflow: auto;">
    <h1>Tablero de Gráficas</h1>
    <h3>Proporcion de Cargos-Abonos</h3>
    <div class="chart-container1">
      <canvas id="polarChart"></canvas>
    </div>
    <div class="chart-container">
      <canvas id="barChart"></canvas>

    <div>
  </div>
    </div>
    <div class="cont-total">
      <h1>Ultima Transaccion del Periodo</h1>
      <table :class="{ 'tabla-totales': !isDarkMode, 'dark-mode-table': isDarkMode }">
        <thead>
          <tr>
            <th>Banco</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(saldo, banco) in totalesPorBanco" :key="banco">
            <td><strong>{{ banco }}</strong></td>
            <td><strong>${{ Number(saldo.ultimoSaldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          </tr>
        </tbody>
      </table>
      <br>
      <h1>Total de Cargos y Abonos por Banco</h1>
      <table :class="{ 'tabla-totales': !isDarkMode, 'dark-mode-table': isDarkMode }">
        <thead>
          <tr>
            <th>Banco</th>
            <th>Abonos</th>
            <th>Cargos</th>
            <th>Diferencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(totales, banco) in totalesPorBanco" :key="banco">
            <td>{{ banco }}</td>
            <td>${{ totales.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>${{ totales.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>${{ totales.saldoFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
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
      isDarkMode: true, // Variable para controlar el modo oscuro
      resultados: [],
      selectedEstacion: null,
      mostrarResultados: false,
      resultadosOriginales: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
      dbm: null,
      totalesPorBanco2: {},
      bancoSeleccionado: null, 
      estaciones: {},
      bancos: {}, 
      porcentajeCuentaNoPagada: 0,
      correlacion: {},
      segmentosClientes: {},
      mostrarAlertas: false,
      horaInicio: '',
    horaFin: ''
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
    async cargarBancos() {
      if (this.dbm) {
        const url = `http://gasserver.dyndns.org:8081/admin/get.php/listabanco?dbm=${this.dbm}`;
        try {
          const response = await axios.get(url);
          this.bancos = response.data.data.reduce((acc, item) => {
            acc[item.id_cuenta] = item.banco;
            return acc;
          }, {});
        } catch (error) {
          console.error("Error al obtener los bancos:", error);
        }
      } else {
        console.error("Por favor, selecciona una estación.");
      }
    },
    async filtrarDatos() {
  if (this.fechaInicio && this.fechaFin && this.dbm) {
    // Asegúrate de usar solo una URL para la solicitud
    const url = `http://gasserver.dyndns.org:8081/admin/get.php/transaccionesbanco`;

    // Concatenar la fecha de inicio y la hora de inicio
    const fechaInicioConHora = `${this.fechaInicio}T${this.horaInicio}:00`;

    const fechaFinConHora = `${this.fechaFin}T12:00:00`;

    const params = {
      fechaInicio: fechaInicioConHora,
      fechaFin: fechaFinConHora,
      dbm: parseInt(this.dbm)
    };

    try {
      const response = await axios.get(url, { params });
      this.resultadosOriginales = response.data.data;
      this.filtrarPorBanco();
      this.calcularTotalesPorBanco();
      this.mostrarResultados = true;
      this.mostrarAlertas = true;
      this.updateChart();
    } catch (error) {
      console.error("Error al obtener datos de la API:", error);
    }
  } else {
    console.error("Por favor, selecciona una estación y proporciona las fechas de inicio y fin.");
  }
},


      filtrarPorBanco() {
      if (this.bancoSeleccionado) {
        this.resultados = this.resultadosOriginales.filter(adeudo => adeudo.id_cuenta === this.bancoSeleccionado);
      } else {
        this.resultados = [...this.resultadosOriginales];
      }
    },
    calcularTotalesPorBanco() {
    const totalesPorBanco = {};
    const porcentajeLimite = 15;
    let alertaMostrada = false; 

    this.resultados.forEach(adeudo => {
        const banco = adeudo.banco;
        const tipo = adeudo.id_tipo;
        const monto = parseFloat(adeudo.monto);
        if (!totalesPorBanco[banco]) {
            totalesPorBanco[banco] = {
                cargos: 0,
                abonos: 0,
                saldo: 0,
                saldoFinal: 0,
                ultimoSaldo: 0,
            };
        }
        if (tipo === '1') {
            totalesPorBanco[banco].abonos += monto;
        } else if (tipo === '2') {
            totalesPorBanco[banco].cargos += monto;
        }
        totalesPorBanco[banco].saldo += parseFloat(adeudo.saldo);
        totalesPorBanco[banco].saldoFinal = Math.abs(totalesPorBanco[banco].abonos - totalesPorBanco[banco].cargos);

        if (adeudo.banco && adeudo.saldo) {
            totalesPorBanco[adeudo.banco].ultimoSaldo = adeudo.saldo;
        }
        const porcentajeCuentaNoPagada = (totalesPorBanco[banco].saldoFinal / totalesPorBanco[banco].cargos) * 100;
        this.porcentajeCuentaNoPagada = porcentajeCuentaNoPagada; 

        if (porcentajeCuentaNoPagada > porcentajeLimite) {
            console.log(`¡Atención! La deuda para el banco ${banco} supera el ${porcentajeLimite}%.`);
            alertaMostrada = true;
        }
    });
    if (!alertaMostrada) {
        console.log("Deuda al banco no supera el 15 porciento.");
    }
    this.totalesPorBanco = totalesPorBanco;
    this.updateChart();
},

updateChart() {
  const ctxPolar = document.getElementById('polarChart').getContext('2d');
  const ctxBar = document.getElementById('barChart').getContext('2d');

  if (this.barChart) {
    this.barChart.destroy();
  }
  if (this.polarChart) {
    this.polarChart.destroy();
  }

  // Colores base para las barras del gráfico polar
  const baseColorsPolar = [
    'rgba(41, 255, 218, 0.4)',
    'rgba(1, 196, 231, 0.4)',
    'rgba(248, 45, 151, 0.4)'
  ];

  // Colores intensos al pasar el cursor para el gráfico polar
  const hoverColorsPolar = [
  'rgba(41, 255, 218, 0.8)',
    'rgba(1, 196, 231, 0.8)',
    'rgba(248, 45, 151, 0.8)'
  ];

  // Colores base para las barras del gráfico de barras
  const baseColorsBar = [
    'rgba(41, 255, 218, 0.4)',
    'rgba(1, 196, 231, 0.4)',
    'rgba(248, 45, 151, 0.4)'   // Naranja
  ];

  // Colores intensos al pasar el cursor para el gráfico de barras
  const hoverColorsBar = [
    'rgba(41, 255, 218, 0.8)',
    'rgba(1, 196, 231, 0.8)',
    'rgba(248, 45, 151, 0.8)'   // Naranja
  ];

  // Colores de los bordes para el gráfico polar
  const borderColorsPolar = [
    'rgba(255, 255, 255, 1)', // Blanco
    'rgba(255, 255, 255, 1)', // Blanco
    'rgba(255, 255, 255, 1)'  // Blanco
  ];

  // Gráfico polar
  this.polarChart = new Chart(ctxPolar, {
    type: 'polarArea',
    data: {
      labels: ['Abonos', 'Cargos', 'Diferencia'],
      datasets: [{
        data: [
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.abonos, 0),
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.cargos, 0),
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.saldoFinal, 0)
        ],
        backgroundColor: baseColorsPolar,
        hoverBackgroundColor: hoverColorsPolar,
        borderColor: borderColorsPolar, // Establecer los colores de borde
        borderWidth: 1 // Establecer el ancho de los bordes
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
          labels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del legend según el modo oscuro
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' // Color de la cuadrícula de fondo
          }
        }
      }
    }
  });


  // Gráfico de barras
  this.barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Abonos', 'Cargos', 'Diferencia'],
      datasets: [{
        data: [
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.abonos, 0),
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.cargos, 0),
          Object.values(this.totalesPorBanco).reduce((acc, curr) => acc + curr.saldoFinal, 0)
        ],
        backgroundColor: baseColorsBar,
        hoverBackgroundColor: hoverColorsBar,
        borderColor: this.isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)', // Establecer el color de los bordes según el modo oscuro
        borderWidth: 1 // Establecer el ancho de los bordes
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
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje x según el modo oscuro
            }
          },
          y: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', // Color de la cuadrícula de fondo
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
        let doc = new jsPDF();

        // Título del reporte con periodo de fechas y banco seleccionado
        const titulo = `Transacciones Bancarias - Estación: ${this.estaciones[this.dbm]}  \n Del (${this.fechaInicio} al ${this.fechaFin})`;
        doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });

        // Encabezado de la tabla de transacciones registradas
        const encabezado = "Transacciones Registradas";
        doc.text(encabezado, 10, 30, { fontSize: 16 });

        // Generar tabla de transacciones registradas
        const transaccionesTableData = [];
        this.resultados.forEach(adeudo => {
          const rowData = [
            adeudo.banco,
            adeudo.descripcion.length > 45 ? adeudo.descripcion.slice(0, 45) + '...' : adeudo.descripcion,
            adeudo.id_tipo === '1' ? 'Abono' : (adeudo.id_tipo === '2' ? 'Cargo' : 'otro'),
            adeudo.fecha_contable,
            `$${parseFloat(adeudo.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `$${parseFloat(adeudo.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ];
          transaccionesTableData.push(rowData);
        });

        // Agregar tabla de transacciones registradas al PDF
        autoTable(doc, {
          head: [['Banco', 'Descripción', 'Movimiento', 'Fecha Contable', 'Monto', 'Saldo']],
          body: transaccionesTableData,
          startY: 40,
          headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
        });

        // Generar tabla de ultima transacción del periodo
        const ultimaTransaccionTableData = [];
        for (const [banco, saldo] of Object.entries(this.totalesPorBanco)) {
          ultimaTransaccionTableData.push([banco, `$${Number(saldo.ultimoSaldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
        }

        // Agregar tabla de ultima transacción del periodo al PDF
        autoTable(doc, {
          head: [['Banco', 'Saldo Final']],
          body: ultimaTransaccionTableData,
          startY: doc.lastAutoTable.finalY + 10,
          headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
        });

        // Generar tabla de total de cargos y abonos por banco
        const totalesTableData = [];
        for (const [banco, totales] of Object.entries(this.totalesPorBanco)) {
          totalesTableData.push([banco, `$${totales.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${totales.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${totales.saldoFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
        }

        // Agregar tabla de total de cargos y abonos por banco al PDF
        autoTable(doc, {
          head: [['Banco', 'Cargos', 'Abonos', 'Diferencia']],
          body: totalesTableData,
          startY: doc.lastAutoTable.finalY + 10,
          headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
        });

        // Footer del PDF
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 2);
        }

        // Agregar el gráfico al final del PDF
        const canvas = document.getElementById('polarChart');
        const imageData = canvas.toDataURL('image/png');
        const imgWidth = 100; // Ancho deseado para la imagen
        const imgHeight = 100; // Altura deseada para la imagen
        const positionX = doc.internal.pageSize.getWidth() - imgWidth - 2; // Alineado a la derecha con un pequeño margen
        const positionY = doc.internal.pageSize.getHeight() - imgHeight - 10; // Posición vertical desde la parte inferior del PDF
        doc.addImage(imageData, 'PNG', positionX, positionY, imgWidth, imgHeight);

        // Guardar el PDF
        doc.save('Reporte_Transacciones_Bancarias.pdf');
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
  height: 600px;
  margin-left: 5px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.chart-container1 {
  width: 90%;
  height: 700px;
  margin-left: 100px;
  margin-right: 10px;
  margin-bottom: 100px;
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
  width: 100pxs;
}

.table:hover {
  transform: translateY(-0.3rem);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.tabla-totales {
  width: 800px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 100px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-0.03rem)scale(1.01);
  
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