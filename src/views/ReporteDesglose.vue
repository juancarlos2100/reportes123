<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="container">
    <div>
      <header>
        <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
      </header>
      <h1>Desglose</h1>
      <br>
      <form @submit.prevent="filtrarDatos">
        <!-- Pedir turno inicial -->
        <!-- <label for="idTurnoInicial" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno Inicial:</label>
        <input type="text" v-model="this.turnoInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px;" required>
         Pedir turno final -->
        <!-- <label for="idTurnoFinal" style="font-size: 20px; font-weight: bold; padding-right: 10px;">ID Turno Final:</label>
        <input type="text" v-model="this.turnoFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px;" required> -->
        <!-- <br> -->
        <!-- Pedir fecha Inicial -->
        <!-- <label for="fechaInicio" style="font-size: 20px; font-weight: bold; padding-right: 10px;" >Fecha de Inicio:</label>
        <input type="date" v-model="fechaInicio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px;"> -->
        <!-- Pedir fecha Final -->
        <!-- <label for="fechaFin" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Fecha de Fin:</label>
        <input type="date" v-model="fechaFin" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="margin-right:10px;"> -->
        <!-- <br> -->
        <div>
          <!-- Selector de mes -->
          <label for="idTurnoInicial" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Selecciones Mes,
            Año y Estación</label>
          <br><br>
          <label for="mes" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Mes:</label>
          <select v-model="mesSeleccionado" id="mes" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
            style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
            required @change="generarFechas">
            <option v-for="(mes, index) in meses" :key="index" :value="index + 1">{{ mes }}</option>
          </select>

          <!-- Selector de año -->
          <label for="anio"
            style="font-size: 20px; font-weight: bold; padding-right: 10px; margin-left: 10px;">Año:</label>
          <select v-model="anioSeleccionado" id="anio" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
            style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
            required @change="generarFechas">
            <option v-for="anio in anios" :key="anio" :value="anio">{{ anio }}</option>
          </select>
        </div>

        <!-- Pedir estación -->
        <label for="estacion"
          style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" class="form-select" :class="{ 'dark-mode-select': isDarkMode }"
          style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
          required>
          <option value="" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>


        <button class="boton-filtrar" type="submit">Filtrar</button>
      </form>
      <button class="boton-descargar" @click="downloadPDF">Descargar PDF</button>
      <button class="boton-descargar" @click="exportExcel">Descargar XLS</button>

      <div>
        <h3> Estación: {{ estaciones[dbm] }} </h3>

        <p>Periodo de: <strong>{{ this.fechaInicio }}</strong> con turno: <strong>{{ this.turnoInicio }}</strong></p>
        <p>Hasta: <strong>{{ fechaFin }}</strong> con turno <strong>{{ this.turnoFin }}</strong></p>

      </div>

  

      <div>
        <!-- Tabla Totales Bancos -->
        <h3>Bancos</h3>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
          <thead>
            <tr>
              <th>Bancos</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(saldo, banco) in calcularUltimoSaldoPorBanco()" :key="banco">
              <td><strong>{{ banco }}</strong></td>
              <td>${{ parseFloat(saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }}
              </td>
            </tr>
            <td><strong>Total</strong></td>
            <td><strong>${{ calcularTotalSaldoUltimoPorBanco().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) }}</strong></td>
          </tbody>
        </table>

        <!-- Tabla pipas por pagar -->
        <div>
          <h3>Pipas Por Pagar(Proveedores)</h3>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
            <thead>
              <tr>
                <th>Pipas por pagar (PROVEEDOR)</th>
                <th>Folio-Factura</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              <!-- <tr v-for="(saldo, proveedor) in calcularTotalesPorNombreProveedores()" :key="proveedor"> -->
              <tr v-for="(proveedor) in this.resultadosFiltradosProveedores" :key="proveedor">
                <td>{{ proveedor.proveedor }}</td>
                <td>{{ proveedor.factura }}</td>
                <td>{{ parseFloat(proveedor.importe).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td></td>
                <td><strong>${{ calcularTotalGeneralSaldosProveedores().toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- Tabla Efectivo por depositar -->
        <div>
          <h3>Efectivo Por Depositar(Cortes)</h3>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
            <thead>
              <tr>
                <th>ID Turno</th>
                <th>Monto</th>
                <th>Depositado</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(adeudo, index) in resultadosFiltradosEfectivo" :key="index">
                <td>{{ adeudo['turno'] ? adeudo['turno'] : 'NULL' }}</td>
                <td>${{ parseFloat(adeudo['monto']).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
                <td>${{ parseFloat(adeudo['depositado']).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
                <td>${{ parseFloat(adeudo['diferencia']).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${{ calcularTotalDiferencia('monto').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
                <!-- Agrega una celda vacía para mantener la alineación -->
                <td><strong>${{ calcularTotalDiferencia('depositado').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
                <!-- Agrega una celda vacía para mantener la alineación -->
                <td><strong>${{ calcularTotalDiferencia('diferencia').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabla de clientes por cobrar   -->
        <div>
          <h3>Clientes Por Cobrar</h3>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
            <thead>
              <tr>
                <th>Clientes de Credito</th>
                <th>Saldo Final de Mes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(adeudo, index) in resultadosFiltradosClientes" :key="index">
                <td>{{ adeudo['razon_social'] }}</td>
                <td>${{ parseFloat(adeudo['final']).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${{ calcularTotalSaldosClientes().toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Tabla empresas de reembolso -->
          <h3>Empresas de reembolso</h3>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Saldo Final del Mes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(adeudo, index) in resultadosFiltradosReembolso" :key="index">
                <td>{{ adeudo['razon_social'] }}</td>
                <td>${{ parseFloat(adeudo['saldo_fin']).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</td>
              </tr>
              <!-- Nueva fila para mostrar el total -->
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${{ calcularTotalSaldosReembolso().toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--Inventario de Gasolina-->
        <div>
          <h3>Inventario Gasolina</h3>
          <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
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
                <td>{{ adeudo['producto'] }}</td>
                <td>{{ parseFloat(adeudo['fin']).toLocaleString('en-US', {
                  minimumFractionDigits: 2, maximumFractionDigits:
                    2
                }) }}</td>
                <td>${{ adeudo['precio_compra'] }}</td>
                <td><strong>${{ parseFloat(adeudo['fin'] * adeudo['precio_compra']).toLocaleString('en-US',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <!--Inventario de Aceites-->
        <h3>Inventario de Aceites</h3>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
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
              <td>${{ parseFloat(aceite['precio']).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</td>
              <td>${{ parseFloat(aceite['total']).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</td>
            </tr>
            <!-- Añade una nueva fila al final para mostrar la suma total de la columna 'total' -->
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{{ calcularTotalInventarioAceites('cantidad') }}</strong></td>
              <td><strong>${{ calcularTotalInventarioAceites('precio').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</strong></td>
              <td><strong>${{ calcularTotalInventarioAceites('total').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <!--Clientes debito-->
        <h3>Clientes Debito</h3>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
          <thead>
            <tr>
              <th>Razon Social</th>
              <th>Saldo Final del Mes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(adeudo, index) in resultadosFiltradosClientesDebito" :key="index">
              <td>{{ adeudo['razon_social'] }}</td>
              <td>${{ parseFloat(adeudo['final']).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>${{ calcularTotalClientesDebito().toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- REPORTE DE VENTAS- PERIODO INVENTARIO -->
      <div>
        <h3>Reporte de Ventas - Periodo Inventario</h3>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio Promedio</th>
              <th>Litros</th>
              <th>Total</th>
              <th>Prom. Por Litro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(adeudo, index) in resultadosGasolina" :key="index">
              <td>{{ adeudo['producto'] }}</td>
              <td>${{ adeudo['precio_venta'] }}</td>
              <td>{{ parseFloat(adeudo['venta_mensual']).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</td>
              <td>${{ parseFloat(adeudo['venta_mensual'] * adeudo['precio_venta']).toLocaleString('en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              <td>{{ parseInt(adeudo['venta_mensual'] / 31).toLocaleString('en-US') }}</td>
            </tr>
            <tr>
              <td><strong>Totales</strong></td>
              <td><strong>${{ calcularTotalInventarioGasolina('precio_venta').toLocaleString('en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              <td><strong>${{ calcularTotalInventarioGasolina('venta_mensual').toLocaleString('en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              <td><strong>${{ calcularTotalInventarioGasolinaTotal().toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</strong></td>
              <td><strong>{{ parseInt(calcularTotalInventarioGasolinaPromedio()).toLocaleString('en-US') }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- REPORTE DE VENTAS- PERIODO INVENTARI- COMPLEMENTO -->
      <div>
        <h3>Reporte de Ventas - Periodo Inventario</h3>
        <table :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }" class="tabla-totales">
          <thead>
            <tr>
              <th>Producto</th>
              <!-- <th>Porcentajes</th> -->
              <!-- <th>Tab Merma</th> -->
              <th>Merma Periodo Inventario(L)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(adeudo, index) in resultadosGasolina" :key="index">
              <td>{{ adeudo['producto'] }}</td>
              <!-- <td>${{ adeudo['precio_venta'] }}</td> -->
              <!-- <td>{{ parseFloat(adeudo['venta_mensual']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td> -->
              <td>{{ adeudo['merma'] }}</td>
            </tr>
            <tr>
              <td><strong>Totales</strong></td>
              <!-- <td><strong>${{ calcularTotalInventarioGasolina('precio_venta').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td> -->
              <!-- <td><strong>${{ calcularTotalInventarioGasolina('venta_mensual').toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</strong></td> -->
              <td><strong>{{ calcularTotalInventarioGasolina('merma').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
      fechaInicio: '',
      fechaFin: '',
      fechaInicio2: '',
      fechaFin2: '',
      turnoInicio: '',
      turnoFin: '',
      estaciones: {}, // {id_dbm: 'nombre'}
      isDarkMode: true,
      dbm: 21,
      meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      anios: this.generarAnios(),
      carganding: false,
      resultadosBancos: [],
      resultadosProveedores: [],
      resultadosEfectivo: [],
      resultadosClientes: [],
      resultadosClientesDebito: [],
      resultadosReembolso: [],
      resultadosGasolina: [],
      resultadosAceites: [],
      resultadosFiltradosBancos: [],
      resultadosFiltradosProveedores: [],
      resultadosFiltradosEfectivo: [],
      resultadosFiltradosClientes: [],
      resultadosFiltradosClientesDebito: [],
      resultadosFiltradosReembolso: [],
      resultadosFiltradosAceites: [],


      totales: { cantidad: 0, precio: 0, total: 0 },

    };
  },
  mounted() {
    this.cargarEstaciones();
  },
  methods: {
    // Cargar los nombres de las estaciones  
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
      const url = `http://gasserver.dyndns.org:8081/admin/get.php/desglose?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}&turnoInicio=${this.turnoInicio}&turnoFin=${this.turnoFin}&dbm=${this.dbm}`;
      try {
        const response = await axios.get(url);
        // RESULTADOS
        this.resultadosBancos = response.data.data;

        //BANCOS
        this.resultadosFiltradosBancos = this.resultadosBancos[0];

        // PROVEEDORES
        this.resultadosProveedores = response.data.data;
        this.resultadosFiltradosProveedores = this.resultadosProveedores[1];

        //TURNOS POR DEPOSITAR
        this.resultadosEfectivo = response.data.data;
        this.resultadosFiltradosEfectivo = this.resultadosEfectivo[2];

        // INVENTARIO DE ACEITES
        this.resultadosAceites = response.data.data;
        this.resultadosFiltradosAceites = this.resultadosAceites[3];

        // EMPRESAS DE REEMBOLSO
        const urlEmpresasRembolso = `http://gasserver.dyndns.org:8081/admin/get.php/empresarembolso?turnoInicio=${this.turnoInicio}&turnoFin=${this.turnoFin}&dbm=${this.dbm}`;
        const response2 = await axios.get(urlEmpresasRembolso);
        this.resultadosReembolso = response2.data.data;
        this.resultadosFiltradosReembolso = this.resultadosReembolso;

        //CLIENTES POR COBRAR (CREDITO) 
        const urlClientesCredito = `http://gasserver.dyndns.org:8081/admin/get.php/saldosclientesturno?turnoInicio=${this.turnoInicio}&turnoFin=${this.turnoFin}&dbm=${this.dbm}`;
        const response3 = await axios.get(urlClientesCredito);
        this.resultadosClientes = response3.data.data;
        this.resultadosFiltradosClientes = this.resultadosClientes;

        // CLIENTES DEBITO
        const urlClientesDebito = `http://gasserver.dyndns.org:8081/admin/get.php/saldosclientesdebito?turnoInicio=${this.turnoInicio}&turnoFin=${this.turnoFin}&dbm=${this.dbm}`;
        const response4 = await axios.get(urlClientesDebito);
        this.resultadosClientesDebito = response4.data.data;
        this.resultadosFiltradosClientesDebito = this.resultadosClientesDebito;

        // INVENTARIO DE GASOLINA
        const urlGasolina = `http://gasserver.dyndns.org:8081/admin/get.php/utilidadventas?fechaInicio=${this.fechaInicio2}&fechaFin=${this.fechaFin2}&dbm=${this.dbm}`;
        const response5 = await axios.get(urlGasolina);
        this.resultadosGasolina = response5.data.data;
        this.resultadosFiltradosGasolina = this.resultadosGasolina;

      } catch (error) {
        console.error("Error al obtener los saldos de los bancos:", error);
      }
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
        const nombreProveedor = adeudo['proveedor'];
        const saldo = parseFloat(adeudo['importe']);
        totalesPorNombre[nombreProveedor] = (totalesPorNombre[nombreProveedor] || 0) + saldo;
      });
      return totalesPorNombre;
    },

    calcularTotalGeneralSaldosProveedores() {
      let totalGeneral = 0;
      this.resultadosFiltradosProveedores.forEach((adeudo) => {
        totalGeneral += parseFloat(adeudo['importe']);
      });
      return totalGeneral;
    },

    obtenerFolios(proveedor) {
      const folios = this.resultadosFiltradosProveedores
        .filter(adeudo => adeudo['proveedor'] === proveedor)
        .map(adeudo => adeudo['folio'])
        .join(', '); // Si deseas los folios separados por comas
      console.log(folios);
      return folios;
    },
    calcularTotalSaldosClientes() {
      return this.resultadosFiltradosClientes.reduce((total, cliente) => {
        return total + parseFloat(cliente['final']);
      }, 0);
    },
    calcularTotalClientesDebito() {
      return this.resultadosFiltradosClientesDebito.reduce((total, cliente) => {
        return total + parseFloat(cliente['final']);
      }, 0);
    },
    calcularTotalDiferencia(atributo) {
      return this.resultadosFiltradosEfectivo.reduce((total, adeudo) => {
        return total + parseFloat(adeudo[atributo]);
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
        return total + parseFloat(adeudo['saldo_fin']);
      }, 0);
    },
    calcularTotalInventarioAceites(atributo) {
      return this.resultadosFiltradosAceites.reduce((total, aceite) => {
        return total + parseFloat(aceite[atributo]);
      }, 0);
    },
    calcularTotalInventarioGasolina(atributo) {
      return this.resultadosGasolina.reduce((total, adeudo) => {
        return total + parseFloat(adeudo[atributo]);
      }, 0);
    },
    calcularTotalInventarioGasolinaTotal() {
      return this.resultadosGasolina.reduce((total, adeudo) => {
        return total + parseFloat(adeudo['venta_mensual'] * adeudo['precio_venta']);
      }, 0);
    },
    calcularTotalInventarioGasolinaPromedio() {
      return this.resultadosGasolina.reduce((total, adeudo) => {
        return total + parseFloat(adeudo['venta_mensual'] / 31);
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
    generarAnios() {
      const anioActual = new Date().getFullYear();
      const anios = [];
      for (let anio = anioActual; anio >= anioActual - 100; anio--) {
        anios.push(anio);
      }
      return anios;
    },
    generarFechas() {
      if (this.mesSeleccionado && this.anioSeleccionado) {
        // Crear una nueva fecha con el año y el mes seleccionados
        const fecha = new Date(this.anioSeleccionado, this.mesSeleccionado - 1);

        // Obtener el primer día del mes
        const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
        this.fechaInicio2 = `${primerDia.getFullYear()}-${String(primerDia.getMonth() + 1).padStart(2, '0')}-${String(primerDia.getDate()).padStart(2, '0')}`;
        this.fechaInicio = `${primerDia.getFullYear()}-${String(primerDia.getMonth() + 1).padStart(2, '0')}-${String(primerDia.getDate()).padStart(2, '0')} 00:00:0`;

        // Obtener el último día del mes
        const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
        this.fechaFin2 = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
        this.fechaFin = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')} 23:59:59`;

        //  TURNOS  INICIO Y FIN
        // Obtiene el año
        let ano = primerDia.getFullYear();
        // Obtiene el mes y le suma 1
        let mes = primerDia.getMonth() + 1;
        // Obtiene el día
        let dia = primerDia.getDate();

        // Asegurarse de que el mes y el día sean de dos dígitos
        mes = mes < 10 ? '0' + mes : mes;
        dia = dia < 10 ? '0' + dia : dia;
        this.turnoInicio = `${ano}${mes}${dia}01`;

        // Obtiene el año
        let anoU = ultimoDia.getFullYear();
        // Obtiene el mes y le suma 1
        let mesU = ultimoDia.getMonth() + 1;
        // Obtiene el día
        let diaU = ultimoDia.getDate();

        // Asegurarse de que el mes y el día sean de dos dígitos
        mesU = mesU < 10 ? '0' + mesU : mesU;
        diaU = diaU < 10 ? '0' + diaU : diaU;
        this.turnoFin = `${anoU}${mesU}${diaU}02`;

      }
    },
  }

};
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