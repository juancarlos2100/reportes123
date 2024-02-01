<template>

  <div>
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte General</h1>
    <h2> Desglose</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="downloadPDF">Descargar XLS</button>
    
    <!-- Tabla Totales Bancos -->
    <table class="tabla-totales">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Saldo</th>
            <!--<th>Status</th>-->
            <th>Banco</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(adeudo, index) in resultadosBancos" :key="index">
            <td>{{ adeudo['fecha_contable'] }}</td>
            <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <!--<td>{{ adeudo['estado'] }}</td>-->
            <td>{{ adeudo['banco'] }}</td>
          </tr>
        </tbody>
      </table>

    <!-- Tabla Totales Proveedores -->
    <div>
      <h3>Totales Proveedores</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>Folio-Factura</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosProveedores" :key="index">
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <td>{{ adeudo['nombre'] }}</td>
          <td>{{ adeudo['folio'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
    </div>

    <!-- Tabla Totales Efectivo -->
    <div>
      <h3>Totales Efectivo</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>monto</th>
          <th>monto depositado</th>
          <th>diferencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosEfectivo" :key="index">
          <td>{{ adeudo['fecha'] }}</td>
          <td>{{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['monto_depositado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
    </div>

    <!-- Tabla Totales Clientes -->
    <div>
      <h3>Totales Clientes</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>fecha</th>
          <!--<th>id_entidad</th>-->
          <th>saldo</th>
          <th>razon_social</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosClientes" :key="index">
          <td>{{ adeudo['fecha'] }}</td>
          <!--<td>{{ adeudo['id_entidad'] }}</td>-->
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ adeudo['razon_social'] }}</td>
        </tr>
      </tbody>
    </table>

      <!-- Segunda Tabla -->
      <h3>Empresas de reembolso</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>fecha</th>
          <!--<th>id_entidad</th>-->
          <th>saldo</th>
          <th>nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosSegundaTabla" :key="index">
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <!--<td>{{ adeudo['id_entidad'] }}</td>-->
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ adeudo['nombre'] }}</td>
         
          
        </tr>
      </tbody>
    </table>
    </div>
     <!--Inventario de Gasolina-->
    <div>
      <h3>Inventario Gasolina</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>nombre</th>
          <th>precio_venta</th>
          <th>precio_compra</th>
          <th>utilidad</th>
        </tr>
        
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosGasolina" :key="index">
          <td>{{ adeudo['nombre'] }}</td>
          <td>{{ adeudo['precio_venta'] }}</td>
          <td>${{ adeudo['precio_compra'] }}</td>
          <td>${{ parseFloat(adeudo['utilidad']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
      </tbody>
    </table>
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
      totalesPorBanco: {},
      totalesPorNombre: {},
      resultadosFiltrados: [],
      totalImporte: 0,
      resultadosBancos: [],
      resultadosClientes: [],
      resultadosEfectivo: [],
      resultadosGasolina: [],
      resultadosProveedores: [],
      resultadosSegundaTabla: [],
      totalSaldoResultados: 0,
      totalSaldoResultadosSegundaTabla: 0,
    };
  },
  mounted() {
    // Obtener datos de bancos
    axios.get("https://sistemas-oktan.com/admin/get.php/transaccionesbanco")
      .then((response) => {
        this.resultadosBancos = response.data.data;
      })
      .catch((error) => {
        console.error("Error al obtener datos de bancos:", error);
      });

    // Obtener datos de proveedores
    axios.get("https://sistemas-oktan.com/admin/get.php/saldospipas")
      .then((response) => {
        this.resultadosProveedores = response.data.data;
      })
      .catch((error) => {
        console.error("Error al obtener datos de proveedores:", error);
      });

    // Obtener datos de efectivo
    axios.get("https://sistemas-oktan.com/admin/get.php/depositoefectivo")
      .then((response) => {
        this.resultadosEfectivo = response.data.data;
      })
      .catch((error) => {
        console.error("Error al obtener datos de efectivo:", error);
      });

    // Obtener datos de clientes
    axios.get("https://sistemas-oktan.com/admin/get.php/clientesxcobrar")
      .then((response) => {
        this.resultadosClientes = response.data.data.map(resu => {
          return {
            ...resu,
            id_turno: resu.id_turno || 'NULL'
          };
        });
      })
      .catch((error) => {
        console.error("Error al obtener datos de clientes:", error);
      });
      axios
          .get("https://sistemas-oktan.com/admin/get.php/empreembolso")
          .then((response) => {
            this.resultadosSegundaTabla = response.data.data; // Asegúrate de tener 'resultadosSegundaTabla' en tu data()
            this.calcularTotales();
          })
          .catch((error) => {
            console.error("Error al obtener datos de la segunda API:", error);
          });
          // Obtener datos de inventario gasolina
      axios
        .get("https://sistemas-oktan.com/admin/get.php/invgasolina")
        .then((response) => {
          this.resultadosGasolina = response.data.data;
        })
        .catch((error) => {
          console.error("Error al obtener datos de bancos:", error);
        });
  },
  methods: {
    filtrarDatos() {
      this.resultadosFiltrados = this.resultados; // Usa la propiedad de datos en lugar de una variable local

      if (this.fechaInicio && this.fechaFin) {
        this.resultadosFiltrados = this.resultadosFiltrados.filter(adeudo => {
          const fechaContable = new Date(adeudo['fecha']); // Cambiado 'fecha_contable' por 'fecha'
          const fechaInicio = new Date(this.fechaInicio);
          const fechaFin = new Date(this.fechaFin);
          return fechaContable >= fechaInicio && fechaContable <= fechaFin;
        });
      }

      // Calcula el total de los importes filtrados
      this.totalImporte = this.resultadosFiltrados.reduce((total, adeudo) => total + parseFloat(adeudo['diferencia']), 0);
    },
    calcularTotales() {
      this.totalSaldoResultados = this.calcularTotalImporte(this.resultadosClientes);
      this.totalSaldoResultadosSegundaTabla = this.calcularTotalImporte(this.resultadosSegundaTabla);
    },
    calcularTotalImporte(resultados) {
      return resultados.reduce((total, adeudo) => total + parseFloat(adeudo['saldo']), 0);
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
          let pageHeight = 295;  // A4 height
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let marginLeft = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
          let marginTop = 10;

          doc.addImage(imgData, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            marginTop = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          doc.save('informe_financiero.pdf');
        })
        .catch(error => {
          console.error('Error al capturar la representación gráfica de la tabla:', error);
        });
    }


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
.tabla-totales {
  width: 40%; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: auto;
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
  width: 300px;  /* Ajusta este valor según tus necesidades */
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

