<template>
  <div class="home">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <h1> Ejemplo de graficos con Chart.js</h1>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>

