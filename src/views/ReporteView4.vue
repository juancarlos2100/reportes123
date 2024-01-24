<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <button @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <th>ID Adeudo</th>
          <th>Serie</th>
          <th>Folio</th>
          <th>Fecha Creación</th>
          <th>Cargo</th>
          <th>Abono</th>
          <th>Saldo</th>
          <th>Vencimiento</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(resu, index) in resultados" :key="index">
          <td>{{ resu['id_adeudo'] }}</td>
          <td>{{ resu['serie'] }}</td>
          <td>{{ resu['folio'] }}</td>
          <td>{{ resu['fecha_creacion'] }}</td>
          <td>{{ resu['cargo'] }}</td>
          <td>{{ resu['abono'] }}</td>
          <td>{{ resu['saldo'] }}</td>
          <td>{{ resu['vencimiento'] }}</td>
          <td>{{ resu['status'] }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
    <table class="tabla-totales">
      <thead>
        <tr>
          <th>Total Cargo</th>
          <th>Total Abono</th>
          <th>Total Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ totalCargo.toFixed(2) }}</td>
          <td>{{ totalAbono.toFixed(2) }}</td>
          <td>{{ totalSaldo.toFixed(2) }}</td>
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
import { Chart } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      resultados: [],
    };
  },
  computed: {
    totalCargo() {
      return this.resultados.reduce((total, resu) => total + Number(resu.cargo), 0);
    },
    totalAbono() {
      return this.resultados.reduce((total, resu) => total + Number(resu.abono), 0);
    },
    totalSaldo() {
      return this.resultados.reduce((total, resu) => total + Number(resu.saldo), 0);
    },
  },
  mounted() {
    axios
      .get("https://sistemas-oktan.com/admin/get.php/adeudopagoprovedores")
      .then((response) => {
        this.resultados = response.data.data;
        console.log(this.resultados);
        this.generateChart();
      })
      .catch((error) => {
        console.error("Error al obtener datos de la API:", error);
      });
  },
  methods: {
    generateChart() {
      let statusCounts = this.resultados.reduce((counts, resu) => {
        counts[resu.status] = (counts[resu.status] || 0) + 1;
        return counts;
      }, {});

      let statusDescriptions = {
        1: 'Pagado',
        2: 'Pendiente',
        3: 'Vencido'
      };

      let statuses = Object.keys(statusCounts).map(status => statusDescriptions[status]);
      let counts = Object.values(statusCounts);

      let ctx = document.getElementById('myChartPositive').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: statuses,
          datasets: [{
            data: counts,
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Proporción de estados de adeudo'
            }
          },
        },
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
    }
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
  width: 50%; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 0;
  
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
</style>




