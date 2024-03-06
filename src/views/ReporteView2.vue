<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Bancos</h2>
    <form @submit.prevent="filtrarDatos">
    <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
    <input type="date" v-model="fechaInicio" maxlength="10" style="margin-right:10px; width: 150px;height: 30px;">

    <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
    <input type="date" v-model="fechaFin" maxlength="10" style="margin-right:10px; width: 150px; height: 30px;">

    <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

    <table class="table">
      <thead>
        <tr>
          <!--<th>ID Transaccion</th>-->
          <!--<th>ID Cuenta</th>-->
          <th>Fecha Contable</th>
          <!--<th>Monto</th>-->
          <th>Saldo</th>
          <!-- <th>Descripcion</th>-->
          <th>Status</th>
          <th>Banco</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <!--<td>{{ adeudo['id_transaccion'] }}</td>-->
          <!--<td>{{ adeudo['id_cuenta'] }}</td>-->
          <td>{{ adeudo['fecha_contable'] }}</td>
           <!--<td>{{ adeudo['monto'] }}</td>-->
           <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <!--<td>{{ adeudo['descripcion'] }}</td>-->
          <td>{{ adeudo['estado'] }}</td>
          <td>{{ adeudo['banco'] }}</td>
        </tr>
      </tbody>
    </table>
    <br>
    <div class="content-container">
    <div class="chart-container">
        <canvas id="myChart"></canvas>
      </div>
    <!-- Nueva tabla con las sumas totales -->
    <div class="table-container">
    <table class="tabla-totales">
      <thead>
        <tr>
        <th>Banco</th>
        <th>Saldo Final</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(saldo, banco) in totalesPorBanco" :key="banco">
          <td>{{ banco }}</td>
          <td>${{ Number(saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  </div>
</template>

<script>
import axios from "axios";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      resultados: [],
      resultadosOriginales: [],
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
    };
  },
  computed: {
    totalCargo() {
      return this.resultados.reduce((total, adeudo) => total + Number(adeudo.cargo), 0);
    },
    totalAbono() {
      return this.resultados.reduce((total, adeudo) => total + Number(adeudo.abono), 0);
    },
    totalSaldo() {
      return this.resultados.reduce((total, resu) => total + Number(resu.cargo) - Number(resu.abono), 0);
    }
  },
  methods: {
    filtrarDatos() {
      if (this.fechaInicio && this.fechaFin) {
        const url = "http://189.165.26.146:8081/admin/get.php/transaccionesbanco";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        };

        axios
          .get(url, { params })
          .then((response) => {
            this.resultadosOriginales = response.data.data;
            this.resultados = [...this.resultadosOriginales];
            this.calcularUltimoSaldoPorBanco();
          })
          .catch((error) => {
            console.error("Error al obtener datos de la API:", error);
          });
      } else {
        this.resultados = [];
        this.totalesPorBanco = {};
      }
    },
    calcularUltimoSaldoPorBanco() {
      this.totalesPorBanco = this.resultados.reduce((totales, adeudo) => {
        if (adeudo['banco'] && adeudo['saldo']) {
          totales[adeudo['banco']] = adeudo['saldo'];
        }
        return totales;
      }, {});
      this.updateChart();
    },
    updateChart() {
      if (this.myChart) {
        this.myChart.destroy();
      }
      this.generateChart();
    },
    generateChart() {
      var bancos = Object.keys(this.totalesPorBanco);
      var saldos = Object.values(this.totalesPorBanco);
      var ctx = document.getElementById('myChart').getContext('2d');
      
      this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: bancos,
              datasets: [{
                  label: `Saldo por Banco del ${this.fechaInicio} al ${this.fechaFin}`,
                  data: saldos,
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
    },
    downloadPDF() {
      const pdfOptions = {
        orientation: "portrait",
        unit: "mm",
        format: "letter",
      };

      const doc = new jsPDF(pdfOptions);

      html2canvas(this.$el, { scale: 3 })
        .then(canvas => {
          let imgData = canvas.toDataURL('image/jpeg', 0.1);

          let imgWidth = 200;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;

          let marginLeft = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
          let marginTop = 10;

          doc.addImage(imgData, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);

          doc.save('informe_financiero_SaldosBancos.pdf');
        })
        .catch(error => {
          console.error('Error al capturar la representación gráfica de la tabla:', error);
        });
    },
    async exportExcel() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      const tables = this.$el.querySelectorAll('table');

      let rowIndex = 1;

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];

        // Convertir la tabla HTML a un array de arrays
        const data = Array.from(table.querySelectorAll('tr')).map(tr =>
          Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText)
        );

        // Agregar los datos a la hoja de Excel
        data.forEach((row, localRowIndex) => {
          row.forEach((value, colIndex) => {
            const cell = worksheet.getCell(rowIndex + localRowIndex, colIndex + 1);
            cell.value = value;

            // Aplicar negrita a los encabezados de cada columna
            if (localRowIndex === 0) {
              cell.font = { bold: true };
            }

            // Ajustar el ancho de las columnas específicas
            if (colIndex === 0) {
              worksheet.getColumn(colIndex + 1).width = 50; // Primera columna
            } else if (colIndex === 1 || colIndex === 2 || colIndex === 3) {
              worksheet.getColumn(colIndex + 1).width = 20; // todas las demas columnas
            }
          });
        });

        rowIndex += data.length + 1; // Dejar una fila vacía entre las tablas
      }

      // Guardar el libro de trabajo como un archivo .xlsx
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'informeFinacieroSaldosBancos.xlsx';
      a.click();
    },
  }
};
</script>






<style scoped>
.content-container {
  display: flex;
  justify-content: space-between;
}

.chart-container {
  width: 50%;
  height: 500px;
  margin-left: 50px;
}

.table-container {
  width: 50%;
}
  /* Estilos para las etiquetas de fecha */
  label[for="fechaInicio"], label[for="fechaFin"] {
    font-family: "Arial", sans-serif; /* Cambiar la fuente */
    font-size: 20px; /* Cambiar el tamaño de fuente */
  }

table {
  width: 90%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  
}
.tabla-totales {
  width: 700px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 70px;
  
  
}


td:first-child {
  /* Establece el ancho de la primera columna */
  width: 300px;  /* Ajusta este valor según tus necesidades */
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
}
.boton-descargar:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
}

.boton-descargar:active {
  transform: scale(1.05); /* Aumentar un poco el tamaño al hacer clic */
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
}
.boton-filtrar:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
}

.boton-filtrar:active {
  transform: scale(1.2); /* Aumentar un poco el tamaño al hacer clic */
}
</style>

