<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Productos</h2>
    <h2></h2>
    <form @submit.prevent="filtrarDatos">
    <!-- ... -->
    <label for="idProducto" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Producto:</label>
    <input type="text" v-model="idProducto" style="margin-right:10px;">

    <label for="idProducto" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Nombre:</label>
    <input type="text" v-model="nombre" style="margin-right:10px;">
    
    <button class="boton-filtrar" type="submit">Filtrar</button>
    <!-- ... -->
  </form>
  <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <table>
      <thead>
        <tr>
          <th>id_producto</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Unidad</th>
           <!--<th>clave de la unidad</th>-->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <td>{{ adeudo['id_producto'] }}</td>
          <td>{{ adeudo['nombre'] }}</td>
          <td>${{ adeudo['precio'] }}</td>
          <td>{{ adeudo['unidad'] }}</td>
           <!--<td>{{ adeudo['clave_unidad'] }}</td> -->
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
   
  </div>
</template>

<script>
import axios from "axios";
//import jsPDF from 'jspdf';
//import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      resultados: [],
      datosOriginales: [],
      idProducto: "", // Nuevo atributo
      nombre: "", // Nuevo atributo
    };
  },

  mounted() {
    axios
      .get("https://sistemas-oktan.com/admin/get.php/consultaproductos")
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
    let resultadosFiltrados = this.datosOriginales;

    if (this.idProducto) {
      resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['id_producto'] === this.idProducto);
    } else if (this.nombre) {
      resultadosFiltrados = resultadosFiltrados.filter(adeudo => adeudo['nombre'].toLowerCase() === this.nombre.toLowerCase());
    }

    this.resultados = resultadosFiltrados;
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


