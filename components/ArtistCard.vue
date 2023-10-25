<template>
  <NuxtLink :to="`/artist/${id}`">
    <v-card>
      <v-card-title>{{ name }}</v-card-title>
    </v-card></NuxtLink
  >
</template>

<style scoped>
.v-card {
  @apply border border-gray-100 shadow hover:bg-gray-100;
}

.v-card-title {
  @apply line-clamp-1 whitespace-normal text-base leading-4 tracking-tight;
}
</style>

<script setup lang="ts">
defineProps(["id", "name", "releasesCount"]);
</script>
