<template>
  <div>
    <p>Holaaaaaaasssdddd</p>
  
    <div class="chart-container">
      <canvas ref="barChart"></canvas>
      <canvas ref="pieChart"></canvas>
      <canvas ref="scatterChart"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },


  mounted() {
    this.renderCharts();
  },
  methods: {
    goToComponent() {
      this.$router.push({ name: 'ejemplo2' }) // Asegúrate de que 'ejemplo2' esté registrado en tu router
    },

    renderCharts() {
      const barCtx = this.$refs.barChart.getContext('2d');
      new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
        }
      });

      const pieCtx = this.$refs.pieChart.getContext('2d');
      new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: 'VENTAS POR MES',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
        }
      });

      const scatterCtx = this.$refs.scatterChart.getContext('2d');
      new Chart(scatterCtx, {
        type: 'line',
        data: {
          labels: ['enero','febrero','marzo','abril','mayo','junio'],
          datasets: [{
            label: 'Ventas',
            data: [1800, 1900, 300, 500, 2000, 3000],
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.1
          },
          {
            label: 'Compras',
            data: [1000, 500, 1000, 2000, 1500, 1000],
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.1

          },
          
        
        
        ]
        },
        title: {
          display: true,
          text: 'Chart.js Line Chart'

        },
        
        options: {
          responsive: true,
          maintainAspectRatio: true,
        }
      });
    }
  }
};
</script>

<style scoped>


.chart-container {
  display: flex;
  justify-content: space-around;
  max-width: 600px; /* Puedes ajustar este valor según tus necesidades */
  margin: 0 auto
}
</style>

