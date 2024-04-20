<template>
   <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <div>
      <form @submit.prevent="filtrarDatos">
      <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
      <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required>
        <option disabled value="">Selecciona una estación</option>
        <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
      </select>

      <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio"  class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required :disabled="!dbm">

      <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin"  class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required :disabled="!fechaInicio">

      <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>

    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

    </div>
    
    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
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
        <h3>Proporción de Cargos-Abonos</h3>
        <div class="chart-container">
          <canvas id="myBarChart"></canvas>
        </div>
        <!-- Nuevo gráfico de pastel (chart2) -->
        <div class="chart-container">
          <h3>Estadistica por Semana</h3>
          <canvas id="myLineChart"></canvas>
        </div>
        <div class="cont-total">
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
          fechaInicio: `${this.fechaInicio}T00:00:00`,
          fechaFin: `${this.fechaFin}T12:00:00`,
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
    const ctxBar = document.getElementById('myBarChart').getContext('2d');
    const ctxLine = document.getElementById('myLineChart').getContext('2d');

    if (this.myBarChart) {
      this.myBarChart.destroy();
    }
    if (this.myLineChart) {
      this.myLineChart.destroy();
    }

    // Colores neón base para las barras
    const neonBaseColors = [
      'rgba(255, 0, 0, 0.3)',    // Rojo
      'rgba(0, 255, 0, 0.3)',    // Verde
      'rgba(0, 0, 255, 0.3)'     // Azul
    ];

    // Colores neón al pasar el cursor
    const neonHoverColors = [
      'rgba(255, 0, 0, 0.6)',    // Rojo
      'rgba(0, 255, 0, 0.6)',    // Verde
      'rgba(0, 0, 255, 0.6)'     // Azul
    ];

    // Colores de borde neón
    const neonBorderColors = [
      'rgba(255, 0, 0, 1)',      // Rojo
      'rgba(0, 255, 0, 1)',      // Verde
      'rgba(0, 0, 255, 1)'       // Azul
    ];

    // Gráfico de barras
    this.myBarChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: Object.keys(this.totalesPorNombre),
        datasets: [{
            label: 'Cargos',
            data: Object.values(this.totalesPorNombre).map(totales => totales.cargos),
            backgroundColor: neonBaseColors[0],
            hoverBackgroundColor: neonHoverColors[0],
            borderColor: neonBorderColors[0],
            borderWidth: 1
          },
          {
            label: 'Abonos',
            data: Object.values(this.totalesPorNombre).map(totales => totales.abonos),
            backgroundColor: neonBaseColors[1],
            hoverBackgroundColor: neonHoverColors[1],
            borderColor: neonBorderColors[1],
            borderWidth: 1
          },
          {
            label: 'Diferencia',
            data: Object.values(this.totalesPorNombre).map(totales => totales.diferencia),
            backgroundColor: neonBaseColors[2],
            hoverBackgroundColor: neonHoverColors[2],
            borderColor: neonBorderColors[2],
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
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
          x: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.1)' // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje x según el modo oscuro
            }
          },
          y: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.1)' // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje y según el modo oscuro
            }
          }
        }
      }
    });


    // Agrupar los registros por semana
    const dataPorSemana = this.agruparPorSemana(this.resultados);

    // Gráfico de líneas
    this.myLineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: dataPorSemana.map(semana => semana.fechaInicio),
        datasets: [{
            label: 'Cargos',
            data: dataPorSemana.map(semana => semana.cargos.reduce((acc, curr) => acc + curr, 0)),
            borderColor: 'rgba(255, 0, 0, 0.6)', // Rojo
            backgroundColor: 'transparent',
            pointRadius: 8,
            pointHoverRadius: 10,
            hoverBackgroundColor: 'rgba(255, 0, 0, 0.8)', // Rojo
            fill: false
          },
          {
            label: 'Abonos',
            data: dataPorSemana.map(semana => semana.abonos.reduce((acc, curr) => acc + curr, 0)),
            borderColor: 'rgba(0, 255, 0, 0.6)', // Verde
            backgroundColor: 'transparent',
            pointRadius: 8,
            pointHoverRadius: 10,
            hoverBackgroundColor: 'rgba(0, 255, 0, 0.8)', // Verde
            fill: false
          },
          
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Relación Cargo-Abono',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
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
          x: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.1)', // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje x según el modo oscuro
            }
          },
          y: {
            grid: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.1)', // Color de la cuadrícula de fondo
            },
            ticks: {
              color: this.isDarkMode ? '#ffffff' : '#000000' // Color de las etiquetas del eje y según el modo oscuro
            }
          }
        }
      }
    });

  },


agruparPorSemana(resultados) {
  // Ordenar los resultados por fecha de creación
  const resultadosOrdenados = resultados.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
  
  // Obtener la fecha de inicio y fin del primer y último registro
  const primeraFecha = new Date(resultadosOrdenados[0].fecha_creacion);
  const ultimaFecha = new Date(resultadosOrdenados[resultadosOrdenados.length - 1].fecha_creacion);

  // Inicializar el arreglo de semanas
  const semanas = [];

  // Recorrer desde la primera fecha hasta la última fecha, agrupando por semana
  let semanaInicio = new Date(primeraFecha);
  while (semanaInicio <= ultimaFecha) {
    // Obtener la fecha de fin de la semana (7 días después)
    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaFin.getDate() + 6);

    // Filtrar los resultados para obtener solo los que están en esta semana
    const resultadosSemana = resultadosOrdenados.filter(resultado => {
      const fechaResultado = new Date(resultado.fecha_creacion);
      return fechaResultado >= semanaInicio && fechaResultado <= semanaFin;
    });

    // Calcular los cargos y abonos de la semana
    const cargosSemana = resultadosSemana.map(resultado => Math.abs(Number(resultado.cargo)));
    const abonosSemana = resultadosSemana.map(resultado => Number(resultado.abono));

    // Agregar los totales de la semana al arreglo de semanas
    semanas.push({
      fechaInicio: semanaInicio.toLocaleDateString(),
      fechaFin: semanaFin.toLocaleDateString(),
      cargos: cargosSemana,
      abonos: abonosSemana
    });

    // Mover la fecha de inicio a la próxima semana
    semanaInicio.setDate(semanaInicio.getDate() + 7);
  }

  return semanas;
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
        const canvas = document.getElementById('myLineChart');
        const imageData = canvas.toDataURL('image/png');
        const imgWidth = 110; // Ancho deseado para la imagen
        const imgHeight = 60; // Altura deseada para la imagen
        let positionX = doc.internal.pageSize.getWidth() - imgWidth - 10; // Alineado a la derecha con un pequeño margen
        let positionY = doc.internal.pageSize.getHeight() - imgHeight - 10; // Posición vertical desde la parte inferior del PDF

        // Calcular el espacio restante en la página actual
        const espacioRestante = doc.internal.pageSize.getHeight() - positionY;

        // Verificar si hay suficiente espacio para la imagen
        if (espacioRestante < imgHeight) {
            // Si no hay suficiente espacio, ir a la siguiente página
            doc.addPage();
            // Ajustar la posición Y para colocar la imagen en la parte superior de la página
            positionY = 10;
        }

        // Agregar el gráfico al PDF
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


