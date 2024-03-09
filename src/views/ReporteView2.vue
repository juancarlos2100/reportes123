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
          <th>Fecha Contable</th>
          <th>Saldo</th>
          <th>Status</th>
          <th>Banco</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <td>{{ adeudo['fecha_contable'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
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
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      resultados: [],
      resultadosOriginales: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
    };
  },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin) {
        const url = "http://192.168.1.90/admin/get.php/transaccionesbanco";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data;
          this.resultados = [...this.resultadosOriginales];
          this.calcularUltimoSaldoPorBanco();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
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
      const bancos = Object.keys(this.totalesPorBanco);
      const saldos = Object.values(this.totalesPorBanco);
      const ctx = document.getElementById('myChart').getContext('2d');
      
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
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' } 
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

