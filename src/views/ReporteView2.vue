<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Bancos</h2>
    <div> 
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" maxlength="10" style="margin-right:10px; width: 150px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" maxlength="10" style="margin-right:10px; width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>
    </div>

    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 55%; overflow: auto;">
        <h1>Transacciones Registradas</h1>
        <table class="table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>id de estacion</th>
              <!--<th>id transaccion</th>-->
              <th>id cuenta </th>
              <th>id tipo</th>
              <!--<th>Fecha Contable</th>-->
              <th>Monto</th>
              <th>Saldo</th>
              
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['banco'] }}</td>
              <td>{{ adeudo['id_dbm'] }}</td>
              <!-- <td>{{ adeudo['id_transaccion'] }}</td>-->
              <td>{{ adeudo['id_cuenta'] }}</td>
              <td>{{ adeudo['id_tipo'] }}</td>
              <!--<td>{{ adeudo['fecha_contable'] }}</td>-->
              <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <!--<td>{{ adeudo['estado'] }}</td>-->
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5">No se encontraron registros que coincidan con su búsqueda</td>
            </tr>
          </tbody>
        </table>
        <br>
      </div>

  <!-- Lado derecho -->
  <div class="right-container" style="flex: 0 0 45%; overflow: auto;">
    <h1>Tablero de Gráficas</h1>
    <div class="chart-container">
      <canvas id="myChart"></canvas>
    </div>
    <!-- Nuevo gráfico de pastel (chart2) -->
    <div class="chart-container">
      <canvas id="myPieChart"></canvas>
    </div>
    <div class="cont-total">
      <h2>Ultimas Transacciones del Periodo</h2>
      <table class="tabla-totales">
        <thead>
          <tr>
            <th>Banco</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(saldo, banco) in totalesPorBanco" :key="banco">
            <td><strong>{{ banco }}</strong></td>
            <td><strong>${{ Number(saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          </tr>
        </tbody>
      </table>
      <br>
      <h1>Total de Cargos y Abonos por Banco</h1>
      <table class="tabla-totales">
        <thead>
          <tr>
            <th>Banco</th>
            <th>Cargos</th>
            <th>Abonos</th>
            <th>Saldo</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterar sobre los totalesPorBanco2 y mostrar en filas -->
            <tr v-for="(totales, banco) in bancosFiltrados" :key="banco">
          <td>{{ banco }}</td>
          <td>${{ totales.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          <td>${{ totales.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          <td>${{ totales.saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          <td>${{ totales.saldoFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
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
//import Chart from 'chart.js/auto';
//import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      resultados: [],
      selectedEstacion: null,
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
      mostrarResultados: false,
      resultadosOriginales: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
      dbm: null,
      totalesPorBanco2: {},
      bancos: ['SANTANDER', 'BBVA', 'BANAMEX', 'BANCOMER', 'BAJIO', 'CAJA CHICA', 'INBURSA'],
    };
  },
      computed: {
        bancosFiltrados() {
          const bancosFiltrados = {};
          for (const banco in this.totalesPorBanco2) {
            if (this.bancos.includes(banco)) {
              bancosFiltrados[banco] = this.totalesPorBanco2[banco];
            }
          }
          return bancosFiltrados;
        }
      },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = `http://gasserver.dyndns.org:8081/admin/get.php/transaccionesbanco`;
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data; // Guardar los datos originales
          this.resultados = [...this.resultadosOriginales]; // Actualizar resultados con los datos originales
          this.calcularUltimoSaldoPorBanco();
          this.mostrarResultados = true; // Mostrar la tabla de resultados
           // Calcular los totales por banco para la tabla2
          this.calcularTotalesPorBanco();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        // Manejo si no se selecciona una estación o no se proporcionan fechas
        
      }
    },

    calcularUltimoSaldoPorBanco() {
      const registrosUnicos = {};
      this.totalesPorBanco = this.resultados.reduce((totales, adeudo) => {
        if (adeudo['banco'] && adeudo['saldo']) {
          // Verificar si ya existe un registro para este banco
          if (!Object.prototype.hasOwnProperty.call(registrosUnicos, adeudo['banco'])) {
            // Si no existe, añadir este registro como el último
            totales[adeudo['banco']] = adeudo['saldo'];
            registrosUnicos[adeudo['banco']] = adeudo;
          } else {
            // Si ya existe, comparar las fechas para determinar cuál es más reciente
            const registroExistente = registrosUnicos[adeudo['banco']];
            const fechaActual = new Date(adeudo['fecha']);
            const fechaExistente = new Date(registroExistente['fecha']);

            if (fechaActual > fechaExistente) {
              // Si la fecha actual es más reciente, actualizar el registro
              totales[adeudo['banco']] = adeudo['saldo'];
              registrosUnicos[adeudo['banco']] = adeudo;
            }
          }
        }
        return totales;
      }, {});
      //this.updateChart();
    },
      
    calcularTotalesPorBanco() {
        const totalesPorBanco = {};

        // Recorrer los resultados para calcular los totales por banco
        this.resultados.forEach(adeudo => {
          const banco = adeudo['banco'];

          // Verificar si el banco ya existe en los totales
          if (!totalesPorBanco[banco]) {
            totalesPorBanco[banco] = {
              cargos: 0,
              abonos: 0,
              saldo: 0,
              saldoFinal: 0  // Agregamos el saldoFinal
            };
          }

          // Sumar el monto a los cargos o abonos según corresponda
          if (parseFloat(adeudo['monto']) < 0) {
            // Si el monto es negativo, es un cargo
            totalesPorBanco[banco].cargos += Math.abs(parseFloat(adeudo['monto']));
          } else {
            // Si el monto es positivo, es un abono
            totalesPorBanco[banco].abonos += parseFloat(adeudo['monto']);
          }

          // Sumar el saldo
          totalesPorBanco[banco].saldo += parseFloat(adeudo['saldo']);

          // Calcular el saldo final
          totalesPorBanco[banco].saldoFinal = totalesPorBanco[banco].abonos + totalesPorBanco[banco].saldo;
        });

        // Actualizar la tabla2 con los totales por banco
        this.totalesPorBanco2 = totalesPorBanco;
      }



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
  width: 100pxs;
}

.table:hover {
  transform: translateY(-0.3rem);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}
.tabla-totales {
  width: 800px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 100px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  
  
}
.tabla-totales:hover {
  transform: translateY(-0.03rem)scale(1.01);
  
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
</style>