<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <header>
      <img class="imagen-encabezado" src="@/assets/logok.png" alt="Logotipo de oktan">
    </header>
    <h1>Reporte de Gastos</h1>
    <h2></h2>
    <div>
      <form @submit.prevent="filtrarDatos">
        <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" @change="cargarBancos" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 300px; height: 40px; margin-right: 10px; font-size: 20px; font-family: Arial, sans-serif;">
          <option value="" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <label for="fechaInicio" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px; height: 40px; margin-right: 10px; font-size: 20px; font-family: Arial, sans-serif;">

        <label for="fechaFin" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" @change="setFechaFin" maxlength="10" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px; width: 150px; height: 40px; margin-right: 10px; font-size: 20px; font-family: Arial, sans-serif;">

        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>

      <button class="boton-descargar" @click="downloadPDF" >Descargar PDF</button>
      <button class="boton-descargar" @click="downloadExcel">Descargar XLS</button>
    </div>

    <div class="container" style="display: flex; height: 100%;">
      <!-- Lado izquierdo -->
      <div class="left-container" style="flex: 0 0 70%; overflow: auto;">
        <h2 style="text-align: center;"> Estación: {{ estaciones[dbm] }}</h2>
        <h2 style="text-align: center;">{{ mesYAnio.toUpperCase() }}</h2>
        <div v-for="(transacciones, banco) in agruparPorBanco" :key="banco">
          <h1>{{ banco }}</h1>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
              <tr>
                <th></th>
                <!--<th>id</th>-->
                <th>Descripcion</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody v-if="transacciones.length > 0">
              <tr v-for="(adeudo, index) in transacciones" :key="index">
                <td><input type="checkbox" v-model="adeudo.incluir" /></td> <!-- Checkbox vinculado a la propiedad 'incluir' -->
                <!--<<td>{{ adeudo['id_cuenta'] }}</td>-->
                <td>{{ adeudo['descripcion'].length > 150 ? adeudo['descripcion'].slice(0, 150) + '...' : adeudo['descripcion'] }}</td>
                <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              </tr>
              <tr>
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>{{ parseFloat(calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="2">No se encontraron registros que coincidan con su búsqueda</td>
              </tr>
            </tbody>
          </table>
          <br>
        </div>

        <div>
      <h1>Nuevas Transacciones</h1>
      <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
        <thead>
          <tr>
            <th>Descripcion</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaccion, index) in nuevasTransacciones" :key="index">
            <td>
              <input 
                type="text" 
                v-model="transaccion.descripcion" 
                maxlength="60" 
                class="form-select" 
                :class="{ 'dark-mode-select': isDarkMode }" 
                style="width: 500px; height: 30px; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold;"
              />
            </td>
            <td>
              <input 
                type="number" 
                v-model="transaccion.monto" 
                class="form-select" 
                :class="{ 'dark-mode-select': isDarkMode }" 
                style="width: 150px; height: 30px; font-size: 20px; font-family: Arial, sans-serif;"
              />
            </td>
            <td>
              <button @click="eliminarTransaccion(index)" class="boton-descargar1">Eliminar</button>

            </td>
          </tr>
          <tr>
            <td colspan="2"><strong>Total</strong></td>
            <td><strong>${{ calcularTotalNuevasTransacciones() }}</strong></td>
          </tr>
        </tbody>
      </table>
      <button @click="agregarNuevaTransaccion" class="boton-descargar1">Agregar</button>
    </div>


        <div>
          <h1>Detalles de Gastos</h1>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Nombre</th>
                <th>Importe</th>
      
              </tr>
            </thead>
            <tbody>
              <tr v-for="(gasto, index) in resultados2" :key="index">
                
                <td>
                  <select v-model="gasto.categoria" class="form-select" :class="{ 'dark-mode-select': isDarkMode }">
                    <option value="COMISIONES">Comisiones</option>
                    <option value="ATENCIÓN AL CLIENTE">Atención al Cliente</option>
                    <option value="ARTÍCULOS DE LIMPIEZA">Artículos de Limpieza</option>
                    <option value="GASTOS FIJOS">Gastos Fijos</option>
                    <option value="PAPELERÍA">Papelería</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="CORTESÍAS">Cortesías</option>
                    <option value="CONSUMOS INTERNOS">Consumos Internos</option>
                    <option value="NÓMINA">Nómina</option>
                  </select>
                </td>
                <td>{{ gasto.id_nombre }}</td>
                <td>${{ parseFloat(gasto.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
      
              </tr>

            </tbody>
          </table>
        </div>

      <div v-for="(gastos, categoria) in categorias" :key="categoria">
        <h1>{{ categoria }}</h1>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
          <thead>
            <tr>
              <th>.</th>
              <th>Nombre</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(gasto, index) in gastos" :key="index">
              <td>
                <button class="boton-descargar1" @click="devolverACategorias(gasto)">Devolver</button>
              </td>

              <td>{{ gasto.id_nombre }}</td>
              <td>${{ parseFloat(gasto.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Total</strong></td>
              <td><strong>${{ calcularTotalMonto2(gastos) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>


      <div>
            <h1>{{ "RESUMEN DE RELACIÓN DE GASTOS  " + mesYAnio.toUpperCase() }}</h1>

          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(total, categoria) in calcularTotalesPorCategoria().totalesPorCategoria" :key="categoria">
                <td>{{ categoria }}</td>
                <td>${{ total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              </tr>
              <tr>
                <td><strong>Total Global</strong></td>
                <td><strong>${{ calcularTotalesPorCategoria().sumaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 style="text-align: center;">Totales por Banco</h2>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
              <tr>
                <th>Banco</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transacciones, banco) in agruparPorBanco" :key="banco">
                <td>{{ banco }}</td>
                <td>{{ parseFloat(calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${{ calcularGranTotalMonto() }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
     
        <div class="cont-total">
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
              <tr>
                <th>GASTOS ESTACIÓN DE SERVICIO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${{ totalGeneral() }}</td>
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
import { mapState } from 'vuex'; // Si usas Vuex para el manejo de estado
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';


export default {
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      dbm: '',
      estaciones: {},
      resultados: [],
      resultados2: [],
      isDarkMode: true,
      categorias: {},
      mesYAnio: '',
      mostrarResultados: false,
      nuevasTransacciones: [{ descripcion: '', monto: 0 }] // Nueva tabla para agregar transacciones
      
    };
  },
  computed: {

    ...mapState(['user']),
    agruparPorBanco() {
      return this.resultados.reduce((acc, transaccion) => {
        const banco = transaccion.banco;
        if (!acc[banco]) {
          acc[banco] = [];
        }
        acc[banco].push(transaccion);
        return acc;
      }, {});
    },
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

    validarCampos() {
        if (!this.fechaInicio || !this.fechaFin || !this.dbm ) {
          console.error("Por favor, selecciona una estación y proporciona las fechas y horas de inicio y fin.");
          return false;
        }
        return true;
      },
  


      async filtrarDatos() {
        if (!this.validarCampos()) {
          return;
        }

        const url1 = `http://gasserver.dyndns.org:8081/admin/get.php/transaccionesbancocargos`;
        const url2 = `http://gasserver.dyndns.org:8081/admin/get.php/turnosgastos`;

        const turnoInicio = this.generarTurno(this.fechaInicio, 1);
        const turnoFin = this.generarTurno(this.fechaFin, 5);

        const params1 = {
          fechaInicio: `${this.fechaInicio}T00:00:00`,
          fechaFin: `${this.fechaFin}T23:59:59`,
          dbm: parseInt(this.dbm)
        };

        const params2 = {
          turnoInicio: turnoInicio,
          turnoFin: turnoFin,
          dbm: parseInt(this.dbm)
        };

        try {
          const response1 = await axios.get(url1, { params: params1 });
          this.resultados = response1.data.data.map(transaccion => ({
            ...transaccion,
            incluir: true,
            categoria: null
          }));

          const response2 = await axios.get(url2, { params: params2 });
          this.resultados2 = response2.data.data.map(gasto => ({
            ...gasto,
            incluir: true,
            categoria: null
          }));

          this.mesYAnio = this.convertirFechaAMesYAnio(this.fechaFin);
          this.mostrarResultados = true;
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        }
      },


    generarTurno(fecha, turnoNumero) {
      const [anio, mes, dia] = fecha.split('-');
      return `${anio}${mes}${dia}${turnoNumero.toString().padStart(2, '0')}`;
    },

    convertirFechaAMesYAnio(fecha) {
      const options = { year: 'numeric', month: 'long' };
      return new Date(fecha).toLocaleDateString('es-ES', options);
    },

    calcularTotalNuevasTransacciones() {
    return this.nuevasTransacciones.reduce((total, transaccion) => {
      const monto = parseFloat(transaccion.monto);
      return total + (isNaN(monto) ? 0 : monto);
    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },




    calcularTotalMonto(transacciones) {
      return transacciones.reduce((total, transaccion) => {
        if (transaccion.incluir) {
          const monto = parseFloat(transaccion.monto);
          return total + (isNaN(monto) ? 0 : monto);
        }
        return total;
      }, 0);
    },

    calcularTotalMonto2(transacciones) {
      return transacciones.reduce((total, transaccion) => {
        const monto = parseFloat(transaccion.importe);
        return total + (isNaN(monto) ? 0 : monto);
      }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    calcularTotalSaldo(transacciones) {
      return transacciones.reduce((total, transaccion) => {
        if (transaccion.incluir) {
          const saldo = parseFloat(transaccion.saldo);
          return total + (isNaN(saldo) ? 0 : saldo);
        }
        return total;
      }, 0);
    },

    calcularGranTotalMonto() {
      const total = Object.values(this.agruparPorBanco).reduce((total, transacciones) => {
        return total + this.calcularTotalMonto(transacciones);
      }, 0);
      return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    calcularGranTotalSaldo() {
      const total = Object.values(this.agruparPorBanco).reduce((total, transacciones) => {
        return total + this.calcularTotalSaldo(transacciones);
      }, 0);
      return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    calcularTotalImporte() {
      const total = this.resultados2.reduce((total, gasto) => {
        if (gasto.incluir) {
          const importe = parseFloat(gasto.importe);
          return total + (isNaN(importe) ? 0 : importe);
        }
        return total;
      }, 0);
      return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    moverACategoria(gasto) {
      if (gasto.categoria) {
        if (!this.categorias[gasto.categoria]) {
          this.categorias[gasto.categoria] = [];
        }
        this.categorias[gasto.categoria].push({
          id_nombre: gasto.id_nombre,
          importe: gasto.importe
        });
        const index = this.resultados2.indexOf(gasto);
        if (index !== -1) {
          this.resultados2.splice(index, 1);
        }
      }
    },

    agregarNuevaTransaccion() {
        this.nuevasTransacciones.push({ descripcion: '', monto: 0 });
      },

      eliminarTransaccion(index) {
        this.nuevasTransacciones.splice(index, 1);
      },


    calcularTotalesPorCategoria() {
      const totalesPorCategoria = {};
      for (const categoria in this.categorias) {
        const gastos = this.categorias[categoria];
        const totalCategoria = gastos.reduce((total, gasto) => total + parseFloat(gasto.importe), 0);
        totalesPorCategoria[categoria] = totalCategoria;
      }
      const sumaTotal = Object.values(totalesPorCategoria).reduce((total, cantidad) => total + cantidad, 0);
      return {
        totalesPorCategoria,
        sumaTotal
      };
    },
    //funcion totalgeneral para sumar el total de por categoria y el total de la tablita  de totales por banco
    totalGeneral() {
    const totalMonto = Object.values(this.agruparPorBanco).reduce((total, transacciones) => {
      return total + this.calcularTotalMonto(transacciones);
    }, 0);

    const { sumaTotal } = this.calcularTotalesPorCategoria();
    const totalNuevasTransacciones = this.nuevasTransacciones.reduce((total, transaccion) => {
      const monto = parseFloat(transaccion.monto);
      return total + (isNaN(monto) ? 0 : monto);
    }, 0);

    const total = totalMonto + sumaTotal + totalNuevasTransacciones;

    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  

    devolverACategorias(gasto) {
      // Itera sobre todas las categorías para encontrar y eliminar el gasto
      for (const categoria in this.categorias) {
        const index = this.categorias[categoria].indexOf(gasto);
        if (index !== -1) {
          // Si el gasto se encuentra en la categoría, le damos en la mother
          this.categorias[categoria].splice(index, 1);
          // retacha el gasto  a resultados2
          this.resultados2.push(gasto);
          return; // Salir del bucle una vez que se haya encontrado y movido el gasto
        }
      }

    console.error(`El gasto no se encontró en ninguna categoría.`);
  },

  downloadPDF() {
      const doc = new jsPDF();

      // Título del reporte con estación y mes/año
      const titulo = `Gastos de la Estación: ${this.estaciones[this.dbm]} \n ${this.mesYAnio.toUpperCase()}`;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(16);
      doc.text(titulo, pageWidth / 2, 10, { align: 'center' });

      let startY = 30; // Y position to start the first section

      const addTableWithMargins = (head, body, startY) => {
        doc.autoTable({
          head: [head],
          body: body,
          startY: startY,
          theme: 'grid',
          styles: {
            halign: 'left',
            fontSize: 8,
            cellPadding: 1,
          },
          headStyles: { fillColor: '#D3D3D3', textColor: '#000000' },
          margin: { bottom: 10 } // Add bottom margin to separate tables
        });
        return doc.lastAutoTable.finalY + 10;
      };

      // Sección: Transacciones por banco
      Object.entries(this.agruparPorBanco).forEach(([banco, transacciones]) => {
        // Filtrar transacciones con checkbox activo
        const transaccionesFiltradas = transacciones.filter(adeudo => adeudo.incluir);

        if (transaccionesFiltradas.length > 0) {
          doc.setFontSize(12);
          doc.text(banco, 10, startY);

          const tableData = transaccionesFiltradas.map(adeudo => [
            adeudo.descripcion.length > 150 ? adeudo.descripcion.slice(0, 150) + '...' : adeudo.descripcion,
            `$${parseFloat(adeudo.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);

          startY = addTableWithMargins(['Descripción', 'Monto'], tableData, startY + 5);
        }
      });

      // Sección: Nuevas Transacciones
      doc.setFontSize(12);
      doc.text('Nuevas Transacciones', 5, startY);

      const nuevasTransaccionesData = this.nuevasTransacciones.map(transaccion => [
        transaccion.descripcion.length > 60 ? transaccion.descripcion.slice(0, 60) + '...' : transaccion.descripcion,
        `$${parseFloat(transaccion.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

      startY = addTableWithMargins(['Descripción', 'Monto'], nuevasTransaccionesData, startY + 5);


      // Sección: Gastos por Categoría
      Object.entries(this.categorias).forEach(([categoria, gastos]) => {
        doc.setFontSize(12);
        doc.text(categoria, 10, startY);

        const gastosCategoriaData = gastos.map(gasto => [
          gasto.id_nombre,
          `$${parseFloat(gasto.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);

        startY = addTableWithMargins(['Nombre', 'Importe'], gastosCategoriaData, startY + 15);
      });

      // Sección: Resumen de Relación de Gastos
      doc.setFontSize(12);
      doc.text(`RESUMEN DE RELACIÓN DE GASTOS ${this.mesYAnio.toUpperCase()}`, 10, startY);

      const resumenGastosData = Object.entries(this.calcularTotalesPorCategoria().totalesPorCategoria).map(([categoria, total]) => [
        categoria,
        `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

      resumenGastosData.push(['Total Global', `$${this.calcularTotalesPorCategoria().sumaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);

      startY = addTableWithMargins(['Categoría', 'Total'], resumenGastosData, startY + 10);

      // Sección: Totales por Banco
      doc.setFontSize(12);
      doc.text('Totales por Banco', 10, startY);

      const totalesBancoData = Object.entries(this.agruparPorBanco).map(([banco, transacciones]) => [
        banco,
        `$${parseFloat(this.calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

      totalesBancoData.push(['Total', `$${this.calcularGranTotalMonto()}`]);

      startY = addTableWithMargins(['Banco', 'Monto'], totalesBancoData, startY + 10);

      // Sección: Gastos Estación de Servicio
      doc.setFontSize(12);
      doc.text('GASTOS ESTACIÓN DE SERVICIO', 15, startY);

      const gastosEstacionData = [[`$${this.totalGeneral()}`]];

      addTableWithMargins(['GASTOS ESTACIÓN DE SERVICIO'], gastosEstacionData, startY + 15);

      // Footer del PDF
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        //doc.text(`Página ${i} de ${totalPages}`, pageWidth - 50, doc.internal.pageSize.height - 10);
      }

      // Guardar el PDF
      doc.save('Reporte_Gastos.pdf');
    },

    async downloadExcel() {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Reporte');

      // Título del reporte con estación y mes/año
      sheet.mergeCells('A1', 'C1');
      sheet.getCell('A1').value = `Estación: ${this.estaciones[this.dbm]} \n ${this.mesYAnio.toUpperCase()}`;
      sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(1).font = { bold: true, size: 16 };
      
      let rowNumber = 3; // Starting row for the first section

      const addTableWithHeader = (title, headers, data, startRow) => {
        sheet.mergeCells(`A${startRow}`, `C${startRow}`);
        sheet.getCell(`A${startRow}`).value = title;
        sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
        sheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'left' };
        startRow += 1;

        sheet.addRow(headers);
        sheet.getRow(startRow).font = { bold: true };
        sheet.getRow(startRow).alignment = { vertical: 'middle', horizontal: 'left' };
        startRow += 1;

        data.forEach((row) => {
          sheet.addRow(row);
          startRow += 1;
        });

        // Add an extra row for margin
        startRow += 1;
        return startRow;
      };

      // Sección: Transacciones por banco
      Object.entries(this.agruparPorBanco).forEach(([banco, transacciones]) => {
        // Filtrar transacciones con checkbox activo
        const transaccionesFiltradas = transacciones.filter(adeudo => adeudo.incluir);

        if (transaccionesFiltradas.length > 0) {
          const tableData = transaccionesFiltradas.map(adeudo => [
            adeudo.descripcion.length > 150 ? adeudo.descripcion.slice(0, 150) + '...' : adeudo.descripcion,
            `$${parseFloat(adeudo.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]);

          rowNumber = addTableWithHeader(banco, ['Descripción', 'Monto'], tableData, rowNumber);
        }
      });

      // Sección: Nuevas Transacciones
      const nuevasTransaccionesData = this.nuevasTransacciones.map(transaccion => [
        transaccion.descripcion.length > 60 ? transaccion.descripcion.slice(0, 60) + '...' : transaccion.descripcion,
        `$${parseFloat(transaccion.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      rowNumber = addTableWithHeader('Nuevas Transacciones', ['Descripción', 'Monto'], nuevasTransaccionesData, rowNumber);

      // Sección: Detalles de Gastos
      const detallesGastosData = this.resultados2.map(gasto => [
        gasto.categoria,
        gasto.id_nombre,
        `$${parseFloat(gasto.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      rowNumber = addTableWithHeader('Detalles de Gastos', ['Categoría', 'Nombre', 'Importe'], detallesGastosData, rowNumber);

      // Sección: Gastos por Categoría
      Object.entries(this.categorias).forEach(([categoria, gastos]) => {
        const gastosCategoriaData = gastos.map(gasto => [
          gasto.id_nombre,
          `$${parseFloat(gasto.importe).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
        rowNumber = addTableWithHeader(categoria, ['Nombre', 'Importe'], gastosCategoriaData, rowNumber);
      });

      // Sección: Resumen de Relación de Gastos
      const resumenGastosData = Object.entries(this.calcularTotalesPorCategoria().totalesPorCategoria).map(([categoria, total]) => [
        categoria,
        `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      resumenGastosData.push(['Total Global', `$${this.calcularTotalesPorCategoria().sumaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
      rowNumber = addTableWithHeader(`RESUMEN DE RELACIÓN DE GASTOS ${this.mesYAnio.toUpperCase()}`, ['Categoría', 'Total'], resumenGastosData, rowNumber);

      // Sección: Totales por Banco
      const totalesBancoData = Object.entries(this.agruparPorBanco).map(([banco, transacciones]) => [
        banco,
        `$${parseFloat(this.calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      totalesBancoData.push(['Total', `$${this.calcularGranTotalMonto()}`]);
      rowNumber = addTableWithHeader('Totales por Banco', ['Banco', 'Monto'], totalesBancoData, rowNumber);

      // Sección: Gastos Estación de Servicio
      const gastosEstacionData = [[`$${this.totalGeneral()}`]];
      addTableWithHeader('GASTOS ESTACIÓN DE SERVICIO', ['GASTOS ESTACIÓN DE SERVICIO'], gastosEstacionData, rowNumber);

      // Descargar el archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Reporte_Transacciones_Bancarias.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
    },
  

  },
  watch: {
    resultados2: {
      handler(newVal) {
        newVal.forEach(gasto => {
          if (gasto.categoria) {
            this.moverACategoria(gasto);
          }
        });
      },
      deep: true
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
.boton-descargar1 {
  background-color: #53980d; /* Verde */
  width: 100px;
  height: 35px;
  border-width: thin;
  border: 1px solid #3b6e22;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 15px;
  border-radius: 20px;
  margin-top: 1px;
  font-weight: bold;
  padding-left: 1px;
  font-family: "Roboto", sans-serif;
  font-size: 17px;
  transition: transform 0.5s ease, box-shadow 0.5s ease, background-color 0.5s ease;
}
.boton-descargar:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
  transform: translateY(0.5rem); /* Mover hacia abajo */
}
.boton-descargar1:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
  transform: translateY(0.3rem); /* Mover hacia abajo */
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

</style>