<template>
  <div id="resultado">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Reporte Operativo</h1>
    <h2> Saldos Proveedores</h2>
    <h3> Pipas por pagar</h3>
    <form @submit.prevent="filtrarDatos">
      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">


      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="downloadPDF">Descargar XLS</button>
    <table>
      <thead>
        <tr>
           <!--<th>ID Proveedor</th>-->
          <!--<th>Estatus</th>-->
          <!--<th>Factura</th>-->
          <th>Folio-Factura</th>
          <th>Saldo</th>
          <th>Fecha</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultados" :key="index">
          <!--<td>{{ adeudo['id_proveedor'] }}</td>-->
          <!--<td>{{ adeudo['estatus'] }}</td>-->
          <!--<td>{{ adeudo['id_factura'] }}</td>-->
          <td>{{ adeudo['folio'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>{{ adeudo['fecha_creacion'] }}</td>
          <td>{{ adeudo['nombre'] }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Nueva tabla con las sumas totales -->
    <table class="tabla-totales">
  <thead>
    <tr>
      <th>Factura</th>
      <th>Importe</th>
      <th>Pipas por pagar</th> <!-- Nueva columna -->
    </tr>
  </thead>
  <tbody>
    <tr v-for="(total, nombre) in totalesPorNombre" :key="nombre">
      <td>{{ total.factura.toFixed(2) }}</td> <!-- Valor de la factura -->
      <td>${{ parseFloat(total.saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
      <td>{{ nombre }}</td>
    </tr>
  </tbody>
</table>
    <div style="display: flex; justify-content: center; width: 25%; height: 25%;">
      <div style="width: 120%; height: 120%;">
        <canvas id="myChartPositive"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
//import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      resultados: [],
      resultadosOriginales: [], // Nuevo atributo
      idTipo: null,
      estatus: null,
      fechaInicio: null,
      fechaFin: null,
      totalesPorNombre: {},
    };
  },
  methods: {
    async filtrarDatos() {
      if (this.fechaInicio && this.fechaFin) {
        const url = "http://192.168.1.90/admin/get.php/saldospipas";
        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        };

        try {
          const response = await axios.get(url, { params });
          this.resultadosOriginales = response.data.data;
          this.resultados = [...this.resultadosOriginales];
          this.calcularTotalesPorNombre();
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      } else {
        this.resultados = [...this.resultadosOriginales];
        this.calcularTotalesPorNombre();
      }
    },
    calcularTotalesPorNombre() {
      this.totalesPorNombre = this.resultados.reduce((totales, adeudo) => {
        const nombre = adeudo['nombre'];
        if (!totales[nombre]) {
          totales[nombre] = { saldo: 0, factura: 0 };
        }
        totales[nombre].saldo += Number(adeudo['saldo']);
        totales[nombre].factura += Number(adeudo['id_factura']); // Asume que 'id_factura' es el valor de la factura
        return totales;
      }, {});
    },
    async downloadPDF() {
  let doc = new jsPDF();
  let yOffset = 10;

  // Encabezado del PDF
  doc.text('Reporte Operativo', doc.internal.pageSize.getWidth() / 2, yOffset, { align: 'center', fontStyle: 'bold' });
  doc.text('Saldos Proveedores', doc.internal.pageSize.getWidth() / 2, yOffset + 10, { align: 'center' });
  doc.text('Pipas por pagar', doc.internal.pageSize.getWidth() / 2, yOffset + 20, { align: 'center' });
  doc.text(`Del:  ${this.fechaInicio} al:  ${this.fechaFin}`, doc.internal.pageSize.getWidth() / 2, yOffset + 30, { align: 'center', fontSize: 12 });

  // Generar tabla de saldos de proveedores
  const tableData = [];
  this.resultados.forEach(adeudo => {
    const rowData = [
      adeudo.folio,
      `$${parseFloat(adeudo.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      adeudo.fecha_creacion,
      adeudo.nombre
    ];
    tableData.push(rowData);
  });

  // Agregar tabla de saldos de proveedores al PDF
  autoTable(doc, {
    head: [['Folio-Factura', 'Saldo', 'Fecha', 'Nombre']],
    body: tableData,
    startY: yOffset + 50,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' }
  });

  // Generar tabla de sumas totales por nombre
  const totalTableData = [];
  for (const [nombre, total] of Object.entries(this.totalesPorNombre)) {
    totalTableData.push([total.factura.toFixed(2), `$${parseFloat(total.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, nombre]);
  }

  // Agregar tabla de sumas totales por nombre al PDF
  autoTable(doc, {
    head: [['Factura', 'Importe', 'Pipas por pagar']],
    body: totalTableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' }
  });

  // Generar gráfico

  

  // Footer del PDF
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 10);
  }

  // Guardar el PDF
  doc.save('Reporte_Saldos_Proveedores.pdf');
}

    // ...resto de métodos...
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
  width: 700px; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: 0;
  
  
}


td:first-child {
  /* Establece el ancho de la primera columna */
  width: 200px;  /* Ajusta este valor según tus necesidades */
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


