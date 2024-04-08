<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <div>
    <form @submit.prevent="filtrarDatos">

      <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
      <select id="estacion" v-model="dbm" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
      </select>

      <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
      
      <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">


      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

    </div>
    
    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
        <h1>Transacciones Registradas</h1>
        <table class="table">
          <thead>
            <tr>
              <th>Folio-Factura</th>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Cargo</th>
              <th>Abono</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['folio'] }}</td>
              <td>{{ adeudo['nombre'] }}</td>
              <td>{{ adeudo['fecha_creacion'] }}</td>
              <td>${{ parseFloat(adeudo['cargo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['abono']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
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
        <div class="chart-container">
          <canvas id="myPieChart"></canvas>
        </div>
        <!-- Nuevo gráfico de pastel (chart2) -->
        <div class="cont-total">
          <h1>Total por Proveedor</h1>
            <table class="tabla-totales">
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
import ExcelJS from 'exceljs'


export default {
  data() {
    return {
      resultados: [],
      resultadosOriginales: [], // Nuevo atributo
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      dbm: null, // Nuevo atributo para la estación
      estaciones: {},
      totalesPorNombre: {},
      mostrarResultados: false
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
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = "http://192.168.1.68/admin/get.php/saldospipas";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data;
          this.resultados = [...this.resultadosOriginales];
          this.calcularTotalesPorNombre();
          this.mostrarResultados = true;
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        // Manejo si no se selecciona una estación o no se proporcionan fechas
        this.resultados = [];
        this.mostrarResultados = false;
      }
    },
    calcularTotalesPorNombre() {
    this.totalesPorNombre = this.resultados.reduce((totales, adeudo) => {
      const nombre = adeudo['nombre'];
      if (!totales[nombre]) {
        totales[nombre] = { cargos: 0, abonos: 0, diferencia: 0, saldo: 0 };
      }
      totales[nombre].cargos += Math.abs(Number(adeudo['cargo']));
      totales[nombre].abonos += Number(adeudo['abono']);
      totales[nombre].saldo += Number(adeudo['saldo']);
      totales[nombre].diferencia = Math.abs(totales[nombre].abonos - totales[nombre].cargos);
      return totales;
    }, {});
    this.updateChart();
  },
    updateChart() {
      const ctx = document.getElementById('myPieChart').getContext('2d');

      if (this.myPieChart) {
          this.myPieChart.destroy();
      }

      // Colores base para las barras
      const baseColors = [
          'rgba(54, 162, 235, 0.3)',
          'rgba(255, 99, 132, 0.3)',
          'rgba(75, 192, 192, 0.3)'
      ];

      // Colores intensos al pasar el cursor
      const hoverColors = [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)'
      ];

      const nombres = Object.keys(this.totalesPorNombre);
      const cargos = nombres.map(nombre => this.totalesPorNombre[nombre].cargos);
      const abonos = nombres.map(nombre => this.totalesPorNombre[nombre].abonos);
      const diferencia = nombres.map(nombre => this.totalesPorNombre[nombre].diferencia);

      this.myPieChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: nombres,
              datasets: [{
                      label: 'Cargos',
                      data: cargos,
                      backgroundColor: baseColors[0],
                      hoverBackgroundColor: hoverColors[0],
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1
                  },
                  {
                      label: 'Abonos',
                      data: abonos,
                      backgroundColor: baseColors[1],
                      hoverBackgroundColor: hoverColors[1],
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 1
                  },
                  {
                      label: 'Diferencia',
                      data: diferencia,
                      backgroundColor: baseColors[2],
                      hoverBackgroundColor: hoverColors[2],
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                  }
              ]
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
    async downloadPDF() {
    let doc = new jsPDF();
    
    // Título del reporte con periodo de fechas
    const titulo = `Saldos Proveedores - Estación: ${this.estaciones[this.dbm]}  \n Del (${this.fechaInicio} al ${this.fechaFin})`;
    doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });


    // Tabla de Transacciones Registradas
    const transaccionesTableData = [];
    for (const adeudo of this.resultados) {
      const rowData = [
        adeudo.folio,
        adeudo.nombre,
        adeudo.fecha_creacion,
        `$${parseFloat(adeudo.cargo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        `$${parseFloat(adeudo.abono).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        `$${parseFloat(adeudo.saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
      ];
      transaccionesTableData.push(rowData);
    }

    // Agregar tabla de Transacciones Registradas al PDF
    autoTable(doc, {
      head: [['Folio-Factura', 'Nombre', 'Fecha', 'Cargo', 'Abono', 'Saldo']],
      body: transaccionesTableData,
      startY: 20,
      headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
    });

    // Tabla de Total por Proveedor
    const totalesTableData = [];
    for (const [nombre, total] of Object.entries(this.totalesPorNombre)) {
      totalesTableData.push([nombre, `$${total.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${total.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${total.diferencia.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
    }

    // Agregar tabla de Total por Proveedor al PDF
    autoTable(doc, {
      head: [['Nombre', 'Cargos', 'Abonos', 'Diferencia']],
      body: totalesTableData,
      startY: doc.lastAutoTable.finalY + 20, // Aumentar el espacio entre las tablas
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
    const canvas = document.getElementById('myPieChart');
    const imageData = canvas.toDataURL('image/png');
    const imgWidth = 110; // Ancho deseado para la imagen
    const imgHeight = 60; // Altura deseada para la imagen
    const positionX = doc.internal.pageSize.getWidth() - imgWidth - 10; // Alineado a la derecha con un pequeño margen
    const positionY = doc.internal.pageSize.getHeight() - imgHeight - 10; // Posición vertical desde la parte inferior del PDF
    doc.addImage(imageData, 'PNG', positionX, positionY, imgWidth, imgHeight);

    // Guardar el PDF
    doc.save('Reporte_Saldos_Proveedores.pdf');
    },

    exportExcel() {
  this.$nextTick(async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    let rowIndex = 1;

    // Agregar el título del reporte
    const titulo = `Saldos Proveedores - Estación: ${this.estaciones[this.dbm]} (ID: ${this.dbm}) \n Del (${this.fechaInicio} al ${this.fechaFin})`;
    const titleCell = worksheet.getCell(rowIndex, 1);
    titleCell.value = titulo;
    titleCell.font = { bold: true, size: 14 }; // Hacer el título negrita y un poco más grande
    rowIndex += 2; // Dejar dos filas vacías entre el título y la tabla

    // Obtener las tablas de la vista
    const tables = this.$el.querySelectorAll('.tabla-totales');

    // Iterar sobre cada tabla y agregarla al documento Excel
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      // Convertir la tabla HTML a un array de arrays
      const data = Array.from(table.querySelectorAll('tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
      );

      // Agregar los datos a la hoja de Excel
      data.forEach(row => {
        row.forEach((value, colIndex) => {
          const cell = worksheet.getCell(rowIndex, colIndex + 1);
          cell.value = value;

          // Aplicar negrita a los encabezados de cada columna
          if (rowIndex === 1) {
            cell.font = { bold: true };
          }

          // Ajustar el ancho de las columnas específicas
          if (colIndex === 0) {
            worksheet.getColumn(colIndex + 1).width = 30; // Primera columna
          } else {
            worksheet.getColumn(colIndex + 1).width = 20; // Todas las demás columnas
          }
        });
        rowIndex++;
      });

      rowIndex++; // Dejar una fila vacía entre las tablas
    }

    // Guardar el libro de trabajo como un archivo .xlsx
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informe_proveedores.xlsx';
    a.click();
  });
},



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
</style>


