<template>

  <div>
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
    </header>
    <h1>Gastos</h1>
    <form @submit.prevent="filtrarDatos">
   
      <br>

      <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
      <input type="date" v-model="fechaInicio" style="margin-right:10px;">
      
      <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
      <input type="date" v-model="fechaFin" style="margin-right:10px;">

      <button class="boton-filtrar" type="submit">Filtrar</button>
    </form>
    <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
    <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

    
    <!-- Tabla Totales nomina -->
    <h3>Nomina</h3>
<table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Semana 27 DEL 03 AL 09 DE JULIO 2023</td>
      <td>$25,881.57</td>
    </tr>
    <tr>
      <td>Semana 28 DEL 10 AL 16 DE JULIO 2023</td>
      <td>$23,983.78</td>
    </tr>
    <tr>
      <td>Semana 29 DEL 17 AL 23 DE JULIO 2023</td>
      <td>$19,468.82</td>
    </tr>
    <tr>
      <td>Semana 24 DEL 30 AL 16 DE JULIO 2023</td>
      <td>$22,346.10</td>
    </tr>
    <tr>
      <td>Nomina Supervisor Francisco Javier Guevara Castro</td>
      <td>$6,616.55</td>
    </tr>
    <tr>
      <td>Finiquito Ana Laura Velazquez Cadeza</td>
      <td>$3,380.71</td>
    </tr>
    <tr>
      <td>Finiquito Maria Josefina Yanet Flores Ramirez</td>
      <td>$926.93</td>
    </tr>
    <tr>
      <td>Finiquito Arely Marin Cancio</td>
      <td>$3,735.72</td>
    </tr>
    <tr>
      <td>Finiquito Ivanka Del Carmen Martinez Ortega</td>
      <td>$3,735.72</td>
    </tr>
    <tr>
      <td>Finiquito Marcos Axel Bravo Angulo</td>
      <td>$2,186.48</td>
    </tr>
    <tr>
      <td>Finiquito Teresa De Jesús López Briseño</td>
      <td>$3,376.80</td>
    </tr>
    <tr>
      <td><strong>Total Nomina</strong></td>
      <td><strong>$115,639.18</strong></td>
    </tr>
  </tbody>
</table>


    <!-- Tabla Totales Proveedores -->
    <div>
      <h3>Consumos Internos</h3>
      <table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Javier Guevara - Supervisor</td>
      <td>$4,384.20</td>
    </tr>
    <tr>
      <td>Evangelina Garcia Cayetano - Gerente</td>
      <td>$900.97</td>
    </tr>
    <tr>
      <td>Cortesia Cliente (1 L) - Autorizó Javier Guevara</td>
      <td>$20.78</td>
    </tr>
    <tr>
      <td><strong>Total Consumos Internos</strong></td>
      <td><strong>$5,305.95</strong></td>
    </tr>
  </tbody>
</table>

    </div>

    <!-- Tabla Totales Efectivo -->
    <div>
      <h3>Cortesias</h3>
<table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CORTESIA CLIENTE GRAFENO - AUTORIZÓ JAVIER GUEVARA</td>
      <td>$2,647.52</td>
    </tr>
    <tr>
      <td><strong>Total Cortesias</strong></td>
      <td><strong>$2647.52</strong></td> <!-- Agrega una celda vacía para mantener la alineación -->
    </tr>
  </tbody>
</table>
    </div>

    <!-- Tabla Totales Clientes -->
    <div>
      <h3>Mantenimiento</h3>
<table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MALLA P/ALCANTARILLAS, CUTER, TIJERAS P/PODAR, SILICON</td>
      <td>$429.00</td>
    </tr>
    <tr>
      <td>AFLOJATODO Y CLAVOS</td>
      <td>$52.70</td>
    </tr>
    <tr>
      <td>MANTENIMIENTO CLIMAS</td>
      <td>$2,400.00</td>
    </tr>
    <tr>
      <td><strong>Total Mantenimiento</strong></td>
      <td><strong>$2,829.00</strong></td>
    </tr>
  </tbody>
</table>

      <!-- Segunda Tabla -->
      <h3>Gastos Fijos</h3>
<table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GARRAFONES DE AGUA</td>
      <td>$460.00</td>
    </tr>
    <tr>
      <td>PROPINA POLICIA</td>
      <td>$1,000.00</td>
    </tr>
    <tr>
      <td>RELLENO GARRAFON DE AGUA</td>
      <td>$38.00</td>
    </tr>
    <tr>
      <td>PEDRO CRUZ - JULIO</td>
      <td>$1,500.00</td>
    </tr>
    <tr>
      <td>MEGACABLE - TELEFONIA E INTERNET - JULIO</td>
      <td>$550.00</td>
    </tr>
    <tr>
      <td><strong>Total Gastos Fijos</strong></td>
      <td><strong>$3,088.00</strong></td>
    </tr>
  </tbody>
</table>
    </div>
     <!--Inventario de Gasolina-->
    <div>
      <h3>Banco-Santander</h3>
