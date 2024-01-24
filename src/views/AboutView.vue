<template>
  <div>
    <h1>Tabla con datos de API en Vue.js</h1>
    <button @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Clave</th>
          <th>Tipo</th>
          <th>Pin</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id_usuario">
          <td>{{ user.id_usuario }}</td>
          <td>{{ user.clave }}</td>
          <td>{{ user.tipo }}</td>
          <td>{{ user.pin }}</td>
        </tr>
      </tbody>
    </table>
    <div id="chartContainer" style="display: flex;">

<div style="margin-right: 20px;">
  <h3>Saldo Inicial</h3>
  <div style="width: 400px; height: 400px;">
    <canvas id="myChart1"></canvas>
  </div>
</div>

<div style="margin-right: 20px;">
  <h3>Saldo Final</h3>
  <div style="width: 400px; height: 400px;">
    <canvas id="myChart2"></canvas>
  </div>
</div>

<div>
  <h3>Abono</h3>
  <div style="width: 400px; height: 400px;">
    <canvas id="myChart3"></canvas>
  </div>
</div>

</div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import { Chart } from 'chart.js';
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      param1: "",
      resultados: [],
      users: [],
      rows: [],
      backgroundColors: [
        'rgba(255, 165, 0, 0.6)',//naranja 
        'rgba(194, 245, 49, 0.8)',//verde
        'rgba(95, 126, 184 , 0.7)',//azul 
        'rgba(214, 214, 0, 0.5)',//amarisho
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(50, 205, 50, 0.2)', // Añade más colores si es necesario
      ],
      borderColors: [
        'rgba(255, 165, 0, 1)',
        'rgba(157, 212, 3 , 1)',
        'rgba(95, 126, 184 , 1)',
        'rgba(214, 214, 0, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(50, 205, 50, 1)', // Añade más colores si es necesario
      ],
    };
  },
  mounted() {
    // Obtener datos de la API utilizando Axios
    axios.get('https://sistemas-oktan.com/admin/app.php/usuarios')
      .then(response => {
        this.users = response.data;
        this.users = this.users.data;
        console.log(this.users);
      })
      .catch(error => {
        console.error('Error al obtener datos de la API:', error);
      });
      const data1 = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          data: [30, 50, 20],
          backgroundColor: this.backgroundColors,
          borderColor: this.borderColors,
          borderWidth: 1,
        }],
      };
      const data2 = {
        labels: ['X', 'Y', 'Z'],
        datasets: [{
          data: [10, 60, 30],
          backgroundColor: this.backgroundColors,
          borderColor: this.borderColors,
          borderWidth: 1,
        }],
      };
      const data3 = {
        labels: ['X', 'Y', 'Z'],
        datasets: [{
          data: [100, 150, 300, 250],
          backgroundColor: this.backgroundColors,
          borderColor: this.borderColors,
          borderWidth: 1,
        }],
      };

      // Crea los gráficos con los datos ficticios
      this.createChart('myChart1', data1);
      this.createChart('myChart2', data2);
      this.createChart('myChart3', data3);
  },
  methods:{
    enviarFormulario(){
        // Realizar la solicitud GET con los parámetros
          axios
            .get("https://sistemas-oktan.com/admin/get.php/productosnombre")
            .then((response) => {
              // Actualizar la propiedad "resultados" con los datos recibidos
              this.resultados = response.data;
              this.resultados = this.resultados.data;
              console.log("Datos: ", this.resultados);
            })
            .catch((error) => {
              console.log("Error :c");
              console.error(error);
            });
      },
    createChart(canvasId, data) {
      let canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error(`Elemento '${canvasId}' no encontrado en el DOM.`);
        return;
      }

      let ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
          // Opciones específicas del gráfico de pastel
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

  // Convert HTML content to PDF using html2pdf
  // const contentHtml = this.$el.outerHTML; // Comentado porque no se usa
  html2canvas(this.$el, { scale: 3 })  // Captura la representación de la tabla como imagen
    .then(canvas => {
      const tableImg = canvas.toDataURL('image/png');

      // Agregar la tabla al PDF
      const tableWidth = 200; // Ajusta el ancho de la tabla
      const tableHeight = 100; // Ajusta la altura de la tabla
      doc.addImage(tableImg, 'PNG', 10, 20, tableWidth, tableHeight);

      // Agregar los gráficos al PDF
      //const chartWidth = 10; // Ajusta el ancho del gráfico
      //const chartHeight = 10; // Ajusta la altura del gráfico



      // Guarda el documento PDF con todos los elementos
      doc.save('informe_financiero.pdf');
    })
    .catch(error => {
      console.error('Error al capturar la representación gráfica de la tabla:', error);
    });
},

  }
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

td:first-child {
    /* Establece el ancho de la primera columna */
    width: 50px;  /* Ajusta este valor según tus necesidades */
}

th, td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px; /* Ajusta según sea necesario */
}

th {
  background-color: #f2f2f2;
}
</style>
