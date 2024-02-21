<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <h3> Pipas por pagar</h3>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
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
          <!--<th>Factura</th>-->
          <th>Folio-Factura</th>
          <th>Saldo</th>
          <th>Fecha</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <!--<td>{{ adeudo['id_proveedor'] }}</td>-->
          <!--<td>{{ adeudo['estatus'] }}</td>-->
          <!--<td>{{ adeudo['id_factura'] }}</td>-->
          <td>{{ adeudo['folio'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <td>{{ adeudo['nombre'] }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
    <table class="tabla-totales">
  <thead>
    <tr>
      <th>Factura</th>
      <th>Importe</th>
      <th>Pipas por pagar</th> <!-- Nueva columna -->
    </tr>
  </thead>
  <tbody>
    <tr v-for="(total, nombre) in totalesPorNombre" :key="nombre">
      <td>{{ total.factura.toFixed(2) }}</td> <!-- Valor de la factura -->
      <td>${{ parseFloat(total.saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
      <td>{{ nombre }}</td>
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
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      totalesPorNombre: {}, // Nuevo atributo
    };
  },
  mounted() {
    axios
      .get("https://sistemas-oktan.com/admin/get.php/saldospipas")
      .then((response) => {
        this.resultados = response.data.data;
        console.log(this.resultados);
        this.calcularTotalesPorNombre();
        this.generateChart();
      })
      .catch((error) => {
        console.error("Error al obtener datos de la API:", error);
      });
  },
  methods: {
    filtrarDatos() {
      let resultadosFiltrados = this.resultados;

      if (this.idTipo) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['id_proveedor'] === this.idTipo);
      } else if (this.estatus) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['estatus'].toLowerCase() === this.estatus.toLowerCase());
      } else if (this.fechaInicio && this.fechaFin) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => {
          const fechaCreacion = new Date(adeudo['fecha_creacion']);
          const fechaInicio = new Date(this.fechaInicio);
          const fechaFin = new Date(this.fechaFin);
          return fechaCreacion >= fechaInicio && fechaCreacion <= fechaFin;
        });
      }

      this.resultados = resultadosFiltrados;
      this.calcularTotalesPorNombre();
    },
    calcularTotalesPorNombre() {
      this.totalesPorNombre = this.resultados.reduce((totales, adeudo) => {
        const nombre = adeudo['nombre'];
        if (!totales[nombre]) {
          totales[nombre] = { saldo: 0, factura: 0 };
        }
        totales[nombre].saldo += Number(adeudo['saldo']);
        totales[nombre].factura += Number(adeudo['id_factura']); // Asume que 'id_factura' es el valor de la factura
        return totales;
      }, {});
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


