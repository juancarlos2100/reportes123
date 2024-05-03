<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
   <header>
     <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
   </header>
   <h1>Reporte Operativo</h1>
   <h2> Saldos Clientes</h2>
   <div>
    <form @submit.prevent="filtrarDatos">
      <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
      <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
      </select>
      <label for="turnoInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Turno Inicial:</label>
      <input type="number" v-model="turnoInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
      <label for="turnoFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Turno Final:</label>
      <input type="number" v-model="turnoFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>

   <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
   <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

   </div>
   
   <div class="container" style="display: flex; height: 100%;">
     <!-- Lado izquierdo -->
     <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
      <h1>Transacciones Registradas</h1>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Razón Social</th>
              <th>Inicial</th>
              <th>Cargos</th>
              <th>Abonos</th>
              <th>Final</th>
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['id_cliente'] }}</td>
              <td>{{ adeudo['razon_social'] }}</td>
              <td>${{ parseFloat(adeudo['inicial']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['cargos']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['abonos']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['final']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            </tr>
            <tr>
              <td colspan="2">Totales</td>
              <td>${{ parseFloat(totalRegistros.inicial).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(totalRegistros.cargos).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(totalRegistros.abonos).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(totalRegistros.final).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6">No se encontraron registros que coincidan con su búsqueda</td>
            </tr>
          </tbody>
        </table>

       <br>
     </div>

     <!-- Lado derecho -->
     <div class="right-container" style="flex: 0 0 45%; overflow: auto;">
       <h1>Tablero de Gráficas</h1>
       <h3>Proporción de Cargos-Abonos</h3>
       <div class="chart-container">
         <canvas id="myBarChart"></canvas>
       </div>
       <!-- Nuevo gráfico de pastel (chart2) -->
       <div class="chart-container">
         <h3>Estadistica por Semana</h3>
         <canvas id="myLineChart"></canvas>
       </div>
       <div class="cont-total">
         <h1>Total por Proveedor</h1>
         <table :class="{ 'tabla-totales': !isDarkMode, 'dark-mode-table': isDarkMode }">
             <thead>
               <tr>
                 <th>Nombre</th>
                 <th>Cargos</th>
                 <th>Abonos</th>
                 <th>Diferencia</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="(total, nombre) in totalesPorNombre" :key="nombre">
                 <td><strong>{{ nombre }}</strong></td>
                 <td>${{ total.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                 <td>${{ total.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                 <td>${{ total.diferencia.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
               </tr>
             </tbody>
           </table>
       </div>
     </div>
   </div>
     </div>
</template>

<script>
import axios from "axios";


export default {
 data() {
   return {
     isDarkMode: true, // Variable para controlar el modo oscuro
     resultados: [],
     resultadosOriginales: [], // Nuevo atributo
     idTipo: null,
     estatus: null,
     fechaInicio: null,
     fechaFin: null,
     dbm: null, // Nuevo atributo para la estación
     estaciones: {},
     totalesPorNombre: {},
     mostrarResultados: false,
     turnoInicio: null,
      turnoFin: null,
      totalRegistros: {} 
   };
 },
 methods: {
   async cargarEstaciones() {
     const url = 'http://gasserver.dyndns.org:8081/admin/get.php/estaciones';
     try {
       const response = await axios.get(url);
       this.estaciones = response.data.data.reduce((acc, item) => {
         acc[item.id_dbm] = `${item.id_dbm} - ${item.nombre}`;
         return acc;
       }, {});
     } catch (error) {
       console.error("Error al obtener las estaciones:", error);
     }
   },
   async filtrarDatos() {
    if (this.turnoInicio && this.turnoFin && this.dbm) {
      const turnoInicioInt = parseInt(this.turnoInicio);
      const turnoFinInt = parseInt(this.turnoFin);
      const url = `http://gasserver.dyndns.org:8081/admin/get.php/saldosclientesturno`;

      const params = {
        turnoInicio: turnoInicioInt,
        turnoFin: turnoFinInt,
        dbm: parseInt(this.dbm)
      };

      try {
        const response = await axios.get(url, {
          params,
          timeout: 30000 // Establecer el tiempo de espera en 20 segundos
        });
        this.resultadosOriginales = response.data.data;
        this.resultados = [...this.resultadosOriginales];
        this.mostrarResultados = true;
        
        // Calcula los totales y asigna a la propiedad totalRegistros
        this.totalRegistros = this.sumarRegistros(); 
      } catch (error) {
        console.error("Error al obtener datos de la API:", error);
      }
    } else {
      // Manejo si no se selecciona una estación o no se proporcionan fechas
      this.resultados = [];
      this.mostrarResultados = false;
      this.totalRegistros = {}; // Reinicia los totales
    }
  },


    sumarRegistros() {
      let total = {
        inicial: 0,
        cargos: 0,
        abonos: 0,
        final: 0
      };

      this.resultados.forEach((registro) => {
        total.inicial += registro.inicial;
        total.cargos += registro.cargos;
        total.abonos += registro.abonos;
        total.final += registro.final;
      });

      return total;
    }

  
 },
 


 mounted() {
   this.cargarEstaciones();
 }

 
};

</script>




<style scoped>
.content-container {
 display: flex;
 justify-content: space-between;
 margin-top: 50px;
}

.chart-container {
 width: 95%;
 height: 500px;
 margin-left: 5px;
 margin-right: 10px;
}

.table-container {
 width: 100%;
}
 /* Estilos para las etiquetas de fecha */
 label[for="fechaInicio"], label[for="fechaFin"] {
   font-family: "Arial", sans-serif; /* Cambiar la fuente */
   font-size: 20px; /* Cambiar el tamaño de fuente */
 }

 table {
 width: 95%;
 border-collapse: collapse;
 margin-top: 20px; /* Ajusta según sea necesario */
 margin-left: auto;
 margin-right: auto;
 margin-bottom: 100px;
 transition: transform 0.5s ease, box-shadow 0.5s ease;
}

/* Reducir el ancho de la primera columna a la mitad */
table tr td:first-child {
 width: 20%;
}

.table:hover {
 transform: translateY(-0.3rem);
 box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.tabla-totales {
 width: 800px; /* Cambia esto al ancho que desees */
 height: auto; /* Cambia esto a la altura que desees */
 margin-left: 90px;
 margin-right: auto;
 transition: transform 0.5s ease, box-shadow 0.5s ease;
 
 
}
.tabla-totales:hover {
 transform: translateY(-0.03rem)scale(1.03);
 
 box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.5);
}

.tabla-totales th,
.tabla-totales td {
 padding: 15px; /* Ajusta el relleno de las celdas según sea necesario */
 font-size: 17px; /* Ajusta el tamaño de la fuente según sea necesario */
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
 transition: transform 0.5s ease, box-shadow 0.5s ease, background-color 0.5s ease;
}

.boton-descargar:hover {
 background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
 transform: translateY(0.5rem); /* Mover hacia abajo */
}

.boton-descargar:active {
 transform: scale(1.05) translateY(0.5rem); /* Aumentar un poco el tamaño y mover hacia abajo al hacer clic */
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
 transition: transform 0.5s ease, box-shadow 0.5s ease, background-color 0.5s ease;
}

.boton-filtrar:hover {
 background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
 transform: translateY(-0.5rem); /* Desplazamiento hacia arriba */
 box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* Sombra debajo */
}

.boton-filtrar:active {
 transform: scale(1.2); /* Aumentar un poco el tamaño al hacer clic */
}
.cont-total{
 margin-top: 60px;
 align-items: center;
}
.dark-mode {
 background-color: #333; /* Color de fondo oscuro */
 color: #fff; /* Color de texto blanco */
 min-height: 100vh;
}

.dark-mode-select,
.dark-mode-input {
 background-color: #444; /* Color de fondo oscuro para select e input */
 color: #fff; /* Color de texto blanco para select e input */

}
.dark-mode-table {
 color: #fff; /* Color del texto en modo oscuro */
 background-color: #333; /* Color de fondo en modo oscuro */
 border-collapse: collapse; /* Colapsar los bordes de la tabla */
 width: 95%; /* Ancho de la tabla */
 margin-top: 20px; /* Margen superior */
 margin-bottom: 8px; /* Margen inferior */
 margin-left: 20px;
}
.dark-mode-table td:first-child {
  column-width: 50%; /* Reduce a la mitad el ancho de la primera columna */
}

.dark-mode-table th,
.dark-mode-table td {
 border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
 padding: 8px; /* Espaciado interno de las celdas */
 text-align: left; /* Alineación del texto en las celdas */
}

.dark-mode-table th {
 background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
 color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
.dark-mode-saldo-anterior-table {
 color: #fff; /* Color del texto en modo oscuro */
 background-color: #333; /* Color de fondo en modo oscuro */
 border-collapse: collapse; /* Colapsar los bordes de la tabla */
 width: 95%; /* Ancho de la tabla */
 margin-bottom: 2px; /* Margen inferior */
 text-align: right; /* Alineación del texto a la derecha */
 margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
 border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
 padding: 8px; /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
 background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
 color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
.dark-mode .tabla-totales {
 background-color: #333; /* Fondo oscuro */
 color: #fff; /* Texto blanco */
 border-collapse: collapse; /* Colapso de bordes */
 width: 100%; /* Ancho completo */
}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
 border: 1px solid #fff; /* Borde blanco */
 padding: 8px; /* Espaciado interno */
 text-align: center; /* Alineación centrada */
}

.dark-mode .tabla-totales th {
 background-color: #555; /* Color de fondo para encabezados */
}
.dark-mode-saldo-anterior-table {
 color: #fff; /* Color del texto en modo oscuro */
 background-color: #333; /* Color de fondo en modo oscuro */
 border-collapse: collapse; /* Colapsar los bordes de la tabla */
 width: 95%; /* Ancho de la tabla */
 margin-bottom: 2px; /* Margen inferior */
 text-align: right; /* Alineación del texto a la derecha */
 margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
 border: 1px solid #ddd; /* Borde de las celdas en modo oscuro */
 padding: 8px; /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
 background-color: #555; /* Color de fondo de los encabezados en modo oscuro */
 color: #fff; /* Color del texto de los encabezados en modo oscuro */
}
.dark-mode .tabla-totales {
 background-color: #333; /* Fondo oscuro */
 color: #fff; /* Texto blanco */
 border-collapse: collapse; /* Colapso de bordes */
 width: 100%; /* Ancho completo */
}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
 border: 1px solid #fff; /* Borde blanco */
 padding: 8px; /* Espaciado interno */
 text-align: center; /* Alineación centrada */
}

.dark-mode .tabla-totales th {
 background-color: #555; /* Color de fondo para encabezados */
}

</style>

