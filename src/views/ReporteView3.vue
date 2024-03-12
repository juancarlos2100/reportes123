<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">


      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="downloadPDF">Descargar XLS</button>
    
    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
        <table class="table">
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
        <br>
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
              <td><strong>${{ parseFloat(total.saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
              <td><strong>{{ nombre }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Lado derecho -->
      <div class="right-container" style="flex: 0 0 45%; overflow: auto;">
        <div class="chart-container">
          <canvas id="myChart"></canvas>
        </div>
        <!-- Nuevo gráfico de pastel (chart2) -->
        <div class="chart-container">
          <canvas id="myPieChart"></canvas>
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
      resultadosOriginales: [], // Nuevo atributo
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      totalesPorNombre: {},
    };
  },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin) {
        const url = "https://sistemas-oktan.com/admin/get.php/saldospipas";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data;
          this.resultados = [...this.resultadosOriginales];
          this.calcularTotalesPorNombre();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        this.resultados = [...this.resultadosOriginales];
        this.calcularTotalesPorNombre();
      }
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
  const nombres = Object.keys(this.totalesPorNombre);
  const saldos = Object.values(this.totalesPorNombre).map(total => Math.abs(total.saldo));
  
  const ctx = document.getElementById('myChart').getContext('2d');

  // Define una matriz de colores para cada rebanada
  const colores = [
    'rgba(255, 100, 10, 0.4)',
    'rgba(0, 207, 24, 0.4)',
    'rgba(255, 183, 0, 0.4)',
    // Añade más colores según sea necesario
  ];

  // Define una matriz de colores de resaltado para cada rebanada
  const coloresResaltados = [
    'rgba(255, 100, 10, 0.7)',
    'rgba(0, 207, 24, 0.7)',
    'rgba(255, 228, 196, 0.5)',
    // Añade más colores de resaltado según sea necesario
  ];

  // Gráfico de barras
  this.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: nombres,
      datasets: [{
        label: `Periodo del  ${this.fechaInicio} al ${this.fechaFin}`,
        data: saldos,
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.4', '1')), // Ajusta la opacidad para los bordes
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
          text: 'Pipas por Pagar'
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
      labels: nombres,
      datasets: [{
        label: `Saldo por Nombre del ${this.fechaInicio} al ${this.fechaFin}`,
        data: saldos,
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.4', '1')), // Ajusta la opacidad para los bordes
        borderWidth: 1,
        hoverBackgroundColor: coloresResaltados,
        hoverBorderColor: coloresResaltados.map(color => color.replace('0.5', '1')), // Ajusta la opacidad para los bordes de resaltado
        hoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Preveedores de Combustible'
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
  doc.text('Reporte Operativo', doc.internal.pageSize.getWidth() / 2, yOffset, { align: 'center', fontStyle: 'bold' });
  doc.text('Saldos Proveedores', doc.internal.pageSize.getWidth() / 2, yOffset + 10, { align: 'center' });
  doc.text('Pipas por pagar', doc.internal.pageSize.getWidth() / 2, yOffset + 20, { align: 'center' });
  doc.text(`Del:  ${this.fechaInicio} al:  ${this.fechaFin}`, doc.internal.pageSize.getWidth() / 2, yOffset + 30, { align: 'center', fontSize: 12 });

  // Generar tabla de saldos de proveedores
  const tableData = [];
  this.resultados.forEach(adeudo => {
    const rowData = [
      adeudo.folio,
      `$${parseFloat(adeudo.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      adeudo.fecha_creacion,
      adeudo.nombre
    ];
    tableData.push(rowData);
  });

  // Agregar tabla de saldos de proveedores al PDF
  autoTable(doc, {
    head: [['Folio-Factura', 'Saldo', 'Fecha', 'Nombre']],
    body: tableData,
    startY: yOffset + 50,
    headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
  });

  // Generar tabla de sumas totales por nombre
  const totalTableData = [];
  for (const [nombre, total] of Object.entries(this.totalesPorNombre)) {
    totalTableData.push([total.factura.toFixed(2), `$${parseFloat(total.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, nombre]);
  }

  // Agregar tabla de sumas totales por nombre al PDF
  autoTable(doc, {
    head: [['Factura', 'Importe', 'Pipas por pagar']],
    body: totalTableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' }
  });

  // Generar gráfico

  

  // Footer del PDF
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 10);
  }

  // Guardar el PDF
  doc.save('Reporte_Saldos_Proveedores.pdf');
}



 

    // ...resto de métodos...
  },
};
</script>




<style scoped>
.content-container {
  display: flex;
  justify-content: space-between;
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
  width: 90%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
}
.table:hover {
  transform: translateY(-0.3rem);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.tabla-totales {
  width: 850px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 70px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-1rem)scale(1.06);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.6);
}

.tabla-totales th,
.tabla-totales td {
  padding: 15px; /* Ajusta el relleno de las celdas según sea necesario */
  font-size: 17px; /* Ajusta el tamaño de la fuente según sea necesario */
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
</style>