<table class="table">
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cancelacion TPV</td>
      <td>$2,540.10</td>
    </tr>
    <tr>
      <td>Candy Muñoz Serrano - Renta (Julio)</td>
      <td>$39,999.99</td>
    </tr>
    <tr>
      <td>CFE - Energia Electrica (Jun-Jul)</td>
      <td>$11,354.00</td>
    </tr>
    <tr>
      <td>Comision Bancaria</td>
      <td>$11,648.69</td>
    </tr>
    <tr>
      <td>Falcon SIAP - Anexo 30 y 31</td>
      <td>$8,854.66</td>
    </tr>
    <tr>
      <td>Faltante de Deposito Panamericano</td>
      <td>$200.00</td>
    </tr>
    <tr>
      <td>Impuestos - 3% Nomina</td>
      <td>$6,244.00</td>
    </tr>
    <tr>
      <td>Impuestos - IMSS</td>
      <td>$77,098.51</td>
    </tr>
    <tr>
      <td>Impuestos Federales - Junio</td>
      <td>$26,818.00</td>
    </tr>
    <tr>
      <td>IVA Comision Bancaria</td>
      <td>$1,863.82</td>
    </tr>
    <tr>
      <td>Jesús Rivera Del Carmen - Empaque para Registro de Motobomba</td>
      <td>$2,140.20</td>
    </tr>
    <tr>
      <td>Luis Alejandro Juarez Tapia - Asesoria Legal (Julio)</td>
      <td>$2,730.01</td>
    </tr>
    <tr>
      <td>Mexicana de Lubricantes - Aceites</td>
      <td>$6,570.84</td>
    </tr>
    <tr>
      <td>Nomina Francisco Javier Guevara Castro</td>
      <td>$4,816.80</td>
    </tr>
    <tr>
      <td>Oktan Design - Consultoria 1a Qna Julio</td>
      <td>$10,500.00</td>
    </tr>
    <tr>
      <td>Oktan Design - Consultoria 2a Qna Julio</td>
      <td>$10,500.00</td>
    </tr>
    <tr>
      <td>Oroapa - Servicio de Agua Potable (Julio)</td>
      <td>$787.72</td>
    </tr>
    <tr>
      <td>OSE - Pago PIPA</td>
      <td>$5,162,792.83</td>
    </tr>
    <tr>
      <td>Pineda Morales y Asociados - Contabilidad Julio</td>
      <td>$6,380.00</td>
    </tr>
    <tr>
      <td>Renta Sodexo</td>
      <td>$75.40</td>
    </tr>
    <tr>
      <td>Telmex - Telefonía e Internet (Julio)</td>
      <td>$1,023.00</td>
    </tr>
    <tr>
      <td>Tobilet (Papelería)</td>
      <td>$131,205.04</td>
    </tr>
    <tr>
      <td><strong>Total Santander</strong></td>
      <td><strong>$5,169,563.67</strong></td>
    </tr>
  </tbody>
</table>
    </div>
  </div>
  <div>
    <!--Inventario de Aceites-->
    <h2>Resumen Relación de Gastos</h2>
<table class="table-resumen">
  <thead>
    <tr>
      <th>Tipo de Gasto</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>TOTAL NOMINA</td>
      <td>$115,639.18</td>
    </tr>
    <tr>
      <td>TOTAL CONSUMOS INTERNOS</td>
      <td>$5,305.95</td>
    </tr>
    <tr>
      <td>TOTAL CORTESIAS</td>
      <td>$2,647.52</td>
    </tr>
    <tr>
      <td>TOTAL EXTRAORDINARIOS</td>
      <td>$-</td>
    </tr>
    <tr>
      <td>TOTAL MANTENIMIENTO</td>
      <td>$2,829.00</td>
    </tr>
    <tr>
      <td>TOTAL PAPELERIA</td>
      <td>$448.26</td>
    </tr>
    <tr>
      <td>TOTAL GASTOS FIJOS</td>
      <td>$460.00</td>
    </tr>
    <tr>
      <td>TOTAL ARTICULOS DE LIMPIEZA</td>
      <td>$1,080.01</td>
    </tr>
    <tr>
      <td>TOTAL OTROS GASTOS</td>
      <td>$-</td>
    </tr>
    <tr>
      <td>TOTAL ATENCION AL CLIENTE</td>
      <td>$1,851.75</td>
    </tr>
    <tr>
      <td>TOTAL VIATICOS</td>
      <td>$-</td>
    </tr>
    <tr>
      <td>SUMA NOMINA, CONSUMOS Y CAJA CHICA</td>
      <td>$130,261.67</td>
    </tr>
    <tr>
      <td>COMISIONES TARJETAS DE REEMBOLSO</td>
      <td>$3,521.96</td>
    </tr>
    <tr>
      <td>TOTAL BANCOS</td>
      <td>$356,579.94</td>
    </tr>
    <tr>
      <td><strong>GASTOS ESTACION DE SERVICIO:</strong></td>
      <td><strong>$490,363.57</strong></td>
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
          })

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
      calcularTotalSaldosReembolso() {
        return this.resultadosFiltradosReembolso.reduce((total, adeudo) => {
        return total + parseFloat(adeudo['saldo']);
        }, 0);
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
  width: 90%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  
}
.table-resumen{
  width: 70%;
  border-collapse: collapse;
  margin-top: 20px; /* Ajusta según sea necesario */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: auto;
  padding-bottom: 20px;

}
.tabla-totales {
  width: 50%; /* Cambia esto al ancho que desees */
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
  width: 1000px;  /* Ajusta este valor según tus necesidades */
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