<template>
  <div class="space-y-10 text-center">
    <h1>Download Pack</h1>

    <div class="flex items-center justify-center gap-5">
      <v-btn
        variant="outlined"
        :prepend-icon="mdiDownload"
        :disabled="loading"
        :loading="loading"
        @click="getUrl"
        >Full Pack
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiDownload } from "@mdi/js";

const {
  public: { title },
} = useRuntimeConfig();

const loading = ref(false);

async function getUrl() {
  loading.value = true;

  const data = await $fetch("/api/getSignedUrl").catch((error) => error.data);
  window.open(data.signedUrl, "_blank", "noreferrer");

  loading.value = false;
}

useSeoMeta({
  title: `Download Pack - ${title}`,
  description: `Download Pack page for ${title}`,
});
</script>
