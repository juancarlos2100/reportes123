<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Efectivo por depositar</h2>
    <form @submit.prevent="filtrarDatos"> 
      <label for="idTurno" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno:</label>
      <input type="text" v-model="idTurno" style="margin-right:10px;">

      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="downloadPDF">Descargar XLS</button>
    <table>
      <thead>
        <tr>
          <!--<th>ID Proveedor</th>-->
          <!--<th>Estatus</th>-->
          <th>id_turno</th>
          <th>Fecha</th>
          <th>monto</th>
          <th>monto depositado</th>
          <!--<th>forma_pago</th>-->
          <th>diferencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <td>{{ adeudo['id_turno'] }}</td>
          <td>{{ adeudo['fecha'] }}</td>
          <td>{{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['monto_depositado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
    <table class="tabla-totales">
      <thead>
        <tr>
          <th>Efectivo por depositar</th> <!-- Cambiado 'Factura' por 'Efectivo por depositar' -->
          <th>Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosFiltrados" :key="index">
          <td>{{ adeudo['id_turno'] }}</td> <!-- Cambiado 'total.factura.toFixed(2)' por 'adeudo['id_turno']' -->
          <td>${{ adeudo['diferencia'] }}</td> <!-- Cambiado 'total.saldo.toFixed(2)' por 'adeudo['diferencia']' -->
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td>${{ totalImporte.toFixed(2) }}</td> <!-- Nueva fila para el total -->
        </tr>
      </tbody>
    </table>
    <div style="display: flex; justify-content: center; width: 25%; height: 25%;">
      <div style="width: 120%; height: 120%;">
        <canvas id="myChartPositive"></canvas>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
//import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      resultados: [],
      resultadosFiltrados: [], // Nueva propiedad de datos
      fechaInicio: null,
      fechaFin: null,
      totalImporte: 0,

    };
  },
  mounted() {
    axios
        .get("https://sistemas-oktan.com/admin/get.php/depositoefectivo")
        .then((response) => {
          this.resultados = response.data.data.map(resu => {
            return {
              ...resu,
              id_turno: resu.id_turno || 'NULL'
            };
          });
          console.log(this.resultados);
          this.generateChart();
        })
  .catch((error) => {
    console.error("Error al obtener datos de la API:", error);
  });
  },
  methods: {
    filtrarDatos() {
      this.resultadosFiltrados = this.resultados; // Usa la propiedad de datos en lugar de una variable local

      if (this.idTurno) {
        // Filtrar por id_turno
        this.resultadosFiltrados = this.resultadosFiltrados.filter(adeudo => adeudo['id_turno'] === this.idTurno);
      } else if (this.fechaInicio && this.fechaFin) {
        // Filtrar por fecha
        this.resultadosFiltrados = this.resultadosFiltrados.filter(adeudo => {
          const fechaContable = new Date(adeudo['fecha']); // Cambiado 'fecha_contable' por 'fecha'
          const fechaInicio = new Date(this.fechaInicio);
          const fechaFin = new Date(this.fechaFin);
          return fechaContable >= fechaInicio && fechaContable <= fechaFin;
        });
      }

      // Calcula el total de los importes filtrados
      this.totalImporte = this.resultadosFiltrados.reduce((total, adeudo) => total + parseFloat(adeudo['diferencia']), 0);
    },
      calcularTotalImporte(resultados) {
      return resultados.reduce((total, adeudo) => total + parseFloat(adeudo['diferencia']), 0);
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

          doc.save('informe_financiero.pdf');
        })
        .catch(error => {
          console.error('Error al capturar la representación gráfica de la tabla:', error);
        });
    },
    exportExcel() {
        this.$nextTick(async () => {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Sheet1');
          const tables = this.$el.querySelectorAll('table');

          let rowIndex = 1;

          const headers = this.$el.querySelectorAll('h1');
          headers.forEach(header => {
            const titleCell = worksheet.getCell(rowIndex, 1);
            titleCell.value = header.textContent.trim();
            titleCell.font = { bold: true, size: 14 }; // Hacer el título negrita y un poco más grande
            rowIndex++;
          });

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
          a.download = 'informe_financieroOKTAN.xlsx';
          a.click();
        });
      },



    // ...resto de métodos...
  },
};
</script>



<style scoped>
#chartContainer {
  display: flex;
  justify-content: center;
  align-items: left;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
}
.tabla-totales {
  width: 700px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 0;
  
  
}


td:first-child {
  /* Establece el ancho de la primera columna */
  width: 200px;  /* Ajusta este valor según tus necesidades */
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
</style>

