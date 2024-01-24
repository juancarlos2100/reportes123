<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Proveedores</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <label for="idTipo" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Tipo:</label>
      <input type="text" v-model="idTipo" style="margin-right:10px;">

      <label for="estatus" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Estatus:</label>
      <input type="text" v-model="estatus" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <th>ID Transaccion</th>
          <th>id Tipo</th>
          <th>Fecha</th>
          <th>id proveedor</th>
          <th>Monto</th>
          <th>Descripcion</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <td>{{ adeudo['id_transaccion'] }}</td>
          <td>{{ adeudo['id_tipo'] }}</td>
          <td>{{ adeudo['fecha'] }}</td>
          <td>{{ adeudo['id_proveedor'] }}</td>
          <td>{{ adeudo['monto'] }}</td>
          <td>{{ adeudo['descripcion'] }}</td>
          <td>{{ adeudo['estatus'] }}</td>
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
  </div>
</template>

<script>
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      resultados: [],
      datosOriginales: [],
      fechaInicio: "",
      fechaFin: "",
      idTipo: "",
      estatus: "",
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
      .get("https://sistemas-oktan.com/admin/get.php/transaccionesproveedores")
      .then((response) => {
        this.resultados = response.data.data;
        this.datosOriginales = response.data.data; // Almacena los datos originales
        console.log(this.resultados);
        this.generateChart();
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
          (this.fechaInicio === "" || adeudo.fecha >= this.fechaInicio) &&
          (this.fechaFin === "" || adeudo.fecha <= this.fechaFin) &&
          (this.idTipo === "" || adeudo.id_tipo == this.idTipo) &&
          (this.estatus === "" || adeudo.estatus == this.estatus)
        );
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
    },
    generateChart() {
      // Lógica para generar el gráfico
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