<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Transacciones Bancos</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <label for="idCuenta" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Cuenta:</label>
      <input type="text" v-model="idTipo" style="margin-right:10px;">

      <label for="estatus" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Estatus:</label>
      <input type="text" v-model="estatus" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <!--<th>ID Transaccion</th>-->
          <th>ID Cuenta</th>
          <th>Fecha Contable</th>
          <!--<th>Monto</th>-->
          <th>Saldo</th>
          <!-- <th>Descripcion</th>-->
          <th>Status</th>
          <th>Banco</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <!--<td>{{ adeudo['id_transaccion'] }}</td>-->
          <td>{{ adeudo['id_cuenta'] }}</td>
          <td>{{ adeudo['fecha_contable'] }}</td>
           <!--<td>{{ adeudo['monto'] }}</td>-->
          <td>${{ adeudo['saldo'] }}</td>
          <!--<td>{{ adeudo['descripcion'] }}</td>-->
          <td>{{ adeudo['estado'] }}</td>
          <td>{{ adeudo['banco'] }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
    <table class="tabla-totales">
      <thead>
        <tr>
        <th>Banco</th>
        <th>Saldo Final</th>
        </tr>
      </thead>
    <tbody>
    <tr v-for="(saldo, banco) in totalesPorBanco" :key="banco">
      <td>${{ banco }}</td>
      <td>${{ saldo.toFixed(2) }}</td>
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
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
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
        this.calcularTotalesPorBanco();
        this.generateChart();
      })
      .catch((error) => {
        console.error("Error al obtener datos de la API:", error);
      });
  },
  methods: {
    filtrarDatos() {
      let resultadosFiltrados = this.resultados;

      if (this.idTipo) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['id_cuenta'] === this.idTipo);
      } else if (this.estatus) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['estado'] === this.estatus);
      } else if (this.fechaInicio && this.fechaFin) {
        resultadosFiltrados = resultadosFiltrados.filter(adeudo => {
          const fechaContable = new Date(adeudo['fecha_contable']);
          const fechaInicio = new Date(this.fechaInicio);
          const fechaFin = new Date(this.fechaFin);
          return fechaContable >= fechaInicio && fechaContable <= fechaFin;
        });
      }

      this.resultados = resultadosFiltrados;
      this.calcularTotalesPorBanco();
    },
    calcularTotalesPorBanco() {
      this.totalesPorBanco = this.resultados.reduce((totales, adeudo) => {
        const banco = adeudo['banco'];
        const saldo = Number(adeudo['saldo']);
        if (!totales[banco]) {
          totales[banco] = 0;
        }
        totales[banco] += saldo;
        return totales;
      }, {});
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
  width: 700px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 0;
  
  
}


td:first-child {
  /* Establece el ancho de la primera columna */
  width: 100px;  /* Ajusta este valor según tus necesidades */
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

