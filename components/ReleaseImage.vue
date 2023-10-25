<template>
  <v-img
    :min-height="size === 'lg' ? 300 : 200"
    :max-width="500"
    class="release-img bg-black"
    :alt="`${name} release screenshot`"
    :src="url"
  >
    <template v-slot:placeholder>
      <div class="flex h-full items-center justify-center">
        <v-progress-circular
          color="dark-blue"
          indeterminate
          :width="5"
        ></v-progress-circular></div
    ></template>
    <template v-slot:error>
      <v-img
        src="/no_screenshot.gif"
        width="384"
        height="272"
        alt="No screenshot"
        class="mx-auto"
      ></v-img>
    </template>
  </v-img>
</template>

<script setup lang="ts">
defineProps(["name", "url", "size"]);
</script>
