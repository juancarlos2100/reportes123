<template>
    <div :class="{ 'dark-mode': isDarkMode }" class="container">
        <header>
            <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
        </header>
        <h1>Reporte Operativo</h1>
        <h2>Compra de Carburantes</h2>
        <div>
            <form @submit.prevent="filtrarDatos">
                <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
                <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required>
                    <option disabled value="">Selecciona una estación</option>
                    <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
                </select>

                <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
                <input type="date" v-model="fechaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required :disabled="!dbm">

                <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
                <input type="date" v-model="fechaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 150px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;" required :disabled="!fechaInicio">

                <button class="boton-filtrar" type="submit">Filtrar</button>
            </form>

            <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
            <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>
        </div>

        <div class="container" style="display: flex; height: 100%;">
            <div class="left-container" style="flex: 0 0 90%; overflow: auto;">
                <div v-for="(grupo, producto) in agrupadosPorProducto" :key="producto">
                    <h2>{{ producto }}</h2>
                    
                    <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>Folio-Factura</th>
                                <th>Folio Documento</th>
                                <th>Fecha Documento</th>
                                <th>Fecha Recepción</th>
                                <th>Producto</th>
                                <th>Volumen</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(adeudo, index) in grupo" :key="index">
                                <td><strong>{{ adeudo['provedor'] }}</strong></td>
                                <td>{{ adeudo['folio'] }}</td>
                                <td>{{ adeudo['folioDocumento'] }}</td>
                                <td>{{ adeudo['fechaDocumento'] }}</td>
                                <td>{{ adeudo['fechaRecepcion'] }}</td>
                                <td>{{ adeudo['producto'] }}</td>
                                <td>{{ parseFloat(adeudo['volumen']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}L</td>
                                <td>${{ parseFloat(adeudo['total']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                            </tr>
                            <tr>
                                <td style="font-size: larger;" colspan="6"><tr><strong>Total</strong></tr></td>
                                <td style="font-size: larger;"><strong>{{ calcularTotal(grupo, 'volumen').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}L</strong></td>
                                <td style="font-size: larger;"><strong>${{ calcularTotal(grupo, 'total').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h2 style="text-align: right; margin-right: 120px;">Total General</h2>
                    <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode } " style="margin-left: 1620px; width: 27%">
                        <thead>
                        <tr>
                            <th colspan="6"></th>
                            <th style="text-align: right;">Total Volumen</th>
                            <th style="text-align: right;">Total Monto</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td colspan="6"></td>
                            <td style="text-align: right; font-size: larger;"><strong>{{ calcularTotalGeneral('volumen').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}L</strong></td>
                            <td style="text-align: right; font-size: larger"><strong>${{ calcularTotalGeneral('total').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                    <div class="container" style="display: flex; justify-content: space-around;">
                            <div class="chart-container" style="width: 60%; margin-left: 100px;">
                                <canvas id="pieChartVolumen" style="width: 100%; height: 600px;"></canvas>
                            </div>
                            <div class="chart-container" style="width: 60%; margin-right: 800px;">
                                <canvas id="pieChartTotal" style="width: 100%; height: 600px; margin-right: 200px;"></canvas>
                            </div>
                            </div>
            </div>
        </div>
        <br>
        <br>
    </div>
</template>
 
  <script>
import axios from "axios";
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
  
  export default {
    data() {
      return {
        isDarkMode: true,
        resultados: [],
        resultadosOriginales: [],
        idTipo: null,
        fechaInicio: null,
        fechaFin: null,
        dbm: null,
        estaciones: {},
        mostrarResultados: false
      };
    },
    computed: {
      agrupadosPorProducto() {
        const agrupados = {};
        this.resultados.forEach((adeudo) => {
          if (!agrupados[adeudo.producto]) {
            agrupados[adeudo.producto] = [];
          }
          agrupados[adeudo.producto].push(adeudo);
        });
        return agrupados;
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
        if (this.fechaInicio && this.fechaFin && this.dbm) {
          const url = "http://gasserver.dyndns.org:8081/admin/get.php/comprascarburantes";
          const params = {
            fechaInicio: `${this.fechaInicio}T00:00:00`,
            fechaFin: `${this.fechaFin}T23:59:59`,
            dbm: parseInt(this.dbm)
          };
  
          try {
            const response = await axios.get(url, { params });
            this.resultadosOriginales = response.data.data;
            this.resultados = [...this.resultadosOriginales];
            this.mostrarResultados = true;
            this.updateChart();
          } catch (error) {
            console.error("Error al obtener datos de la API:", error);
          }
        } else {
          this.resultados = [];
          this.mostrarResultados = false;
        }
      },
      calcularTotal(datos, campo) {
        return datos.reduce((total, item) => total + parseFloat(item[campo]), 0);
      },
      calcularTotalGeneral(campo) {
        let totalGeneral = 0;
        for (let producto in this.agrupadosPorProducto) {
        let grupo = this.agrupadosPorProducto[producto];
        totalGeneral += this.calcularTotal(grupo, campo);
        }
        return totalGeneral;
    },
    updateChart() {
    // Obtener los datos para los gráficos
        const labelsPie = Object.keys(this.agrupadosPorProducto);
        const dataPieVolumen = labelsPie.map(producto => this.calcularTotal(this.agrupadosPorProducto[producto], 'volumen'));
        const dataPieTotal = labelsPie.map(producto => this.calcularTotal(this.agrupadosPorProducto[producto], 'total'));

        // Colores base y resaltados para los gráficos
        const baseColors = [
            'rgba(255, 255, 51, 0.4)', // Amarillo neón
            'rgba(255, 51, 102, 0.4)', // Rosa neón
        'rgba(102, 255, 51, 0.4)', // Verde neón
        'rgba(51, 204, 255, 0.4)', // Azul neón
        'rgba(204, 102, 255, 0.4)', // Morado neón
        'rgba(255, 153, 51, 0.4)' // Naranja neón
        ];
        const neonHoverColors = [
            'rgba(255, 255, 51, 9)', // Amarillo neón
            'rgba(255, 51, 102, 9)', // Rosa neón
        'rgba(102, 255, 51, 9)', // Verde neón
        'rgba(51, 204, 255, 8)', // Azul neón
        'rgba(204, 102, 255, 8)', // Morado neón
        'rgba(255, 153, 51, 8)' // Naranja neón
        ];

        // Crear gráfico de pastel para el volumen total
        const ctxPieVolumen = document.getElementById('pieChartVolumen').getContext('2d');
        if (this.pieChartVolumen) {
        this.pieChartVolumen.destroy();
        }
        this.pieChartVolumen = new Chart(ctxPieVolumen, {
        type: 'doughnut',
        data: {
            labels: labelsPie,
            datasets: [{
            data: dataPieVolumen,
            backgroundColor: baseColors,
            hoverBackgroundColor: neonHoverColors,
            borderColor: '#ffffff', // Borde blanco
            borderWidth: 2 // Ancho del borde
            }]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'VOLUMEN TOTAL POR PRODUCTO',
                color: this.isDarkMode ? '#ffffff' : '#000000' // Color del título dependiendo del modo
            }
            }
        }
        });

        // Crear gráfico de pastel para el total general
        const ctxPieTotal = document.getElementById('pieChartTotal').getContext('2d');
        if (this.pieChartTotal) {
        this.pieChartTotal.destroy();
        }
        this.pieChartTotal = new Chart(ctxPieTotal, {
        type: 'doughnut',
        data: {
            labels: labelsPie,
            datasets: [{
            data: dataPieTotal,
            backgroundColor: baseColors,
            hoverBackgroundColor: neonHoverColors,
            borderColor: '#ffffff', // Borde blanco
            borderWidth: 2 // Ancho del borde
            }]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'VENTA TOTAL POR PRODUCTO',
                color: this.isDarkMode ? '#ffffff' : '#000000' // Color del título dependiendo del modo
            }
            }
        }
        });
    },
    async downloadPDF() {
        let doc = new jsPDF();

        // Título del reporte con periodo de fechas y estación seleccionada
        const titulo = `Compra de Carburantes - Estación: ${this.estaciones[this.dbm]}  \n Del (${this.fechaInicio} al ${this.fechaFin})`;
        doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });

        // Encabezado de la tabla de transacciones registradas
        const encabezado = "Transacciones Registradas";
        doc.text(encabezado, 10, 30, { fontSize: 16 });

        // Generar tabla de transacciones registradas
        const transaccionesTableData = [];
        this.resultados.forEach(adeudo => {
            const rowData = [
                adeudo.provedor,
                adeudo.folio,
                adeudo.folioDocumento,
                adeudo.fechaDocumento,
                adeudo.fechaRecepcion,
                adeudo.producto,
                `${parseFloat(adeudo.volumen).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}L`,
                `$${parseFloat(adeudo.total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
            ];
            transaccionesTableData.push(rowData);
        });

        // Agregar tabla de transacciones registradas al PDF
        autoTable(doc, {
            head: [['Proveedor', 'Folio-Factura', 'Folio Documento', 'Fecha Documento', 'Fecha Recepción', 'Producto', 'Volumen', 'Monto']],
            body: transaccionesTableData,
            startY: 40,
            headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
        });

        // Footer del PDF
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 2);
        }

        // Guardar el PDF
        doc.save('Reporte_Compra_Carburantes.pdf');
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
 
 
 
