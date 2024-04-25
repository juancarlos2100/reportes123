<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Ventas Periodo</h2>
    <form @submit.prevent="filtrarDatos">
      <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
      <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
        <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
      </select>

      <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

      <input type="time" v-model="horaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" >

      <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" >

      <input type="time" v-model="horaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"  style="width: 200px;height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>

    <!-- Iterar sobre los datos agrupados por día -->
    <div v-for="(grupo, index) in productosPorDia" :key="index">
      <h2>{{ grupo.fecha }}</h2>
      <!-- Tabla para cada día -->
      <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
        <thead>
          <tr>
            <th>fecha</th>
            <th>id</th>
            <th>producto</th>
            <th>inicial</th>
            <th>compra</th>
            <th>jarras</th>
            <th>venta</th>
            <th>ventastanque</th>
            <th>final</th>
            <th>fincalculado</th>
            <th>diferencia</th>
            <th>merma</th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterar sobre los productos de cada día -->
          <tr v-for="(adeudo, index) in grupo.productos" :key="index">
            <td>{{ adeudo['fecha'] }}</td>
            <td>{{ adeudo['id'] }}</td>
            <td>{{ adeudo['producto'] }}</td>
            <td>{{ parseFloat(adeudo['inicial']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['compra']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['jarras']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['venta']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['ventastanque']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['final']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['fincalculado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(adeudo['merma']).toFixed(2) }}</td>
          </tr>
          <!-- Calcular y mostrar fila extra para total -->
          <tr>
            <td>Total</td>
            <td></td>
            <td></td>
            <td>{{ parseFloat(grupo.total.inicial).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.compra).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.jarras).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.venta).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.ventastanque).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.final).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.fincalculado).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.diferencia).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
            <td>{{ parseFloat(grupo.total.merma).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Contenedor para los gráficos -->
  </div>
</template>

<script>
import axios from "axios";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      isDarkMode: true,
      resultados: [],
      selectedEstacion: null,
      mostrarResultados: false,
      productosIndividuales: [],
      total: {},
      dbm: null,
      turnoInicio: null,
      turnoFin: null,
      estaciones: {},
      pieChart: null,
      barChart: null
    };
  },
  computed: {
    productosPorDia() {
      const productosPorDia = [];
      const grouped = this.productosIndividuales.reduce((acc, producto) => {
        const fecha = producto.fecha;
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(producto);
        return acc;
      }, {});
      
      for (const fecha in grouped) {
        const productos = grouped[fecha];
        const total = this.calcularTotal(productos);
        productosPorDia.push({ fecha, productos, total });
      }

      return productosPorDia;
    }
  },
  methods: {
    async cargarEstaciones() {
      const url = 'http://192.168.1.68/admin/get.php/estaciones';
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
      if (this.fechaInicio && this.fechaFin && this.dbm) {
        const url = "http://192.168.1.68/admin/get.php/inventariodiario";
        const params = {
          fechaInicio: `${this.fechaInicio}T00:00:00`,
          fechaFin: `${this.fechaFin}T12:00:00`,
          dbm: parseInt(this.dbm)
        };

        try {
          const response = await axios.get(url, { params });
          this.productosIndividuales = response.data.data;

          // Buscar el total y asignarlo
          this.total = this.productosIndividuales.find(item => item.id === 'total');
          // Filtrar los productos individuales
          this.productosIndividuales = this.productosIndividuales.filter(item => item.id !== 'total');

          // Actualizar los gráficos
          //this.updateChart();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        console.error("Por favor, selecciona una estación y proporciona los turnos de inicio y fin.");
      }
    },
    calcularTotal(productos) {
      const total = {};

      productos.forEach(producto => {
        for (const key in producto) {
          if (!isNaN(parseFloat(producto[key]))) {
            total[key] = (total[key] || 0) + parseFloat(producto[key]);
          }
        }
      });

      return total;
    },
    async downloadPDF() {
    let doc = new jsPDF('l', 'pt', 'letter');

    // Título del reporte con periodo de fechas y banco seleccionado
    const titulo = `Ventas-Periodo por fecha - Estación: ${this.estaciones[this.dbm]}  \n Del (${this.fechaInicio} al ${this.fechaFin})`;
    doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center', fontStyle: 'bold' });

    // Iterar sobre los datos agrupados por día
    let posY = 60; // Posición vertical inicial para las tablas
    this.productosPorDia.forEach(grupo => {
      // Agregar título para cada día
      doc.text(grupo.fecha, doc.internal.pageSize.getWidth() / 2, posY + 25, { align: 'center' }); // Centra la fecha

      // Generar tabla para cada día
      const transaccionesTableData = [];
      grupo.productos.forEach(adeudo => {
        const rowData = [
          adeudo['fecha'],
          adeudo['id'],
          adeudo['producto'],
          parseFloat(adeudo['inicial']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['compra']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['jarras']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['venta']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['ventastanque']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['final']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['fincalculado']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['diferencia']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          parseFloat(adeudo['merma']).toFixed(2)
        ];
        transaccionesTableData.push(rowData);
      });

      // Agregar fila extra para total
      const totalRow = [
        'Total',
        '',
        '',
        parseFloat(grupo.total.inicial).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.compra).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.jarras).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.venta).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.ventastanque).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.final).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.fincalculado).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.diferencia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        parseFloat(grupo.total.merma).toFixed(2)
      ];
      transaccionesTableData.push(totalRow);

      // Agregar tabla de transacciones para cada día al PDF
      autoTable(doc, {
        head: [['fecha', 'id', 'producto', 'inicial', 'compra', 'jarras', 'venta', 'ventastanque', 'final', 'fincalculado', 'diferencia', 'merma']],
        body: transaccionesTableData,
        startY: posY + 45, // Ajusta la posición vertical según la necesidad
        headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
      });

      posY = doc.lastAutoTable.finalY + 30; // Actualizar la posición vertical para la siguiente tabla
    });

    // Guardar el PDF
    doc.save('Reporte_Operativo.pdf');
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
  width: 90%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
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
  width: 110vw;
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
  width: 90%; /* Ancho de la tabla */
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
</style>