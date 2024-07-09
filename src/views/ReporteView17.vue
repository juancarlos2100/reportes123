<template>
    <div :class="{ 'dark-mode': isDarkMode }" class="container-fluid dark-mode-container">
        <header>
            <img class="imagen-encabezado" src="@/assets/logok.png" alt="Descripción de la imagen">
        </header>
        
      <h3 style="text-align: center;">Reporte de Gastos</h3>
      <br>
      
      <div class="container-fluid" >
        <form @submit.prevent="filtrarDatos" class="responsive-form">
          <label for="estacion" style="font-size: 24px; font-weight: bold; padding-right: 10px; font-family: Arial, sans-serif;">Estación:</label>
        <select id="estacion" v-model="dbm" @change="cargarBancos" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" style="width: 300px; height: 40px; margin-right: 10px; font-size: 20px; font-family: Arial, sans-serif;">
          <option value="" disabled selected>Seleccione una estación</option>
          <option v-for="(nombre, id) in estaciones" :key="id" :value="id">{{ nombre }}</option>
        </select>

        <br><br>
                        <label for="mes" style="font-size: 20px; font-weight: bold; padding-right: 10px;">Mes:</label>
                        <select v-model="mesSeleccionado" id="mes" class="form-select"
                            :class="{ 'dark-mode-select': isDarkMode }"
                            style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
                            required @change="generarFechas">
                            <option v-for="(mes, index) in meses" :key="index" :value="index + 1">{{ mes }}</option>
                        </select>

                        <!-- Selector de año -->
                        <label for="anio"
                            style="font-size: 20px; font-weight: bold; padding-right: 10px; margin-left: 10px;">Año:</label>
                        <select v-model="anioSeleccionado" id="anio" class="form-select"
                            :class="{ 'dark-mode-select': isDarkMode }"
                            style="width: 300px; height: 40px;margin-right: 10px;font-size: 20px;font-family: Arial, sans-serif;"
                            required @change="generarFechas">
                            <option v-for="anio in anios" :key="anio" :value="anio">{{ anio }}</option>
                        </select>
        <button class="boton-filtrar" type="submit">Filtrar</button>
            </form>
            
        <div class="responsive-buttons">

            <button class="boton-descargar" @click="downloadPDF" >Descargar PDF</button>
            <button class="boton-descargar" @click="downloadExcel">Descargar XLS</button>

        </div>
  
      </div>
  
      <div class="container-fluid" style="width: 95vw; margin-left: 5px;" >
        <!-- Lado izquierdo -->
        <div class="left-container" style="flex: 0 0 70%; overflow: auto;">
          <div v-for="(transacciones, banco) in agruparPorBanco" :key="banco">
            <h3 style="text-align: left; margin-left: 100px;">{{ banco }}</h3>
            <table class="responsive-table2" :class="{ 'table': !isDarkMode, 'dark-mode-table': isDarkMode }">
            <thead>
                <tr>
                <th></th>
                <th>id</th>
                <th>id_banco</th>
                <th>estado</th>
                <th style="text-align: center;">Descripción</th>
                <th style="text-align: center;">Monto</th>
                </tr>
            </thead>
            <tbody v-if="transacciones.length > 0">
                <tr v-for="(adeudo, index) in transacciones" :key="index">
                <td><input type="checkbox"  :checked="adeudo.estado === 1" @change="cambiarEstado(adeudo)"></td>
                <td>{{ adeudo['id_gastos_bancos'] }}</td>
                <td>{{ adeudo['id_banco'] }}</td>
                <td>{{ adeudo['estado'] }}</td>
                <td>{{ adeudo['descripcion'].length > 150 ? adeudo['descripcion'].slice(0, 150) + '...' : adeudo['descripcion'] }}</td>
                <td style="text-align: right;">${{ parseFloat(adeudo['monto']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                </tr>
                <tr>
                <td colspan="5" style="font-size: larger; text-align: right"><strong>Total</strong></td>
                <td style="font-size: larger; text-align: right" ><strong>{{ parseFloat(calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
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
          <div  class="responsive-buttons">
            <button v-if="mostrarResultados" class="boton-descargar"  @click="guardarDatosBancarios">Guardar Config</button>
          </div>
          <br>
          <h4 style="text-align: center" v-if="guardadoExitosoBancos">
               El reporte guardó con éxito la configuración de transacciones Bancarias!
            </h4>
            <br>
          
        <div>


      <h3 style="margin-left: 100px;" v-if="mostrarResultados">Nuevas Transacciones</h3>
      <table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]" v-if="mostrarResultados">
        <thead>
          <tr>
            <th style="text-align: center;">Descripcion</th>
            <th style="text-align: center">Monto</th>
            <th style="text-align: center;">Acciones</th>
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
            <td colspan="2" style="text-align: right;"><strong>Total</strong></td>
            <td style="text-align: right;"><strong>${{ calcularTotalNuevasTransacciones() }}</strong></td>
          </tr>
        </tbody>
      </table>


      <div class="responsive-buttons">
        <button v-if="mostrarResultados" @click="agregarNuevaTransaccion" class="boton-descargar1">Agregar</button>

      </div>
      <br>
    </div>


    <!-- Seccion de Detalle de Gastos-->
    <h2 v-if="mostrarResultados" style="text-align: center; margin-top: 20px">Detalle de Gastos</h2>
<table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]" v-if="mostrarResultados || detalleGasto.length > 0">
  <thead>
    <tr>
      <th style="text-align: center;">Categoria</th>
      <th style="text-align: center;">Nombre</th>
      <th style="text-align: center;">Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(gasto, index) in detalleGasto" :key="index">
      <td>
        <select style="font-size: large;" v-model="gasto.id_categoria" class="form-select" :class="{ 'dark-mode-select': isDarkMode }" @change="moverAGrupado(gasto, gasto.id_categoria)">
          <option v-for="(categoria, id) in catalogo" :key="id" :value="id">{{ categoria }}</option>
        </select>
      </td>
      <td>{{ gasto.descripcion }}</td>
      <td style="text-align: right;">${{ parseFloat(gasto.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
    </tr>
    <tr v-if="detalleGasto.length === 0"> <!-- Mostrar solo si detalleGasto está vacío -->
      <td colspan="5" style="text-align: center;">No hay detalles de gastos</td>
    </tr>
  </tbody>
</table>
<br>
<br>
  
      <!-- Tablas agrupadas por categoría -->
        <div v-for="(gastos, categoria) in agruparPorCategoria" :key="categoria">
          <h2 style="margin-left: 100px; margin-top: 20px;">{{ catalogo[categoria].split(' - ')[1] }}</h2>
          <table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]">
            <thead>
              <tr>
                <th>.</th>
                <th style="text-align: center;">Nombre</th>
                <th style="text-align: center;">Importe</th>
        
              </tr>
            </thead>
            <tbody>
              <tr v-for="(gasto, index) in gastos" :key="index">
                <td>
                  <button class="boton-descargar1" @click="devolverACategorias(gasto)">Devolver</button>
                </td>
                <td>{{ gasto.descripcion }}</td>
                <td style="text-align: right;">${{ parseFloat(gasto.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
          
              
              </tr>
              <tr>
                <td colspan="2" style="text-align: right;"><strong>Total</strong></td>
                <td style="text-align: right;"><strong>${{ calcularTotalMonto2(gastos) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>


            <div class="responsive-buttons">
          <button class="boton-descargar" @click="guardarDetalleGastos2" v-if="mostrarResultados">Guardar Gastos</button>

          <br>
          <br>

        </div>
        <br>
          <h4 style="text-align: center" v-if="guardadoExitosoDetalleGastos">
               El reporte guardó con éxito la configuración de sus Gastos!
            </h4>
            <br>
      <br>

          
      <h2 v-if="mostrarResultados" style="text-align: center">Resumen de Relación de Gastos de {{ this.meses[mesSeleccionado-1] }} {{ anioSeleccionado }}</h2>
        <table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]" v-if="mostrarResultados">
          <thead>
            <tr>
              <th style="text-align: center">Categoría</th>
             
              <th style="text-align: center;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(total, categoria) in calcularTotalesPorCategoria().totalesPorCategoria" :key="categoria">
              <td>{{ catalogo[categoria]}}</td>
              <td style="text-align: right;">${{ total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            </tr>
            <tr>
              <td style="font-size: larger; text-align: right;"><strong>Total Global</strong></td>
              <td style="font-size: larger; text-align: right"><strong>${{ calcularTotalesPorCategoria().sumaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
            </tr>
          </tbody>
        </table>

          </div>
  
          <div>
            <h2 style="text-align: center;" v-if="mostrarResultados">Totales por Banco</h2>
            <table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]" v-if="mostrarResultados">
              <thead>
                <tr>
                  <th style="text-align: center;" >Banco</th>
                  <th style="text-align: center;" >Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(transacciones, banco) in agruparPorBanco" :key="banco">
                  <td>{{ banco }}</td>
                  <td style="text-align: right;">{{ parseFloat(calcularTotalMonto(transacciones)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                </tr>
                <tr>
                  <td style="font-size: larger; text-align: right"><strong>Total</strong></td>
                  <td style="font-size: larger;text-align: right"><strong>${{ calcularGranTotalMonto() }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
       
          <div class="cont-total">
            <table :class="['responsive-table2', { 'table': !isDarkMode, 'dark-mode-table': isDarkMode }]">
              <thead>
                <tr>
                  <th style="font-size: x-large; text-align: right;">GASTOS ESTACIÓN DE SERVICIO</th>
                    
                  
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-size: x-large; text-align: right;"><strong>${{ totalGeneral() }}</strong></td>
                </tr>
              </tbody>
            </table>

            <div v-if="this.idReporteActualizar == null" class="responsive-buttons">
              <button v-if="mostrarResultados" class="boton-descargar" @click="guardarDatos">Guardar</button>
            </div>
            <div v-else class="responsive-buttons">
              <button class="boton-descargar" @click="guardarDatos">Actualizar</button>
            </div>
            <br>
            <br>
            <h4 style="text-align: center" v-if="guardadoExitoso">
              {{ reporteActualizado ? 'El reporte se actualizó con éxito!' : 'El reporte se guardó con éxito!' }}
            </h4>
            <br>
            <br>
            <br>
          </div>
        </div>
      </div>
  
  </template>
  
  <script>

  import { API_BASE_URL } from '../api-config.js'; 
  import axios from "axios";
  import { mapState } from 'vuex'; // Si usas Vuex para el manejo de estado

  
  
  export default {
    data() {
      return {
        meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        anios: this.generarAnios(),
        fechaInicio: '',
        fechaFin: '',
        turnoInicio: '',
        turnoFin: '',
        dbm: '',
        
        estaciones: {},
        catalogo: {},
        resultados: [],
        resultados2: [],
        isDarkMode: true,
        categorias: {},
        mesYAnio: '',
        mostrarResultados: false,
        nuevasTransacciones: [{ descripcion: '', monto: 0 }] ,
        mesSeleccionado: '', 
        annoSeleccionado: '',
        guardadoExitoso: false, 
        reporteActualizado: false, 
        fechaFormatoGetGastos: '',
        idReporteActualizar: null,
        guardadoExitosoBancos: false, 
        guardadoExitosoDetalleGastos: false,
        detalleGasto: [], 
        gastosAgrupadosPorCategoria: {},
     
        
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

      ...mapState(['user']),
      agruparPorCategoria() {
        return this.resultados2.reduce((acc, gasto) => {
          const categoriaId = gasto.id_categoria;
          if (!acc[categoriaId]) {
            acc[categoriaId] = [];
          }
          acc[categoriaId].push(gasto);
          return acc;
        }, {});
       },
      },

      
    methods: {
      async cargarEstaciones() {
        const url = `${API_BASE_URL}admin/get.php/estaciones`;
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

      async cargarCatalogo() {
        const url = `${API_BASE_URL}admin/get.php/getcatalogo`;
        try {
          const response = await axios.get(url);
          this.catalogo = response.data.data.reduce((acc, item) => {
            acc[item.id] = `${item.id} - ${item.nombre}`;
            return acc;
          }, {});
        } catch (error) {
          console.error("Error al obtener el catálogo:", error);
        }
      },

  
      validarCampos() {
          if (!this.dbm ) {
            console.error("Por favor, selecciona una estación.");
            return false;
          }
          return true;
        },
    
  
  
        async filtrarDatos() {
            if (!this.validarCampos()) {
                return;
            }

            // Llamar a la función generarFechas antes de hacer las solicitudes
            this.generarFechas();
            const url0 = `${API_BASE_URL}admin/get.php/gettotalgastos?fecha=${this.fechaFormatoGetGastos}&dbm=${this.dbm}`;
            const url1 = `${API_BASE_URL}admin/get.php/getgastosbancos?dbm=${this.dbm}&fecha=${this.fechaFormatoGetGastos}`;
            const url2 = `${API_BASE_URL}admin/get.php/getdetallegasto?dbm=${this.dbm}&fecha=${this.fechaFormatoGetGastos}`;

            const params1 = {
                fechaInicio: `${this.fechaInicio2}T00:00:00`,
                fechaFin: `${this.fechaFin2}T23:59:59`,
                dbm: parseInt(this.dbm)
            };

            const params2 = {
                turnoInicio: this.turnoInicio,
                turnoFin: this.turnoFin,
                dbm: parseInt(this.dbm)
            };

            try {
                const response1 = await axios.get(url1, { params: params1 });
                console.log("Datos recibidos de getgastosbancos:");
                console.log(response1.data.data); // Mostrar todos los campos del JSON recibido
                this.resultados = response1.data.data.map(transaccion => ({
                ...transaccion,
                incluir: true,
                categoria: null
                }));

                const response2 = await axios.get(url2, { params: params2 });
                console.log("Datos recibidos de getdetallegasto:");
                console.log(response2.data.data); // Mostrar todos los campos del JSON recibido
                this.resultados2 = response2.data.data.map(gasto => ({
                ...gasto,
                categoria: null
                }));

                //this.mesYAnio = this.convertirFechaAMesYAnio(this.fechaFin2);
                this.mostrarResultados = true;
                this.guardadoExitoso = false;
                this.guardadoExitosoBancos = false;
            } catch (error) {
                console.error("Error al obtener datos de la API:", error);
            }

            try {
                const response0 = await axios.get(url0);
                if (response0.data.data.length > 0) {
                this.idReporteActualizar = response0.data.data[0].id_total_gastos;
                } else {
                this.idReporteActualizar = null;
                }
                console.log(this.idReporteActualizar);
                console.log(url0);
            } catch (error) {
                console.error("Error al obtener datos de la API:", error);
            }
            },

  
      calcularTotalNuevasTransacciones() {
      return this.nuevasTransacciones.reduce((total, transaccion) => {
        const monto = parseFloat(transaccion.monto);
        return total + (isNaN(monto) ? 0 : monto);
      }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  
    calcularTotalMonto(transacciones) {
        return transacciones.reduce((total, transaccion) => {
            if (transaccion.incluir && transaccion.estado) {
                const monto = parseFloat(transaccion.monto);
                return total + (isNaN(monto) ? 0 : monto);
            }
            return total;
        }, 0);
    },
  
    calcularTotalMonto2(gastos) {
      return gastos.reduce((total, gasto) => total + parseFloat(gasto.monto), 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
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
  
      moverADetalle(gasto) {
        this.gastosAgrupadosPorCategoria[gasto.id_categoria] = this.gastosAgrupadosPorCategoria[gasto.id_categoria].filter(g => g.id_detalle_gasto !== gasto.id_detalle_gasto);
        this.detalleGasto.push(gasto);
      },
      moverAGrupado(gasto, nuevaCategoria) {
        this.detalleGasto = this.detalleGasto.filter(g => g.id_detalle_gasto !== gasto.id_detalle_gasto);
        gasto.id_categoria = nuevaCategoria;
        if (!this.gastosAgrupadosPorCategoria[nuevaCategoria]) {
          this.gastosAgrupadosPorCategoria[nuevaCategoria] = [];
        }
        this.gastosAgrupadosPorCategoria[nuevaCategoria].push(gasto);
      },
    actualizarCategoria(gasto, nuevaCategoria) {
      // Mover a la nueva categoría si es necesario
      if (gasto.id_categoria !== nuevaCategoria) {
        this.moverADetalleDeGastos(gasto, nuevaCategoria);
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
    const todasTransacciones = [...this.detalleGasto, ...this.nuevasTransacciones];

    // Calcular totales para detalleGasto y nuevasTransacciones
    todasTransacciones.forEach(gasto => {
      if (!totalesPorCategoria[gasto.id_categoria]) {
        totalesPorCategoria[gasto.id_categoria] = 0;
      }
      totalesPorCategoria[gasto.id_categoria] += parseFloat(gasto.monto);
    });

    // Calcular totales para agrupados por categoria
    for (const categoria in this.agruparPorCategoria) {
      const gastos = this.agruparPorCategoria[categoria];
      if (!totalesPorCategoria[categoria]) {
        totalesPorCategoria[categoria] = 0;
      }
      totalesPorCategoria[categoria] += gastos.reduce((total, gasto) => total + parseFloat(gasto.monto), 0);
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
      // Verifica si la categoría está presente en agruparPorCategoria
      const categorias = Object.keys(this.agruparPorCategoria);
      for (let i = 0; i < categorias.length; i++) {
        const categoria = categorias[i];
        const gastos = this.agruparPorCategoria[categoria];
        // Busca el gasto dentro de los gastos de esta categoría
        const index = gastos.findIndex(item => item.id_detalle_gasto === gasto.id_detalle_gasto);
        if (index !== -1) {
          // Remueve el gasto de la categoría actual
          const gastoMovido = gastos.splice(index, 1)[0];
          // Agrega el gasto movido al arreglo detalleGasto
          this.detalleGasto.push(gastoMovido);
          break; // Termina el ciclo una vez que se ha encontrado y movido el gasto
        }
      }
    },


    
    guardarDatos() {
        const id_fecha = `${this.anioSeleccionado}${this.mesSeleccionado.toString().padStart(2, '0')}`;
        const createEndpoint = `${API_BASE_URL}admin/app.php/totalgastos`;
        const updateEndpoint = `${API_BASE_URL}admin/app.php/totalgastos/${this.idReporteActualizar}`;
        const datosGuardar = {
          id_dbm: this.dbm,
          id_fecha: id_fecha,
          total_gastos: parseFloat(this.totalGeneral().replace(/,/g, ''))
        };

        const datosActualizar = {
          id_total_gastos: this.idReporteActualizar,
          total_gastos: parseFloat(this.totalGeneral().replace(/,/g, ''))
        };

        if (this.idReporteActualizar == null){
          axios.post(createEndpoint, datosGuardar)
            .then(response => {
              console.log('Datos guardados exitosamente:', response.data);
              this.guardadoExitoso = true;
              this.reporteActualizado = false; 
            })
            .catch(error => {
              console.error('Error al guardar datos:', error);
            });
        }else{
        axios.put(updateEndpoint, datosActualizar)
          .then(response => {
            console.log('Datos actualizados exitosamente:', response.data);
            console.log(this.id_total_gastos)
            this.guardadoExitoso = true;
            this.reporteActualizado = true; 
          })
          .catch(error => {
            console.error('Error al actualizar datos:', error);
          });
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
        generarFechas() {
          if (this.mesSeleccionado && this.anioSeleccionado) {
            
            const fecha = new Date(this.anioSeleccionado, this.mesSeleccionado - 1);

            const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            this.fechaInicio2 = `${primerDia.getFullYear()}-${String(primerDia.getMonth() + 1).padStart(2, '0')}-${String(primerDia.getDate()).padStart(2, '0')}`;
            this.fechaInicio = `${primerDia.getFullYear()}-${String(primerDia.getMonth() + 1).padStart(2, '0')}-${String(primerDia.getDate()).padStart(2, '0')} 00:00:00`;


            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            this.fechaFin2 = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
            this.fechaFin = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')} 23:59:59`;


            let ano = primerDia.getFullYear();
            let mes = primerDia.getMonth() + 1;
            let dia = primerDia.getDate();

       
            mes = mes < 10 ? '0' + mes : mes;
            dia = dia < 10 ? '0' + dia : dia;
            this.turnoInicio = `${ano}${mes}${dia}01`;

         
            let anoU = ultimoDia.getFullYear();
            let mesU = ultimoDia.getMonth() + 1;
            let diaU = ultimoDia.getDate();
            mesU = mesU < 10 ? '0' + mesU : mesU;
            diaU = diaU < 10 ? '0' + diaU : diaU;
            this.turnoFin = `${anoU}${mesU}${diaU}02`;
            this.fechaFormatoGetGastos = `${anoU}${mes}`;

          }
        },


        cambiarEstado(adeudo) {
          adeudo.estado = adeudo.estado === 1 ? 0 : 1;
          // Añadir una bandera para indicar que el estado ha cambiado
          adeudo.hasChanged = true;
        },

      async guardarDetalleGastos2() {
      try {
        const id_fecha = `${this.fechaInicio2.replace(/-/g, '').substring(0, 6)}`;
        const dbm = this.dbm;
        const getEndpoint = `${API_BASE_URL}admin/get.php/getdetallegasto?dbm=${this.dbm}&fecha=${this.id_fecha}`;
        const updateEndpoint = `${API_BASE_URL}admin/get.php/detallegastosput`;

        console.log('Verificando existencia de detalles de gastos...');
        const response = await axios.get(getEndpoint, {
          params: { dbm: dbm, fecha: id_fecha }
        });
        const existingData = response.data.data;

        if (existingData.length > 0) {
          let id_detalle_gasto = [];
          let categoria = [];
          let estado = [];

          // Recorrer las tablas agrupadas por categoría para obtener los datos actualizados
          for (let categoriaKey in this.agruparPorCategoria) {
            this.agruparPorCategoria[categoriaKey].forEach(gasto => {
              // Encontrar el detalle correspondiente en existingData por id_detalle_gasto
              const detalleExistente = existingData.find(item => item.id_detalle_gasto === gasto.id_detalle_gasto);
              if (detalleExistente) {
                id_detalle_gasto.push(gasto.id_detalle_gasto);
                categoria.push(gasto.id_categoria);
                estado.push(detalleExistente.estado); // Usar estado existente desde existingData
              }
            });
          }

          const datosActualizar = {
            id_detalle_gasto: id_detalle_gasto,
            categoria: categoria,
            estado: estado
          };

          console.log('Datos a actualizar:');
          console.log(datosActualizar);

          const updateResponse = await axios.put(updateEndpoint, datosActualizar);
          console.log('Detalles de gastos actualizados exitosamente!!:', updateResponse.data);

        } else {
          this.guardadoExitosoDetalleGastos = true;
        }
      } catch (error) {
        console.error('Error en la operación de guardar o actualizar detalles de gastos:', error);
      }
    },

    async guardarDatosBancarios() {
      try {
        // Formatear el ID de la fecha
        const id_fecha = `${this.fechaInicio2.replace(/-/g, '').substring(0, 6)}`;
        const dbm = this.dbm;

        // Endpoint para verificar la existencia de una configuración
        const getEndpoint = `${API_BASE_URL}admin/get.php/getgastosbancos?dbm=${dbm}&fecha=${id_fecha}`;
        const updateEndpoint = `${API_BASE_URL}admin/get.php/gastosbancosput`;

        console.log('Verificando existencia de configuración...');
        const response = await axios.get(getEndpoint, {
          params: { dbm: dbm, fecha: id_fecha }
        });
        const existingData = response.data.data;

        if (existingData.length > 0) {
          const datosActualizar = {
            id_gastos_bancos: [],
            estado: []
          };

          // Recorrer todas las transacciones agrupadas por banco
          for (let banco in this.agruparPorBanco) {
            let transacciones = this.agruparPorBanco[banco];
            
            transacciones.forEach(transaccion => {
              datosActualizar.id_gastos_bancos.push(transaccion.id_gastos_bancos);
              if (transaccion.hasChanged) {
                datosActualizar.estado.push(transaccion.estado);
              } else {
                const transaccionExistente = existingData.find(item => item.id_gastos_bancos === transaccion.id_gastos_bancos);
                if (transaccionExistente) {
                  datosActualizar.estado.push(transaccionExistente.estado);
                }
              }
            });
          }

          console.log('Datos a actualizar:');
          console.log('id_gastos_bancos:', datosActualizar.id_gastos_bancos);
          console.log('estado:', datosActualizar.estado);

          const updateResponse = await axios.put(updateEndpoint, datosActualizar);
          console.log('Datos actualizados exitosamente:', updateResponse.data);
          this.guardadoExitosoBancos = true;
        } else {
          console.log('No se encontró configuración existente.');
          this.guardadoExitosoBancos = false;
        }
      } catch (error) {
        console.error('Error en la operación de guardar o actualizar datos:', error);
        this.guardadoExitosoBancos = false;
      }
    }


    



  
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
      this.cargarCatalogo();
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
    width: 80%;
    height: 400px;
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

  
  
  
  .boton-descargar:hover {
    background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
    transform: translateY(0.5rem); /* Mover hacia abajo */
  }
  .boton-descargar1 {
  background-color: #53980d; /* Verde */
  width: 120px;
  height: 40px;
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

  
  
  .boton-descargar:active {
    transform: scale(1.05) translateY(0.5rem); /* Aumentar un poco el tamaño y mover hacia abajo al hacer clic */
  }
  .boton-filtrar {
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
  .dark-mode-container {
  background-color: #333; /* Color de fondo oscuro */
  color: #fff; /* Color de texto blanco */
  width: 100vw; /* Ancho igual al ancho de la ventana del navegador */
  min-height: 100vh; /* Altura mínima igual a la altura de la ventana del navegador */
  /* Añade otras propiedades necesarias para el contenedor oscuro */
}

.boton-descargar1:hover {
  background-color: #3b6e22; /* Verde oscuro al pasar el cursor */
  transform: translateY(0.3rem); /* Mover hacia abajo */
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
    margin-right: 50px;
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
    width: 90%; /* Ancho completo */
    
  }
  
  .dark-mode .tabla-totales th,
  .dark-mode .tabla-totales td {
    border: 1px solid #fff; /* Borde blanco */
    padding: 8px; /* Espaciado interno */
    text-align: center; /* Alineación centrada */
  }
  
  .dark-mode .tabla-totales th {
    .dark-mode-table {
    color: #fff; /* Color del texto en modo oscuro */
    background-color: #333; /* Color de fondo en modo oscuro */
    border-collapse: collapse; /* Colapsar los bordes de la tabla */
    width: 80%; /* Ancho de la tabla */
    margin-top: 20px; /* Margen superior */
    margin-bottom: 8px; /* Margen inferior */
    margin-left: 20px;
    margin-right: 50px;
  }
  
  }




    .responsive-form {
    display: flex;
    justify-content: center;
    width: 85vw;
  }

  .responsive-buttons {
    display: flex;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .responsive-form {
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .responsive-buttons {
      flex-direction: column;
      align-items: center;
    }
  }

  .responsive-table {
    width: 27%;
    margin-right: 100px;
    margin-left: auto;
  }

  @media (max-width: 768px) {
    .responsive-table {
      width: 27%;
      margin-right: 100px;
      margin-left: auto;
    }
  }

  .responsive-table2 {
    width: 90%;
    margin-right: 100px;
    margin-left: auto;
  }

  @media (max-width: 768px) {
    .responsive-table2 {
      width: 100%;
      margin-right: 0;
      margin-left: 0;
    }
  }

  .logo-animacion{
    display: flex;
    flex-direction: row;
  }

  .logoOk{
    display: flex;
    justify-content: left;
    font-weight: bold;
    color: #FAFAFA;
    transform: rotate(0deg);
    transition: .8s ease;
  }

  .logoOk:hover{
    transform: rotate(360deg);
  }

  
</style>