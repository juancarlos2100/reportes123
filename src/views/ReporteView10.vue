<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Logotipo de oktan">
    </header>
    <h1>Reporte de Gastos</h1>
    <div>
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" @change="cargarBancos" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option value="" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <div class="checkbox-container">
          <h2>Bancos</h2>
        <div class="checkboxes-wrapper">
          <div v-for="(nombre, id) in bancos" :key="id">
            <input type="checkbox" v-model="bancosSeleccionados" :value="id" id="banco-{{ id }}" class="form-checkbox" :class="{ 'dark-mode-checkbox': isDarkMode }" :disabled="!dbm">
            <label :for="'banco-' + id" class="checkbox-label">{{ nombre }}</label>
          </div>
        </div>
      </div>




        <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" >

        <input type="time" v-model="horaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" >

        <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" >

        <input type="time" v-model="horaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"  style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

        <button class="boton-filtrar" type="submit" :disabled="!horaFin">Filtrar</button>
      </form>

      <button class="boton-descargar" @click="downloadPDF" :disabled="!horaFin">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel" :disabled="!horaFin">Descargar XLS</button>
    </div>


    <h1 style="text-align: left; margin-left: 50px">Santander</h1>

    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
     
      <div class="left-container" style="flex: 0 0 70%; overflow: auto;">
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
          <thead>
            <tr>
              <th>Banco</th>
              <!--<th>id</th>-->
              <th>Descripcion</th>
              <th>Movimiento</th>
               <!-- <th>Fecha Contable</th>-->
              <th>Monto</th>
              
              
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['banco'] }}</td>
              <!-- <td>{{ adeudo['id_transaccion'] }}</td>-->
              <td>{{ adeudo['descripcion'].length > 45 ? adeudo['descripcion'].slice(0, 45) + '...' : adeudo['descripcion'] }}</td>
              <td><strong>{{ adeudo['id_tipo'] === '1' ? 'Abonos' : (adeudo['id_tipo'] === '2' ? 'Cargos' : 'otro') }}</strong></td>
              <!--<td>{{ adeudo['fecha_contable'] }}</td>-->
              <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <!--<td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>-->
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
  <div class="right-container" style="flex: 0 0 30%; overflow: auto;">
    <h1>Tablero de Gráficas</h1>
    <h3>Proporcion de Cargos-Abonos</h3>
    <div class="chart-container1">
      <canvas id="polarChart"></canvas>
    </div>
    <div class="chart-container">
      <canvas id="barChart"></canvas>

    <div>
  </div>
    </div>
    <div class="cont-total">

      <br>
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
      selectedEstacion: null,
      mostrarResultados: false,
      resultadosOriginales: [],
      bancosSeleccionados: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
      dbm: null,
      totalesPorBanco2: {},
      bancoSeleccionado: null, 
      estaciones: {},
      bancos: {}, 
      porcentajeCuentaNoPagada: 0,
      correlacion: {},
      segmentosClientes: {},
      mostrarAlertas: false,
      horaInicio: '',
    horaFin: ''
    };
  },

  methods: {

    async cargarEstaciones() {
      const url = 'http://192.168.1.235/admin/get.php/estaciones';
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
    async cargarBancos() {
      if (this.dbm) {
        const url = `http://192.168.1.235/admin/get.php/listabanco?dbm=${this.dbm}`;
        try {
          const response = await axios.get(url);
          this.bancos = response.data.data.reduce((acc, item) => {
            acc[item.id_cuenta] = item.banco;
            return acc;
          }, {});
        } catch (error) {
          console.error("Error al obtener los bancos:", error);
        }
      } else {
        console.error("Por favor, selecciona una estación.");
      }
    },
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = `http://192.168.1.235/admin/get.php/transaccionesbanco`;
        const fechaInicioConHora = `${this.fechaInicio}T${this.horaInicio}:00`;
        const fechaFinConHora = `${this.fechaFin}T12:00:00`;

        const params = {
          fechaInicio: fechaInicioConHora,
          fechaFin: fechaFinConHora,
          dbm: parseInt(this.dbm),
          bancos: this.bancosSeleccionados // Enviar bancos seleccionados como parámetro
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data;
          this.filtrarPorBanco();
          this.calcularTotalesPorBanco();
          this.mostrarResultados = true;
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        console.error("Por favor, selecciona una estación y proporciona las fechas de inicio y fin.");
      }
    },
    filtrarPorBanco() {
  if (this.bancosSeleccionados.length > 0) { // Verificar si hay bancos seleccionados
    let resultadosFiltrados = this.resultadosOriginales.filter(adeudo => this.bancosSeleccionados.includes(adeudo.id_cuenta) && adeudo.id_tipo === '2');
    
    let agrupados = {};
    resultadosFiltrados.forEach(adeudo => {
      if (!agrupados[adeudo.descripcion]) {
        agrupados[adeudo.descripcion] = {
          ...adeudo,
          monto: 0,
          saldo: 0
        };
      }
      agrupados[adeudo.descripcion].monto += parseFloat(adeudo.monto);
      agrupados[adeudo.descripcion].saldo += parseFloat(adeudo.saldo);
    });

    this.resultados = Object.values(agrupados);
  } else {
    this.resultados = [...this.resultadosOriginales];
  }
},

    calcularTotalesPorBanco() {
    const totalesPorBanco = {};
    const porcentajeLimite = 15;
    let alertaMostrada = false; 

    this.resultados.forEach(adeudo => {
        const banco = adeudo.banco;
        const tipo = adeudo.id_tipo;
        const monto = parseFloat(adeudo.monto);
        if (!totalesPorBanco[banco]) {
            totalesPorBanco[banco] = {
                cargos: 0,
                abonos: 0,
                saldo: 0,
                saldoFinal: 0,
                ultimoSaldo: 0,
            };
        }
        if (tipo === '1') {
            totalesPorBanco[banco].abonos += monto;
        } else if (tipo === '2') {
            totalesPorBanco[banco].cargos += monto;
        }
        totalesPorBanco[banco].saldo += parseFloat(adeudo.saldo);
        totalesPorBanco[banco].saldoFinal = Math.abs(totalesPorBanco[banco].abonos - totalesPorBanco[banco].cargos);

        if (adeudo.banco && adeudo.saldo) {
            totalesPorBanco[adeudo.banco].ultimoSaldo = adeudo.saldo;
        }
        const porcentajeCuentaNoPagada = (totalesPorBanco[banco].saldoFinal / totalesPorBanco[banco].cargos) * 100;
        this.porcentajeCuentaNoPagada = porcentajeCuentaNoPagada; 

        if (porcentajeCuentaNoPagada > porcentajeLimite) {
            console.log(`¡Atención! La deuda para el banco ${banco} supera el ${porcentajeLimite}%.`);
            alertaMostrada = true;
        }
    });
    if (!alertaMostrada) {
        console.log("Deuda al banco no supera el 15 porciento.");
    }
    this.totalesPorBanco = totalesPorBanco;
    //this.updateChart();
},

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
  height: 600px;
  margin-left: 5px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.chart-container1 {
  width: 90%;
  height: 700px;
  margin-left: 100px;
  margin-right: 10px;
  margin-bottom: 100px;
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
.dark-mode {
  background-color: #333; /* Color de fondo oscuro */
  color: #fff; /* Color de texto blanco */
  width: 100vw;
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
.checkbox-container {
  align-items: center;
}

.checkbox-label {
  margin-left: 8px;
  font-size: 20px;
  color: #333; /* Color de texto en modo claro */
}

.dark-mode .checkbox-label {
  color: #fff; /* Color de texto en modo oscuro */
}
.checkboxes-wrapper {
  padding-top: 5px;
  display: inline-block;
  text-align: left;
}

</style>