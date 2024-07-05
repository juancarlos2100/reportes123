<template>
    <div :class="{ 'dark-mode': isDarkMode }" class="container">
        <header>
            <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
        </header>
        <h1>Reporte de Utilidad</h1>
       
        <div>
            <form @submit.prevent="filtrarDatos" :class="{ 'dark-mode-form': isDarkMode }">
          <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
          <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
              <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
          </select>

          <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
          <input type="date" v-model="fechaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

          <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
          <input type="date" v-model="fechaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

          <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
            <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
            <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>
        </div>
        <div class="container" style="display: flex; height: 100%;">
            <!-- Lado izquierdo -->
            <div class="left-container" style="flex: 0 0 100%; overflow: auto;">
                <h1> Utilidad por Producto</h1>

                <!-- Primera tabla -->
                <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
                    <thead>
                        <tr>
                            <th>PRODUCTOS</th>
                            <th>Lectura Inicial</th>
                            <th>Compras</th>
                            <th>SUMA</th>
                            <th>Lecura Final</th>
                            <th>TOTAL</th>
                            <th>MERMA</th>
                        </tr>
                    </thead>
                    <tbody v-if="mostrarResultados">
                        <tr v-for="(adeudo, index) in resultados" :key="index">
                            <td><strong>{{ adeudo['producto'] }}</strong></td>
                            <td>{{ adeudo['inicio'] }}</td>
                            <td>{{ parseFloat(adeudo['compras']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>{{ parseFloat(adeudo['suma']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>{{ parseFloat(adeudo['fin']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>{{ parseFloat(adeudo['total']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['merma']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td style="text-align: center;" colspan="7">No se encontraron registros que coincidan con su búsqueda</td>
                        </tr>
                    </tbody>
                </table>
                
                <br>

                <!-- Segunda tabla -->
                <table :class="{ 'table': !isDarkMode, 'dark-mode-saldo-anterior-table': isDarkMode }">
                    <thead>
                        <tr>
                            <th>PRODUCTOS</th>
                            <th>Precio Compra Promedio</th>
                            <th>Precio Venta Promedio</th>
                            <th>Utilidad por Litro</th>
                            <th>Venta Mensual en LTS</th>
                            <th>Utilidad Producto</th>
                            <th>Jarras</th>
                        </tr>
                    </thead>
                    <tbody v-if="mostrarResultados">
                        <tr v-for="(adeudo, index) in resultados" :key="index">
                            <td><strong>{{ adeudo['producto'] }}</strong></td>
                            <td>${{ parseFloat(adeudo['precio_compra']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['precio_venta']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['utilidad_litro']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['venta_mensual']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['utilidad_producto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td>${{ parseFloat(adeudo['jarras']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                        </tr>
                        <!-- Fila extra para la suma de utilidad_producto -->
                        <tr>
                            <td colspan="5" style="font-weight: bold;">Total Utilidad Producto</td>
                            <td style="font-weight: bold;">${{ sumaUtilidadProducto.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            <td></td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td style="text-align: center;" colspan="7">No se encontraron registros que coincidan con su búsqueda</td>
                        </tr>
                    </tbody>
                </table>
                
                <br>
            </div>
            <!-- Lado derecho -->
            
        </div>
    </div>
</template>

<script>
import axios from "axios";
//import Chart from 'chart.js/auto';
//import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';
//import ExcelJS from 'exceljs'

export default {
    data() {
        return {
            resultados: [],
            resultadosOriginales: [], // Nuevo atributo
            idTipo: null,
            estatus: null,
            fechaInicio: null,
            fechaFin: null,
            dbm: null, // Nuevo atributo para la estación
            estaciones: {},
            mostrarResultados: false,
            isDarkMode: true,
        };
    },
    computed: {
        sumaUtilidadProducto() {
            return this.resultados.reduce((sum, adeudo) => sum + parseFloat(adeudo.utilidad_producto), 0);
        }
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
            if (this.dbm) {
                const url = "http://gasserver.dyndns.org:8081/admin/get.php/utilidadventas";
                const params = {
                  fechaInicio: this.fechaInicio,
                  fechaFin: this.fechaFin,
                  dbm: parseInt(this.dbm)
                };

                try {
                    const response = await axios.get(url, { params });
                    this.resultadosOriginales = response.data.data;
                    this.resultados = [...this.resultadosOriginales];
                    this.mostrarResultados = true;
                } catch (error) {
                    console.error("Error al obtener datos de la API:", error);
                }
            } else {
                // Manejo si no se selecciona una estación o no se proporcionan fechas
                this.resultados = [];
                this.mostrarResultados = false;
            }
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
  width: 80%; /* Ancho de la tabla */
  margin-bottom: 2px; /* Margen inferior */
  text-align: right; /* Alineación del texto a la derecha */
  margin-left: 150px;
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


  .tooltip {
  position: relative;
  cursor: pointer;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 160px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -80px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
  </style>
  