<template>
    <div id="resultado">
      <H3>Esto es una prueba, IGNORAR</H3>
      <header>
        <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
      </header>
      <h1>Reporte Operativo</h1>
      <h2>Transacciones Proveedores</h2>
      <form @submit.prevent="filtrarDatos">
      <label for="id_turno" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno:</label>
      <input type="text" v-model="id_turno" style="margin-right:10px;">

      <label for="nombre" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Nombre:</label>
      <input type="text" v-model="nombre" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      
      <table>
        <thead>
          <tr>
            <th>id_turno</th>
            <th>nombre</th>
            <th>precio</th>
            <th>venta bruta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(adeudo, index) in resultados" :key="index">
            <td>{{ adeudo['id_turno'] }}</td>
            
            <td>{{ adeudo['nombre'] }}</td>
           
            <td>{{ adeudo['precio'] }}</td>
          
           
            <td>${{ parseFloat(adeudo['total']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>>
          </tr>
        </tbody>
      </table>
      <!-- Nueva tabla con las sumas totales -->
      <table class="tabla-totales">
        <thead>
          <tr>
            <th>REGULAR</th>
            <th>PREMIUM</th>
            <th>DIESEL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ sumarVentasBrutas('REGULAR') }}</td>
            <td>{{ sumarVentasBrutas('PREMIUM') }}</td>
            <td>{{ sumarVentasBrutas('DIESEL') }}</td>
          </tr>
        </tbody>
      </table>
      <div id="resultado">
    <!-- ... (resto del código) ... -->
    <canvas id="myChart"></canvas>
    <!-- ... (resto del código) ... -->
  </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';
  import { Chart } from 'chart.js';
  
  export default {
    data() {
      return {
        resultados: [],
        datosOriginales: [],
        id_turno: "",
        nombre: "",
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
      },
    },
    mounted() {
      axios
        .get("https://sistemas-oktan.com/admin/get.php/turnostanques")
        .then((response) => {
          this.resultados = response.data.data;
          this.datosOriginales = response.data.data;
          console.log(this.resultados);
          this.generateChart(); // Llamada al método para generar el gráfico
        })
        .catch((error) => {
          console.error("Error al obtener datos de la API:", error);
        });
    },
    methods: {
      filtrarDatos() {
        // Filtrar datos en base a los criterios ingresados
        this.resultados = this.datosOriginales.filter(adeudo => {
          return (
            (this.id_turno === "" || adeudo.id_turno.toString() === this.id_turno) &&
            (this.nombre === "" || adeudo.nombre.toLowerCase().includes(this.nombre.toLowerCase()))
          );
        });
      },
      sumarVentasBrutas(combustible) {
        const ventasFiltradas = this.resultados.filter(adeudo => adeudo.nombre === combustible);
        const sumaVentasBrutas = ventasFiltradas.reduce((total, adeudo) => total + Number(adeudo.total), 0);
        // Formatear con comas cada tres dígitos
        return sumaVentasBrutas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
      generateChart() {
        const ctx = document.getElementById("myChart").getContext("2d");
  
        // Obtén datos para el gráfico (puedes ajustar según tus datos)
        const data = {
          labels: ["REGULAR", "PREMIUM", "DIESEL"],
          datasets: [{
            data: [
              this.sumarVentasBrutas('REGULAR'),
              this.sumarVentasBrutas('PREMIUM'),
              this.sumarVentasBrutas('DIESEL'),
            ],
            backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
          }],
        };
  
        // Configuración del gráfico
        const options = {
          responsive: true,
          maintainAspectRatio: false,
        };
  
        // Crea el gráfico circular
        new Chart(ctx, {
          type: "doughnut",
          data: data,
          options: options,
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
    width: 40%; /* Cambia esto al ancho que desees */
    height: auto; /* Cambia esto a la altura que desees */
    margin-left: auto;
    margin-right: 0;
    
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
  td:first-child {
    /* Establece el ancho de la primera columna */
    width: 100px;  /* Ajusta este valor según tus necesidades */
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

