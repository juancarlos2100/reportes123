<template>
  <div class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Logotipo de oktan">
    </header>
    <h1>Reporte Operativo</h1>
    <h2>Transacciones Bancos</h2>
    <div> 
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" @change="cargarBancos" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>
        <label for="banco" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Banco:</label>
        <select id="banco" v-model="bancoSeleccionado" style="width: 400px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;">
          <option value="">Todos</option>
          <option v-for="(nombre, id) in bancos" :key="id" :value="id">{{ nombre }}</option>
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
              <th>Descripcion</th>
              <th>id tipo</th>
              <th>Fecha Contable</th>
              <th>Monto</th>
              <th>Saldo</th>
              
            </tr>
          </thead>
          <tbody v-if="mostrarResultados">
            <tr v-for="(adeudo, index) in resultados" :key="index">
              <td>{{ adeudo['banco'] }}</td>
              <td>{{ adeudo['descripcion'].length > 45 ? adeudo['descripcion'].slice(0, 45) + '...' : adeudo['descripcion'] }}</td>
              <td><strong>{{ adeudo['id_tipo'] === '1' ? 'Cargo' : (adeudo['id_tipo'] === '2' ? 'Abono' : 'otro') }}</strong></td>
              <td>{{ adeudo['fecha_contable'] }}</td>
              <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
              <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
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
    <div class="cont-total">
      <h1>Ultima Transaccion del Periodo</h1>
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
            <td><strong>${{ Number(saldo.ultimoSaldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
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
            <th>Diferencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(totales, banco) in totalesPorBanco" :key="banco">
            <td>{{ banco }}</td>
            <td>${{ totales.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>${{ totales.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
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
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      resultados: [],
      selectedEstacion: null,
      mostrarResultados: false,
      resultadosOriginales: [],
      fechaInicio: null,
      fechaFin: null,
      totalesPorBanco: {},
      myChart: null,
      dbm: null,
      totalesPorBanco2: {},
      bancoSeleccionado: null, 
      estaciones: {},
      bancos: {}, 
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
    async cargarBancos() {
      if (this.dbm) {
        const url = `http://gasserver.dyndns.org:8081/admin/get.php/listabanco?dbm=${this.dbm}`;
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
        const url = `http://gasserver.dyndns.org:8081/admin/get.php/transaccionesbanco`;
        const fechaFinConHora = `${this.fechaFin}T12:00:00`;

        const params = {
          fechaInicio: this.fechaInicio,
          fechaFin: fechaFinConHora,
          dbm: parseInt(this.dbm)
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
      if (this.bancoSeleccionado) {
        this.resultados = this.resultadosOriginales.filter(adeudo => adeudo.id_cuenta === this.bancoSeleccionado);
      } else {
        this.resultados = [...this.resultadosOriginales];
      }
    },
      calcularTotalesPorBanco() {
      const totalesPorBanco = {};
      this.resultados.forEach(adeudo => {
        const banco = adeudo.banco;
        const tipo = adeudo.id_tipo;
        const monto = parseFloat(adeudo.monto);
        if (!totalesPorBanco[banco]) {
          totalesPorBanco[banco] = {
            cargos: 0,
            abonos: 0,
            saldo: 0,
            saldoFinal: 0  
          };
        }
        if (tipo === '1') {
          totalesPorBanco[banco].abonos += monto;
        } else if (tipo === '2') {
          totalesPorBanco[banco].cargos += monto;
        }
        totalesPorBanco[banco].saldo += parseFloat(adeudo.saldo);
        totalesPorBanco[banco].saldoFinal = Math.abs(totalesPorBanco[banco].abonos - totalesPorBanco[banco].cargos);
        // Agregar la lógica de calcularUltimoSaldoPorBanco aquí
        if (adeudo.banco && adeudo.saldo) {
          totalesPorBanco[adeudo.banco].ultimoSaldo = adeudo.saldo;
        }
      });
      this.totalesPorBanco = totalesPorBanco;
      this.updateChart();
    },
    //fucncion para actualizar el grafico con cargos, abonos y diferencia
    updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (this.myChart) {
      this.myChart.destroy();
  }

  // Colores base para las barras
  const baseColors = [
    'rgba(54, 162, 235, 0.3)',
    'rgba(255, 99, 132, 0.3)',
    'rgba(75, 192, 192, 0.3)'
  ];

  // Colores intensos al pasar el cursor
  const hoverColors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(75, 192, 192, 0.6)'
  ];

  this.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: '.',//Object.keys(this.totalesPorBanco),
      datasets: [
        {
          label: 'Abonos',
          data: Object.values(this.totalesPorBanco).map(totales => totales.cargos),
          backgroundColor: baseColors[0],
          hoverBackgroundColor: hoverColors[0],
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Cargos',
          data: Object.values(this.totalesPorBanco).map(totales => totales.abonos),
          backgroundColor: baseColors[1],
          hoverBackgroundColor: hoverColors[1],
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Diferencia',
          data: Object.values(this.totalesPorBanco).map(totales => totales.saldoFinal),
          backgroundColor: baseColors[2],
          hoverBackgroundColor: hoverColors[2],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
},
async downloadPDF() {
  let doc = new jsPDF();

  // Título del reporte con periodo de fechas y banco seleccionado
  const titulo = `Transacciones bancarias: Reporte Operativo\n(${this.fechaInicio} al ${this.fechaFin})`;
  // Remove the unused variable declaration
  // const titulo2 = `Del (${this.fechaInicio} al ${this.fechaFin})`;
  doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center', fontStyle: 'bold' });

  // Encabezado de la tabla de transacciones registradas
  const encabezado = "Transacciones Registradas";
  doc.text(encabezado, 10, 30, { fontSize: 16 });

  // Generar tabla de transacciones registradas
  const transaccionesTableData = [];
  this.resultados.forEach(adeudo => {
    const rowData = [
      adeudo.banco,
      adeudo.descripcion.length > 45 ? adeudo.descripcion.slice(0, 45) + '...' : adeudo.descripcion,
      adeudo.id_tipo === '1' ? 'Cargo' : (adeudo.id_tipo === '2' ? 'Abono' : 'otro'),
      adeudo.fecha_contable,
      `$${parseFloat(adeudo.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${parseFloat(adeudo.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
    transaccionesTableData.push(rowData);
  });

  // Agregar tabla de transacciones registradas al PDF
  autoTable(doc, {
    head: [['Banco', 'Descripción', 'ID Tipo', 'Fecha Contable', 'Monto', 'Saldo']],
    body: transaccionesTableData,
    startY: 40,
    headStyles: { fillColor: '#D3D3D3', textColor: '#000000' }
  });

  // Generar tabla de ultima transacción del periodo
  const ultimaTransaccionTableData = [];
  for (const [banco, saldo] of Object.entries(this.totalesPorBanco)) {
    ultimaTransaccionTableData.push([banco, `$${Number(saldo.ultimoSaldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }

  // Agregar tabla de ultima transacción del periodo al PDF
  autoTable(doc, {
    head: [['Banco', 'Saldo Final']],
    body: ultimaTransaccionTableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' }
  });

  // Generar tabla de total de cargos y abonos por banco
  const totalesTableData = [];
  for (const [banco, totales] of Object.entries(this.totalesPorBanco)) {
    totalesTableData.push([banco, `$${totales.cargos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${totales.abonos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `$${totales.saldoFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }

  // Agregar tabla de total de cargos y abonos por banco al PDF
  autoTable(doc, {
    head: [['Banco', 'Cargos', 'Abonos', 'Diferencia']],
    body: totalesTableData,
    startY: doc.lastAutoTable.finalY + 10,
    headStyles: { fillColor: '#A2DA6A', textColor: '#000000' }
  });

  // Footer del PDF
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Página ' + i + ' de ' + totalPages, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 10);
  }

  // Guardar el PDF
  doc.save('Reporte_Transacciones_Bancarias.pdf');
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