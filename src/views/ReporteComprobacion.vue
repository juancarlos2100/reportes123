<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <!-- IMAGEN DE ENCABEZADO -->
    <div>
      <header>
        <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
      </header>
    </div>

    <!-- TÍTULO -->
    <h1>Comprobacion</h1>
    <br>
    <form @submit.prevent="filtrarDatos">
      <div>
        <!-- SELECCIONAR MES -->
        <label for="idTurnoInicial" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Selecciones Mes,
            Año y Estación</label>
        <br><br>
        <label for="mes" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Mes:</label>
        <select v-model="mesSeleccionado" id="mes" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
          style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required @change="generarFechas">
        <option v-for="(mes, index) in meses" :key="index" :value="index + 1">{{ mes }}</option>
        </select>

        <!-- SELECCIONAR AÑO -->
        <label for="anio" style="font-size: 20px; font-weight: bold; padding-right: 10px; margin-left: 10px;">Año:</label>
        <select v-model="anioSeleccionado" id="anio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
          style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
          required @change="generarFechas">
          <option v-for="anio in anios" :key="anio" :value="anio">{{ anio }}</option>
        </select>
      </div>

        <!-- SELECCIONAR ESTACIÓN -->
        <label for="estacion"
          style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
          style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
          required>
          <option value="null" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>


        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>
  </div>
</template>


<script>
import axios from 'axios';
  
  export default{
    data(){
      return{
        estaciones: {}, // {id_dbm: 'nombre'}
        isDarkMode: true,
        dbm: 1,
        meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        anios: this.generarAnios(),
      }
    },
    mounted(){
      this.cargarEstaciones();
    },
    methods:{
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
      generarAnios() {
        const anioActual = new Date().getFullYear();
        const anios = [];
        for (let anio = anioActual; anio >= 2017; anio--) {
          anios.push(anio);
        }
        return anios;
      },
    }
  }
</script>

<style scoped>
#chartContainer {
  display: flex;
  justify-content: center;
  align-items: left;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 2rem;
  align-items: center;
  padding-bottom: 2rem;
  /* Margen inferior */
  max-width: 100vw;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  /* Ajusta según sea necesario */
}

.tabla-totales {
  width: 40%;
  /* Cambia esto al ancho que desees */
  height: auto;
  /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: auto;
}



th,
td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
  /* Ajusta según sea necesario */
}

th {
  background-color: #f2f2f2;
}

td:first-child {
  /* Establece el ancho de la primera columna */
  width: 300px;
  /* Ajusta este valor según tus necesidades */
}

.imagen-encabezado {
  width: 350px;
  /* Cambia esto al ancho que desees */
  height: 100px;
  /* Cambia esto a la altura que desees */
  display: block;
  margin-left: 0;
  margin-right: auto;
}

.title {
  margin-left: auto;
  margin-right: auto;
  margin-top: auto;

}

.boton-descargar {
  background-color: #53980d;
  /* Verde */
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
  background-color: #53980d;
  /* Verde */
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


/* FONDOS OSCUROS */

.boton-filtrar:hover {
  background-color: #3b6e22;
  /* Verde oscuro al pasar el cursor */
  transform: translateY(-0.5rem);
  /* Desplazamiento hacia arriba */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  /* Sombra debajo */
}

.boton-filtrar:active {
  transform: scale(1.2);
  /* Aumentar un poco el tamaño al hacer clic */
}

.cont-total {

  margin-top: 60px;
  align-items: center;
}

.dark-mode {
  background-color: #333;
  /* Color de fondo oscuro */
  color: #fff;
  /* Color de texto blanco */
  width: 100vw;
  min-height: 100vh;
}

.dark-mode-select,
.dark-mode-input {
  background-color: #444;
  /* Color de fondo oscuro para select e input */
  color: #fff;
  /* Color de texto blanco para select e input */

}

.dark-mode-table {
  color: #fff;
  /* Color del texto en modo oscuro */
  background-color: #333;
  /* Color de fondo en modo oscuro */
  border-collapse: collapse;
  /* Colapsar los bordes de la tabla */
  width: 95%;
  /* Ancho de la tabla */
  margin-top: 20px;
  /* Margen superior */
  margin-bottom: 8px;
  /* Margen inferior */
  margin-left: 20px;
}

.dark-mode-table td:first-child {
  column-width: 50%;
  /* Reduce a la mitad el ancho de la primera columna */
}

.dark-mode-table th,
.dark-mode-table td {
  border: 1px solid #ddd;
  /* Borde de las celdas en modo oscuro */
  padding: 8px;
  /* Espaciado interno de las celdas */
  text-align: left;
  /* Alineación del texto en las celdas */
}

.dark-mode-table th {
  background-color: #555;
  /* Color de fondo de los encabezados en modo oscuro */
  color: #fff;
  /* Color del texto de los encabezados en modo oscuro */
}

.dark-mode-saldo-anterior-table {
  color: #fff;
  /* Color del texto en modo oscuro */
  background-color: #333;
  /* Color de fondo en modo oscuro */
  border-collapse: collapse;
  /* Colapsar los bordes de la tabla */
  width: 95%;
  /* Ancho de la tabla */
  margin-bottom: 2px;
  /* Margen inferior */
  text-align: right;
  /* Alineación del texto a la derecha */
  margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
  border: 1px solid #ddd;
  /* Borde de las celdas en modo oscuro */
  padding: 8px;
  /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
  background-color: #555;
  /* Color de fondo de los encabezados en modo oscuro */
  color: #fff;
  /* Color del texto de los encabezados en modo oscuro */
}

.dark-mode .tabla-totales {
  background-color: #333;
  /* Fondo oscuro */
  color: #fff;
  /* Texto blanco */
  border-collapse: collapse;
  /* Colapso de bordes */
  width: 100%;
  /* Ancho completo */
}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
  border: 1px solid #fff;
  /* Borde blanco */
  padding: 8px;
  /* Espaciado interno */
  text-align: center;
  /* Alineación centrada */
}

.dark-mode .tabla-totales th {
  background-color: #555;
  /* Color de fondo para encabezados */
}

.dark-mode-saldo-anterior-table {
  color: #fff;
  /* Color del texto en modo oscuro */
  background-color: #333;
  /* Color de fondo en modo oscuro */
  border-collapse: collapse;
  /* Colapsar los bordes de la tabla */
  width: 95%;
  /* Ancho de la tabla */
  margin-bottom: 2px;
  /* Margen inferior */
  text-align: right;
  /* Alineación del texto a la derecha */
  margin-left: 20px;
}

.dark-mode-saldo-anterior-table th,
.dark-mode-saldo-anterior-table td {
  border: 1px solid #ddd;
  /* Borde de las celdas en modo oscuro */
  padding: 8px;
  /* Espaciado interno de las celdas */
}

.dark-mode-saldo-anterior-table th {
  background-color: #555;
  /* Color de fondo de los encabezados en modo oscuro */
  color: #fff;
  /* Color del texto de los encabezados en modo oscuro */
}

.dark-mode .tabla-totales {
  background-color: #333;
  /* Fondo oscuro */
  color: #fff;
  /* Texto blanco */
  width: 100%;
  /* Ancho completo */

}

.dark-mode .tabla-totales th,
.dark-mode .tabla-totales td {
  border: 1px solid #fff;
  /* Borde blanco */
  padding: 8px;
  /* Espaciado interno */
  text-align: center;
  /* Alineación centrada */
}

.dark-mode .tabla-totales th {
  background-color: #555;
  /* Color de fondo para encabezados */
}
</style>