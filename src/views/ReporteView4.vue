<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Efectivo por depositar</h2>
    <div>
      <form @submit.prevent="filtrarDatos"> 
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" style="margin-right:10px;">
        
        <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" style="margin-right:10px;">

        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      <button class="boton-descargar" @click="downloadPDF">Descargar XLS</button>
    </div>

    <div class="container" style="display: flex; height: 100%;">
       <!-- Lado izquierdo -->
       <div class="left-container" style="flex: 0 0 40%; overflow: auto;">
          <table class="table">
            <thead>
              <tr>
                <!--<th>estacion</th>-->
                <!--<th>Estatus</th>-->
                <th>id_turno</th>
                <th>Fecha</th>
                <th>estacion</th>
                <th>diferencia</th>
                <th>monto depositado</th>
                <!--<th>forma_pago</th>-->
              </tr>
            </thead>
            <tbody>
              <tr v-if="resultados.length === 0">
                <td colspan="5">No se encontraron registros que coincidan con su búsqueda</td>
              </tr>
              <tr v-for="(adeudo, index) in resultados" :key="index">
                <td>{{ adeudo['id_turno'] }}</td>
                <td>{{ adeudo['fecha'] }}</td>
                <td>{{ adeudo['id_dbm'] }}</td>
                

                 <!--<td>{{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>-->
                 <td>${{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                <td>${{ parseFloat(adeudo['monto_depositado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        

       <!-- Lado derecho -->
      <div class="right-container" style="flex: 0 0 60%; overflow: auto;">
        <h1>Tablero de Gráficas</h1>
        <div class="chart-container">
          <canvas id="myChart"></canvas>
        </div>
        <!-- Nuevo gráfico de pastel (chart2) -->
        <div class="chart-container">
          <canvas id="myPieChart"></canvas>
        </div>
        <div class="cont-total">
          <h1>Total de efectivo</h1>
          <table class="tabla-totales">
            <thead>
              <tr>
                <th>Efectivo por depositar</th> <!-- Cambiado 'Factura' por 'Efectivo por depositar' -->
                <th>monto depositado</th>
                <th>Importe</th>
              </tr>
            </thead>
            

              <tr v-for="(adeudo, index) in resultadosFiltrados" :key="index">
                <td>{{ adeudo['id_turno'] }}</td> <!-- Cambiado 'total.factura.toFixed(2)' por 'adeudo['id_turno']' -->
                <td>${{ adeudo['diferencia'] }}</td> <!-- Cambiado 'total.saldo.toFixed(2)' por 'adeudo['diferencia']' -->
                <td>{{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              </tr>
              <tr v-if="resultadosFiltrados.length > 0">
                <td><strong>Total</strong></td>
                <td>${{ totalImporte.toFixed(2) }}</td> <!-- Nueva fila para el total -->
              </tr>
    
          </table>
          <div style="display: flex; justify-content: center; width: 25%; height: 25%;">
            <div style="width: 120%; height: 120%;">
              <canvas id="myChartPositive"></canvas>
            </div>
          </div>
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
      resultados: [],
      resultadosFiltrados: [], // Nueva propiedad de datos
      fechaInicio: null,
      fechaFin: null,
      dbm: null, // Añadido dbm a los datos
      totalImporte: 0,
      estaciones: {
        1: 'OKTAN REMDU',
        2: 'OKTAN SMART ENERGY',
        3: 'OKTAN COLIBRI',
        4: 'OKTAN CASCADA',
        5: 'GASOLINERA EL MAYORAZGO',
        6: 'GASOLINERA GRANJAS SAN ISIDRO',
        7: 'GASOLINERA CASTILLOTLA',
        8: 'OKTAN PERIFERICO SAN JOSE',
        9: 'OKTAN EKO',
        10: 'OKTAN MAGNUS',
        11: 'OKTAN CLEAN ENERGY',
        12: 'SERVI OKTAN',
        13: 'SERVIOK',
        14: 'GRUPO GASOLINERO EXITO',
        15: 'SERVI K-FIVER',
        16: 'SERVICIO GAS 5',
        17: 'GASOLINERIA SAN FERNANDO',
        18: 'OKTAN SERVITALLERES',
        19: 'OKTAN SERVI PENINSULAR',
        20: 'SERVIGAS-VANGUARD'
      },
    };
  },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = "http://gasserver.dyndns.org:8081/admin/get.php/depositoefectivo";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          console.log(response); // Agrega esto para ver la respuesta de la API
          this.resultados = response.data.data;
          this.resultadosFiltrados = this.resultados; // Asegúrate de asignar los datos filtrados a resultadosFiltrados
          this.totalImporte = this.calcularTotalImporte(this.resultados);
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        this.resultados = [];
        this.totalImporte = 0;
      }
    },

    calcularTotalImporte(resultados) {
      return resultados.reduce((total, adeudo) => total + parseFloat(adeudo['diferencia']), 0);
    },
  },
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
  height: 800px;
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
  margin-left: auto;
  margin-right: 200px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-0.5rem)scale(1.04);
  transform: translateX(-0.5rem)scale(1.04);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.9);
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
</style>


