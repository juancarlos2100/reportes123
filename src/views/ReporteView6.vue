<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Transacciones Bancos</h2>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <th>ID Transaccion</th>
          <th>id Cuenta</th>
          <th>ID_Tipo</th>
          <th>Fecha Contable</th>
          <th>Abono</th>
          <th>Saldo</th>
          <th>Descripcion</th>
          <th>Status</th>
          <th>Banco</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <td>{{ adeudo['id_adeudo'] }}</td>
          <td>{{ adeudo['serie'] }}</td>
          <td>{{ adeudo['folio'] }}</td>
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <td>{{ adeudo['cargo'] }}</td>
          <td>{{ adeudo['abono'] }}</td>
          <td>{{ adeudo['saldo'] }}</td>
          <td>{{ adeudo['vencimiento'] }}</td>
          <td>{{ adeudo['status'] }}</td>
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
//import { Chart } from 'chart.js';
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
      return this.resultados.reduce((total, adeudo) => total + Number(adeudo.cargo), 0);
    },
    totalAbono() {
      return this.resultados.reduce((total, adeudo) => total + Number(adeudo.abono), 0);
    },
    totalSaldo() {
  return this.resultados.reduce((total, resu) => total + Number(resu.cargo) - Number(resu.abono), 0);
}
  },
  mounted() {
    axios
      .get("https://sistemas-oktan.com/admin/get.php/transaccionesbanco")
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
</style>




