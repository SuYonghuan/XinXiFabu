<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="name"></use>
  </svg>
</template>

<script>
export default {
  props: ["name"],
};
</script>

<style></style>
