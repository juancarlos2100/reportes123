<template>

  <div>
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Desglose</h1>
    <form @submit.prevent="filtrarDatos">
      <label for="idTurno" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno Inicial:</label>
      <input type="text" v-model="idTurno" style="margin-right:10px;">
      <label for="idTurno" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno Final:</label>
      <input type="text" v-model="idTurno" style="margin-right:10px;">
      <br>

      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

    
    <!-- Tabla Totales Bancos -->
    <h3>Bancos</h3>
    <table class="tabla-totales">
      <thead>
        <tr>
          <th>Bancos</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(saldo, banco) in calcularUltimoSaldoPorBanco()" :key="banco">
          <td><strong>{{ banco }}</strong></td>
          <td><strong>${{ parseFloat(saldo).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
        </tr>
         <!--<tr>
          <td><strong>Total</strong></td>
          <td><strong>${{ calcularTotalSaldoUltimoPorBanco().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
        </tr>-->
      </tbody>
    </table>

    <!-- Tabla Totales Proveedores -->
    <div>
      <h3>Totales Proveedores</h3>
      <table class="tabla-totales">
     <thead>
      <tr>
        <th>Pipas por pagar (PROVEEDOR)</th>
        <th>Folio-Factura</th>
        <th>Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(saldo, proveedor) in calcularTotalesPorNombreProveedores()" :key="proveedor">
        <td>{{ proveedor }}</td>
        <td>{{ obtenerFolios(proveedor) }}</td>
        <td>${{ saldo.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td></td>
        <td><strong>${{ calcularTotalGeneralSaldosProveedores().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
      </tr>
    </tbody>
  </table>

    </div>

    <!-- Tabla Totales Efectivo -->
    <div>
      <h3>Totales Efectivo</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>ID Turno</th>
          <th>monto</th>
          <th>diferencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosFiltradosEfectivo" :key="index">
          <td>{{ adeudo['id_turno'] ? adeudo['id_turno'] : 'NULL' }}</td>
          <td>${{ parseFloat(adeudo['monto_depositado']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        </tr>
        <tr>
        <td><strong>Total</strong></td>
          <td></td> <!-- Agrega una celda vacía para mantener la alineación -->
          <td><strong>${{ calcularTotalDiferencia().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
         </tr>
      </tbody>
    </table>
    </div>

    <!-- Tabla Totales Clientes -->
    <div>
      <h3>Totales Clientes</h3>
      <table class="tabla-totales">
        <thead>
          <tr>
            <th>Clientes por cobrar</th>
            <th>saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(adeudo, index) in resultadosFiltradosClientes" :key="index">
            <td>{{ adeudo['razon_social'] }}</td>
            <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>${{ calcularTotalSaldosClientes().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Segunda Tabla -->
      <h3>Empresas de reembolso</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>nombre</th>
          <th>saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosFiltradosReembolso" :key="index">
          <td>{{ adeudo['nombre'] }}</td>
          <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
         
          
        </tr>
      </tbody>
    </table>
    </div>
     <!--Inventario de Gasolina-->
    <div>
      <h3>Inventario Gasolina</h3>
      <table class="tabla-totales">
      <thead>
        <tr>
          <th>Combustible</th>
          <th>Litros</th>
          <th>Precio</th>
          <th>Importe</th>
        </tr>
        
      </thead>
      <tbody>
        <tr v-for="(adeudo, index) in resultadosGasolina" :key="index">
          <td>{{ adeudo['nombre'] }}</td>
          <td>{{ parseFloat(adeudo['fin_volumen']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          <td>${{ adeudo['precio_compra'] }}</td>
          <td><strong>${{ parseFloat(adeudo['total_compra']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
  <div>
    <!--Inventario de Aceites-->
    <h3>Inventario de Aceites</h3>
    <table class="tabla-totales">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <!-- Utiliza los resultados filtrados para mostrar la información en la tabla -->
      <tr v-for="(aceite, index) in resultadosFiltradosAceites" :key="index">
        <td>{{ aceite['nombre'] }}</td>
        <td>{{ aceite['cantidad'] }}</td>
        <td>${{ parseFloat(aceite['precio']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
        <td>${{ parseFloat(aceite['total']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
      </tr>
      <!-- Añade una nueva fila al final para mostrar la suma total de la columna 'total' -->
      <tr>
        <td><strong>Total</strong></td>
        <td style="color: white;">{{ totales.cantidad.toFixed(2) }}</td>
        <td style="color: white;">${{ totales.precio.toFixed(2) }}</td>
        <td><strong>${{ parseFloat(totales.total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
      </tr>
    </tbody>
  </table>
  </div>

  <div>
    <!--Clientes debito-->
    <h3>Clientes Debito</h3>
    <table class="tabla-totales">
        <thead>
          <tr>
            <th>Razon Social</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(adeudo, index) in resultadosFiltradosClientes.slice(5, 10)" :key="index">
            <td>{{ adeudo['razon_social'] }}</td>
            <td>${{ parseFloat(adeudo['saldo']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>${{ calcularTotalSaldosClientes().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td>
          </tr>
        </tbody>
      </table>

  </div>
</template>

<script>
import axios from "axios";
//import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



export default {
  data() {
    return {
      fechaInicio: '', // Variable para almacenar la fecha de inicio del formulario
      fechaFin: '', // Variable para almacenar la fecha de fin del formulario
      idTurno: null, // Variable para almacenar el idTurno del formulario

      resultadosBancos: [],
      resultadosProveedores: [],
      resultadosEfectivo: [],
      resultadosClientes: [],
      resultadosReembolso: [],
      resultadosGasolina: [],
      resultadosAceites: [],

      resultadosFiltradosBancos: [],
      resultadosFiltradosProveedores: [],
      resultadosFiltradosEfectivo: [],
      resultadosFiltradosClientes: [],
      resultadosFiltradosReembolso: [],
      resultadosFiltradosAceites: [],
      
      
      totales: { cantidad: 0, precio: 0, total: 0 },

    };
  },
  mounted() {
    // Obtener datos de bancos
    axios.get("https://sistemas-oktan.com/admin/get.php/transaccionesbanco")
      .then((response) => {
        this.resultadosBancos = response.data.data;
      })
      .catch((error) => {
        console.error("Error al obtener datos de bancos:", error);
      });

    // Obtener datos de proveedores
    axios.get("https://sistemas-oktan.com/admin/get.php/saldospipas")
      .then((response) => {
        this.resultadosProveedores = response.data.data;
      })
      .catch((error) => {
        console.error("Error al obtener datos de proveedores:", error);
      });

    // Obtener datos de efectivo
    axios.get("https://sistemas-oktan.com/admin/get.php/depositoefectivo")
      .then((response) => {
        this.resultadosEfectivo = response.data.data.map(item => {
          if (item.id_turno === '') {
            item.id_turno = null;
          }
          return item;
        });
      })
      .catch((error) => {
        console.error("Error al obtener datos de efectivo:", error);
      });

    // Obtener datos de clientes
    axios.get("https://sistemas-oktan.com/admin/get.php/clientesxcobrar")
      .then((response) => {
        this.resultadosClientes = response.data.data.map(resu => {
          return {
            ...resu,
            id_turno: resu.id_turno || 'NULL'
          };
        });
      })
      .catch((error) => {
        console.error("Error al obtener datos de clientes:", error);
      });
      axios
          .get("https://sistemas-oktan.com/admin/get.php/empreembolso")
          .then((response) => {
            this.resultadosReembolso = response.data.data; // Asegúrate de tener 'resultadosSegundaTabla' en tu data()
          })
          .catch((error) => {
            console.error("Error al obtener datos de la segunda API:", error);
          });
          // Obtener datos de inventario gasolina
      axios
        .get("https://sistemas-oktan.com/admin/get.php/invgasolina")
        .then((response) => {
          this.resultadosGasolina = response.data.data;
        })
        .catch((error) => {
          console.error("Error al obtener datos de bancos:", error);
        });
      axios
        .get("https://sistemas-oktan.com/admin/get.php/invaceites")
        .then((response) => {
          this.resultadosAceites = response.data.data;
          console.log(this.resultados);
          this.calcularTotales(); 
        })
        .catch((error) => {
          console.error("Error al obtener datos de la API:", error);
        });
  },
  methods: {
      filtrarDatos() {
        // Filtrar resultadosBancos por las fechas seleccionadas en el formulario
        this.resultadosFiltradosBancos = this.resultadosBancos.filter((adeudo) => {
          const fecha = new Date(adeudo.fecha_contable);
          return fecha >= new Date(this.fechaInicio) && fecha <= new Date(this.fechaFin);
        });

        // Filtrar resultadosProveedores por las fechas seleccionadas en el formulario
        this.resultadosFiltradosProveedores = this.resultadosProveedores.filter((adeudo) => {
          const fecha = new Date(adeudo.fecha_creacion);
          return fecha >= new Date(this.fechaInicio) && fecha <= new Date(this.fechaFin);
        });

        // Filtrar resultadosEfectivo por las fechas seleccionadas en el formulario
        this.resultadosFiltradosEfectivo = this.resultadosEfectivo.filter((adeudo) => {
          const fecha = new Date(adeudo.fecha);
          return fecha >= new Date(this.fechaInicio) && fecha <= new Date(this.fechaFin);
        });

        // Filtrar resultadosClientes por las fechas seleccionadas en el formulario
        this.resultadosFiltradosClientes = this.resultadosClientes.filter((adeudo) => {
          const fecha = new Date(adeudo.fecha);
          return fecha >= new Date(this.fechaInicio) && fecha <= new Date(this.fechaFin);
        });

        // Filtrar resultadosReembolso por las fechas seleccionadas en el formulario
        this.resultadosFiltradosReembolso = this.resultadosReembolso.filter((adeudo) => {
          const fecha = new Date(adeudo.fecha_creacion);
          return fecha >= new Date(this.fechaInicio) && fecha <= new Date(this.fechaFin);
        });

       // Filtrar resultadosAceites por idTurno seleccionadas en el formulario
        this.resultadosFiltradosAceites = this.resultadosAceites.filter((aceite) => {
          return aceite.id_turno === this.idTurno;
        });
        this.calcularTotales(); // Recalcular los totales después de filtrar los datos


      },

      calcularUltimoSaldoPorBanco() {
        return this.resultadosFiltradosBancos.reduce((totales, adeudo) => {
          totales[adeudo['banco']] = adeudo['saldo'];
          return totales;
        }, {});
      },

      calcularTotalSaldoUltimoPorBanco() {
        const saldos = this.calcularUltimoSaldoPorBanco();
        return Object.values(saldos).reduce((total, saldo) => total + parseFloat(saldo), 0);
      },

      calcularTotalesPorNombreProveedores() {
        const totalesPorNombre = {};
        this.resultadosFiltradosProveedores.forEach((adeudo) => {
          const nombreProveedor = adeudo['nombre'];
          const saldo = parseFloat(adeudo['saldo']);
          totalesPorNombre[nombreProveedor] = (totalesPorNombre[nombreProveedor] || 0) + saldo;
        });
        return totalesPorNombre;
      },

      calcularTotalGeneralSaldosProveedores() {
        let totalGeneral = 0;
        this.resultadosFiltradosProveedores.forEach((adeudo) => {
          totalGeneral += parseFloat(adeudo['saldo']);
        });
        return totalGeneral;
      },

      obtenerFolios(proveedor) {
        const folios = this.resultadosFiltradosProveedores
          .filter(adeudo => adeudo['nombre'] === proveedor)
          .map(adeudo => adeudo['folio'])
          .join(', '); // Si deseas los folios separados por comas
        return folios;
      },
      calcularTotalSaldosClientes() {
        return this.resultadosFiltradosClientes.reduce((total, cliente) => {
          return total + parseFloat(cliente['saldo']);
        }, 0);
      },
      calcularTotalDiferencia() {
        return this.resultadosFiltradosEfectivo.reduce((total, adeudo) => {
        return total + parseFloat(adeudo['diferencia']);
        }, 0);
      },
      calcularTotales() {
        this.totales = { cantidad: 0, precio: 0, total: 0 };

        // Calcula los totales 
        this.resultadosFiltradosAceites.forEach((aceite) => {
          this.totales.cantidad += parseFloat(aceite.cantidad);
          this.totales.precio += parseFloat(aceite.precio);
          this.totales.total += parseFloat(aceite.total);
        });
      },

      exportExcel() {
        this.$nextTick(async () => {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Sheet1');
          const tables = this.$el.querySelectorAll('table');

          let rowIndex = 1;

          const headers = this.$el.querySelectorAll('h1');
          headers.forEach(header => {
            const titleCell = worksheet.getCell(rowIndex, 1);
            titleCell.value = header.textContent.trim();
            titleCell.font = { bold: true, size: 14 }; // Hacer el título negrita y un poco más grande
            rowIndex++;
          });

          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];

            // Convertir la tabla HTML a un array de arrays
            const data = Array.from(table.querySelectorAll('tr')).map(tr =>
              Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText)
            );

            // Agregar los datos a la hoja de Excel
            data.forEach((row, localRowIndex) => {
              row.forEach((value, colIndex) => {
                const cell = worksheet.getCell(rowIndex + localRowIndex, colIndex + 1);
                cell.value = value;

                // Aplicar negrita a los encabezados de cada columna
                if (localRowIndex === 0) {
                  cell.font = { bold: true };
                }

                // Ajustar el ancho de las columnas específicas
                if (colIndex === 0) {
                  worksheet.getColumn(colIndex + 1).width = 50; // Primera columna
                } else if (colIndex === 1 || colIndex === 2 || colIndex === 3) {
                  worksheet.getColumn(colIndex + 1).width = 20; // todas las demas columnas
                }
              });
            });

            rowIndex += data.length + 1; // Dejar una fila vacía entre las tablas
          }

          // Guardar el libro de trabajo como un archivo .xlsx
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'informe_financieroOKTAN.xlsx';
          a.click();
        });
      },
      downloadPDF() {
        const pdfOptions = {
          orientation: "portrait",
          unit: "mm",
          format: "letter",
        };

        const doc = new jsPDF(pdfOptions);

        html2canvas(this.$el, { scale: 3 })
          .then(canvas => {
            let imgData = canvas.toDataURL('image/jpeg', 0.1);

            let imgWidth = 200;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;

            let marginLeft = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
            let marginTop = 10;

            doc.addImage(imgData, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);

            doc.save('informe_financiero.pdf');
          })
          .catch(error => {
            console.error('Error al capturar la representación gráfica de la tabla:', error);
          });
      },
      
    // ... (otros métodos existentes) ...
  }
 

  
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
  width: 40%; /* Cambia esto al ancho que desees */
  height: auto; /* Cambia esto a la altura que desees */
  margin-left: auto;
  margin-right: auto;
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
td:first-child {
  /* Establece el ancho de la primera columna */
  width: 300px;  /* Ajusta este valor según tus necesidades */
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