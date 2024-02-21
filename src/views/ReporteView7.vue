<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Inventario Aceites</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="idTurno" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno:</label>
      <input type="text" v-model="idTurno" style="margin-right:10px;">

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
          <th>id_Producto</th>
          <th>id_turno</th>
          <th>Nombre</th>
          <th>cantidad</th>
          <th>precio</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(aceite, index) in resultados" :key="index">
          <td>{{ aceite['id_producto'] }}</td>
          <td>{{ aceite['id_turno'] }}</td>
          <td>{{ aceite['nombre'] }}</td>
          <td>{{ aceite['cantidad'] }}</td>
          <td>${{ aceite['precio'] }}</td>
          <td>{{ aceite['total'] }}</td>
        </tr>
      </tbody>
    </table>
    <br>
    <table class="tabla-totales" v-if="totales !== null">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <!-- Utiliza los resultados filtrados para mostrar la información en la tabla -->
      <tr v-for="(aceite, index) in resultadosFiltrados" :key="index">
        <td>{{ aceite['nombre'] }}</td>
        <td>{{ aceite['cantidad'] }}</td>
        <td>${{ aceite['precio'] }}</td>
        <td>{{ aceite['total'] }}</td>
      </tr>
      <!-- Añade una nueva fila al final para mostrar la suma total de la columna 'total' -->
      <tr>
        <td><strong>Total</strong></td>
        <td style="color: white;">{{ totales.cantidad.toFixed(2) }}</td>
        <td style="color: white;">${{ totales.precio.toFixed(2) }}</td>
        <td><strong>${{ totales.total.toFixed(2) }}</strong></td>
      </tr>
    </tbody>
  </table>
    

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
      resultadosFiltrados: [],
      idTurno: null,
      totales: { cantidad: 0, precio: 0, total: 0 },
    };
  },
  mounted() {
    this.fetchData(); // Llama a fetchData cuando el componente se monta
  },
  methods: {
    fetchData() {
      axios
        .get("https://sistemas-oktan.com/admin/get.php/invaceites")
        .then((response) => {
          this.resultados = response.data.data;
          console.log(this.resultados);
          this.calcularTotales(); 
        })
        .catch((error) => {
          console.error("Error al obtener datos de la API:", error);
        });
    },
    filtrarDatos() {
      if (this.idTurno) {
        this.resultadosFiltrados = this.resultados.filter(
          (resultado) => resultado.id_turno === this.idTurno
        );
        this.calcularTotales();
      } else {
        this.fetchData(); // Si idTurno está vacío, vuelve a buscar todos los datos
      }
    },
    calcularTotales() {

      this.totales = { cantidad: 0, precio: 0, total: 0 };

      // Calcula los totales 
      this.resultadosFiltrados.forEach((aceite) => {
        this.totales.cantidad += parseFloat(aceite.cantidad);
        this.totales.precio += parseFloat(aceite.precio);
        this.totales.total += parseFloat(aceite.total);
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



