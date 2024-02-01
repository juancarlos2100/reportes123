<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Clientes por cobrar</h2>
    
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
          <th>id_entidad</th>
          <th>fecha</th>
          <th>saldo</th>
          <th>razon_social</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <!--<td>{{ adeudo['id_turno'] }}</td>-->
          <td>{{ adeudo['id_entidad'] }}</td>
          <td>{{ adeudo['fecha'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <!--<td>{{ adeudo['forma_pago'] }}</td>-->
          <td>{{ adeudo['razon_social'] }}</td>
        </tr>
      </tbody>
    </table>
    <tfoot>
      <tr>
        <td colspan="2"><strong>Total</strong></td>
        <td>${{ totalSaldoResultados.toFixed(2) }}</td>
        <td></td>
      </tr>
    </tfoot>
    <br>
    <h2>Empresas de reembolso</h2>
    <br>
     <!--segunda tabla-->
        <table class="t2">
      <thead>
        <tr>
          <th>id_entidad</th>
          <th>fecha</th>
          <th>saldo</th>
          <th>nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosSegundaTabla" :key="index">
          <td>{{ adeudo['id_entidad'] }}</td>
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ adeudo['nombre'] }}</td>
         
          
        </tr>
      </tbody>
    </table>
    <tfoot>
      <tr>
        <td colspan="2"><strong>Total</strong></td>
        <td>${{ totalSaldoResultadosSegundaTabla }}</td>
        <td></td>
      </tr>
    </tfoot>

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
    resultadosSegundaTabla: [], // Asegúrate de que esto esté aquí
    resultadosFiltrados: [],
    fechaInicio: null,
    fechaFin: null,
    totalImporte: 0,
    totalSaldoResultados: 0,
    totalSaldoResultadosSegundaTabla: 0,
    };
  },
  mounted() {
    axios
      .get("https://sistemas-oktan.com/admin/get.php/clientesxcobrar")
      .then((response) => {
        this.resultados = response.data.data.map(resu => {
          return {
            ...resu,
            id_turno: resu.id_turno || 'NULL'
          };
        });
        console.log(this.resultados);
        this.calcularTotales();
      })
      .catch((error) => {
        console.error("Error al obtener datos de la API:", error);
      });
        // Obtén los datos para la segunda tabla
      axios
        .get("https://sistemas-oktan.com/admin/get.php/empreembolso")
        .then((response) => {
          this.resultadosSegundaTabla = response.data.data; // Asegúrate de tener 'resultadosSegundaTabla' en tu data()
          this.calcularTotales();
        })
        .catch((error) => {
          console.error("Error al obtener datos de la segunda API:", error);
        });
      
  },
  methods: {
    filtrarDatos() {
    // Convertir las fechas a objetos Date para poder compararlas
    let fechaInicio = new Date(this.fechaInicio);
    let fechaFin = new Date(this.fechaFin);

    // Filtrar los resultados basándose en las fechas
    this.resultadosFiltrados = this.resultados.filter(adeudo => {
      let fechaAdeudo = new Date(adeudo['fecha']);
      return fechaAdeudo >= fechaInicio && fechaAdeudo <= fechaFin;
    });

    // Calcular el total de los saldos de los resultados filtrados
    this.totalSaldoResultados = this.resultadosFiltrados.reduce((total, adeudo) => total + Number(adeudo['saldo']), 0);
  },


  calcularTotales() {
    this.totalSaldoResultados = this.resultados.reduce((total, adeudo) => total + Number(adeudo['saldo']), 0);
    this.totalSaldoResultadosSegundaTabla = this.resultadosSegundaTabla.reduce((total, adeudo) => total + Number(adeudo['saldo']), 0);
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
    // ...resto de métodos...
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
.t2 {
  width: 100%; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
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