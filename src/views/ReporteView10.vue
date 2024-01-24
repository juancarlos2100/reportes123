<template>
    <div id="resultado">
        <h2>Transacciones Banco Saldo </h2>
        <button @click="downloadPDF">Descargar PDF</button>
        <table>
            <thead>
                <tr>
                    <th>Banco</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(resu, index) in resultados" :key="index">
                    <td>{{ resu['cuentas.banco'] }}</td>
                    <td>{{ resu['transacciones_bancos.saldo'] }}</td>
                </tr>
            </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; width: 900px; height: 300px;">
            <div style="width: 120%;">
                <canvas id="myChartPositive"></canvas>
            </div>
            <div style="width: 120%;">
                <canvas id="myChartNegative"></canvas>
            </div>
        </div>

    </div>
</template>

<script>
import axios from "axios";
import { Chart } from 'chart.js';
import jsPDF from 'jspdf';
//import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

export default {
    data() {
        return {
            resultados: [],
        };
    },
    mounted() {
        // Obtener datos de la API utilizando Axios
        axios
            .get("https://sistemas-oktan.com/admin/get.php/productosnombre")
            .then((response) => {
                this.resultados = response.data.data;
                console.log(this.resultados);
                this.generateChart();
            })
            .catch((error) => {
                console.error("Error al obtener datos de la API:", error);
            });
    },
    methods: {
        generateChart() {
            const saldosPositivos = this.resultados.filter(resu => parseFloat(resu['transacciones_bancos.saldo']) >= 0);
            const saldosNegativos = this.resultados.filter(resu => parseFloat(resu['transacciones_bancos.saldo']) < 0);

            const bancosPositivos = saldosPositivos.map(resu => resu['cuentas.banco']);
            const bancosNegativos = saldosNegativos.map(resu => resu['cuentas.banco']);

            const saldosDataPositivos = saldosPositivos.map(resu => resu['transacciones_bancos.saldo']);
            const saldosDataNegativos = saldosNegativos.map(resu => resu['transacciones_bancos.saldo']);

            const ctxPositive = document.getElementById('myChartPositive');
            new Chart(ctxPositive, {
                type: 'line',
                data: {
                    labels: bancosPositivos,
                    datasets: [{
                        label: 'Saldo Positivo',
                        data: saldosDataPositivos,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            const ctxNegative = document.getElementById('myChartNegative');
            new Chart(ctxNegative, {
                type: 'line',
                data: {
                    labels: bancosNegativos,
                    datasets: [{
                        label: 'Saldo Negativo',
                        data: saldosDataNegativos,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },
        downloadPDF() {
            const pdfOptions = {
                orientation: "portrait",
                unit: "mm",
                format: "letter",
            };

            const doc = new jsPDF(pdfOptions);

            // Convert HTML content to PDF using html2pdf
            // const contentHtml = this.$el.outerHTML; // Comentado porque no se usa
            html2canvas(this.$el, { scale: 3 })  // Captura la representación de la tabla como imagen
                .then(canvas => {
                    const tableImg = canvas.toDataURL('image/png');

                    // Agregar la tabla al PDF
                    const tableWidth = 200; // Ajusta el ancho de la tabla
                    const tableHeight = 100; // Ajusta la altura de la tabla
                    doc.addImage(tableImg, 'PNG', 10, 20, tableWidth, tableHeight);

                    // Agregar los gráficos al PDF
                    //const chartWidth = 10; // Ajusta el ancho del gráfico
                    //const chartHeight = 10; // Ajusta la altura del gráfico

                    // Guarda el documento PDF con todos los elementos
                    doc.save('informe_financiero.pdf');
                })
                .catch(error => {
                    console.error('Error al capturar la representación gráfica de la tabla:', error);
                });
        },
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

td:first-child {
    /* Establece el ancho de la primera columna */
    width: 300px;  /* Ajusta este valor según tus necesidades */
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
</style>
