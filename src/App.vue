<template>
  <nav>
    <router-link to="/">Opcion1</router-link> |
    <router-link to="/about">Reporte1</router-link>|
    <router-link to="/reporte1">Productos</router-link>|
    <router-link to="/reporte2">Bancos</router-link>|
    <router-link to="/reporte3">Saldos Proveedores</router-link>|
    <router-link to="/reporte4">Cortes</router-link>|
    <router-link to="/reporte5">Clientes por Cobrar</router-link>|
    <router-link to="/reporte6">VentasPeriodoT</router-link>|
    <router-link to="/reporte7">Inv Diario</router-link>|
    <router-link to="/reporte8">Reporte9</router-link>|
    <router-link to="/reporte9">DESGLOSE</router-link>|
    <router-link to="/reporte10">Reporte Gastos</router-link>|
    <router-link to="/reporte11">Reembolsos</router-link>|
    <router-link to="/reporte12">Reporte Turnos</router-link>|
    <router-link to="/desglose">Reporte Desglose</router-link>|
  </nav>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #121416;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
