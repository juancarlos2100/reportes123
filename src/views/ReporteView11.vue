<template>
    <div id="resultado">
      <header>
        <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
      </header>
      <h1>Reporte Operativo</h1>
      <h2> Inventario Gasolina</h2>
      <form @submit.prevent="filtrarDatos">
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
            <th>Productos</th>
            <th>Lectura Inicial</th>
            <th>Compras</th>
            <th>Suma</th>
            <th>Ventas</th>
            <th>Lectura Final</th>
            <th>Total</th>
            <th>precio_promedio</th>
            <th>Merma</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(adeudo, index) in resultados" :key="index">
            <td>{{ adeudo['nombre'] }}</td>
            <td>{{ adeudo['inicio_volumen'] }}</td>
            <td>{{ adeudo['fin_volumen'] }}</td>
            <td>{{ adeudo['jarras_monto'] }}</td>
            <td>${{ adeudo['ventas'] }}</td>
            <td>{{ adeudo['jarras_volumen'] }}</td>
            <td>${{ adeudo['importe'] }}</td>
            <td>${{ adeudo['precio_promedio'] }}</td>
            <td>${{ parseFloat(adeudo['']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          </tr>
        </tbody>
      </table>
      <br>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>nombre</th>
          <th>fin_volumen</th>
          <th>precio_venta</th>
          <th>precio_compra</th>
          <th>total_compra</th>
          <th>total_venta</th>
          <th>utilidad</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados2" :key="index">
          <td>{{ adeudo['nombre'] }}</td>
          <td>{{ adeudo['fin_volumen'] }}</td>
          <td>{{ adeudo['precio_venta'] }}</td>
          <td>${{ adeudo['precio_compra'] }}</td>
          <td>${{ parseFloat(adeudo['total_compra']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['total_venta']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['utilidad']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
      
      <!-- Nueva tabla con las sumas totales -->
  
  
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
        resultados2: [],
        idTipo: null,
        estatus: null,
        fechaInicio: null,
        fechaFin: null,
        totalesPorBanco: {},
        totalUtilidad: 0,
      };
    },
    computed: {
      calcularTotalUtilidad() {
        return this.resultados.reduce((total, adeudo) => total + adeudo.utilidad, 0);
      },
  
    },
    mounted() {
      axios
        .get("https://sistemas-oktan.com/admin/get.php/repgasolina")
        .then((response) => {
          this.resultados = response.data.data;
          this.totalUtilidad = this.calcularTotalUtilidad; // Añade esta línea
          console.log(this.resultados);
          this.calcularTotalesPorBanco();
          this.generateChart();
        })
        .catch((error) => {
          console.error("Error al obtener datos de la API:", error);
        });
        axios
        .get("https://sistemas-oktan.com/admin/get.php/invgasolina")
        .then((response) => {
          this.resultados2 = response.data.data;
          this.totalUtilidad = this.calcularTotalUtilidad; // Añade esta línea
          console.log(this.resultados);
          this.calcularTotalesPorBanco();
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
    width: 1500px; /* Cambia esto al ancho que desees */
    height: auto; /* Cambia esto a la altura que desees */
    margin-left: 300px;
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



