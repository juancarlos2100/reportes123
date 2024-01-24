<template>
  <div>
    <h1>Reporte Administrativo</h1>
    <h3>Comprobación</h3>
    <h2>Nompre del Cliente</h2>
    <button @click="downloadPDF">Descargar PDF</button>
    <table>
      <table>
        <thead>
          <tr>
            <th>ID del Proveedor</th>
            <th>Razon Social</th>
            <th>Saldo Inicial</th>
            <th>Cargo</th>
            <th>Abono</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>PAPELERIA OMEGA</td>
            <td>$00.00</td>
            <td>$1000.00</td>
            <td>01/01/2022</td>
            <td>-10,000.00</td>
  
          </tr>
          <tr>
            <td>2</td>
            <td> ACEITES ROSHFRANS</td>
            <td>$00.00</td>
            <td>$14,030.20</td>
            <td>02/01/2022</td>
            <td>0.00</td>
  
          </tr>
          <tr>
            <td>3</td>
            <td> MEXXON ENERGIA EN MOVIMIENTO</td>
            <td>-$1,100,00.00</td>
            <td>$1,148,000.00</td>
            <td>03/01/2022</td>
            <td>-1,748,000.00</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
          <tr>
            <td>4</td>
            <td> OKTAN SUPREME ENERGY</td>
            <td>$00.00</td>
            <td>$1000</td>
            <td>03/01/2022</td>
            <td>-664,909.70</td>
  
          </tr>
        </tbody>
      </table>

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
import { Chart } from 'chart.js';
import jsPDF from 'jspdf';
//import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';



export default {
  data() {
    return {
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
    this.fetchDataFromAPI();
  },
  methods: {
    fetchDataFromAPI() {
      axios.get('URL_DE_TU_API')
        .then(response => {
          this.rows = response.data; // Asigna los datos a tu propiedad 'rows'
        })
        .catch(error => {
          console.error('Error al obtener datos de la API', error);
        });
      // Datos ficticios para los gráficos
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
      const tableHeight = 120; // Ajusta la altura de la tabla
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




