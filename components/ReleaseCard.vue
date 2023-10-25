<template>
  <v-dialog v-model="dialog" max-width="800" transition="scroll-x-transition">
    <template v-slot:activator="{ props }">
      <button v-bind="props">
        <v-card class="release-card">
          <ReleaseImage
            :url="
              data.has_screenshot
                ? `${supabaseUrl}/storage/v1/object/public/releases/${data.id}/screenshot.png`
                : `/no_screenshot.gif`
            "
          />

          <v-card-title>{{ data.name }}</v-card-title>
        </v-card>
      </button>
    </template>

    <v-card class="rounded-xl">
      <v-card-text class="mb-4 space-y-5">
        <div class="flex items-center justify-end gap-5">
          <v-btn
            v-if="user"
            :to="`/release/${data.id}/edit`"
            :icon="mdiPencil"
            size="small"
          />
          <v-btn
            variant="plain"
            :icon="mdiClose"
            density="compact"
            @click="dialog = false"
          />
        </div>

        <h2 class="mt-0 text-center text-3xl tracking-tight">
          {{ data.name }}
        </h2>

        <div class="grid gap-6 sm:grid-cols-2">
          <ReleaseImage
            size="lg"
            :src="
              data.has_screenshot
                ? `${supabaseUrl}/storage/v1/object/public/releases/${data.id}/screenshot.png`
                : `/no_screenshot.gif`
            "
          />

          <div class="space-y-4 text-center">
            <div>
              <p>
                Released: {{ data.release_day }} {{ release_month }}
                {{ data.release_year }}
                {{ !data.release_year && !data.release_month ? "N/A" : "" }}
              </p>

              <p>Type: {{ data.graphics_type ?? "N/A" }}</p>
            </div>

            <div>
              <ul>
                <li>
                  <a
                    :href="`https://csdb.dk/release/?id=${data.id}`"
                    target="_blank"
                    class="inline-flex items-center justify-center gap-1"
                    >CSDb <v-icon :icon="mdiOpenInNew" size="x-small"
                  /></a>
                </li>
                <li v-for="(link, idx) in data.external_links" :key="idx">
                  <a
                    :href="link.url"
                    target="_blank"
                    class="inline-flex items-center justify-center gap-1"
                    >{{ link.title }}
                    <v-icon :icon="mdiOpenInNew" size="x-small"
                  /></a>
                </li>
              </ul>
            </div>

            <div class="flex justify-center gap-2">
              <v-btn
                icon
                :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  `${productionUrl}/release/${data.id}`,
                )}`"
                target="_blank"
                variant="text"
                aria-label="share on X (Twitter)"
              >
                <v-icon :icon="mdiTwitter"></v-icon>
              </v-btn>

              <v-btn
                icon
                :href="`https://www.facebook.com/sharer.php?u=${encodeURIComponent(
                  `${productionUrl}/release/${data.id}`,
                )}`"
                target="_blank"
                variant="text"
                aria-label="share on Facebook"
              >
                <v-icon :icon="mdiFacebook"></v-icon>
              </v-btn>

              <v-btn
                v-if="data.has_screenshot"
                icon
                @click="downloadImage(supabaseUrl, data.id)"
                variant="text"
                aria-label="Download image"
              >
                <v-icon :icon="mdiImage"></v-icon>
              </v-btn>
            </div>

            <div>
              <h2 v-if="artists?.length" class="text-lg">Artists</h2>

              <div class="flex flex-wrap justify-center gap-6">
                <ArtistCard
                  v-for="artist in artists"
                  :key="artist.id"
                  :id="artist.id"
                  :name="artist.name"
                  :releasesCount="artist.releasesCount"
                />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.release-card {
  @apply origin-top rounded-xl shadow transition hover:-translate-y-2 hover:shadow-md;
}

.v-card-title {
  @apply text-lg tracking-tight;
}
</style>

<script setup lang="ts">
import { downloadImage } from "~/src/utils";
import {
  mdiPencil,
  mdiClose,
  mdiOpenInNew,
  mdiTwitter,
  mdiFacebook,
  mdiImage,
} from "@mdi/js";

const dialog = ref(false);

defineProps([
  "data",
  "artists",
  "release_month",
  "supabaseUrl",
  "user",
  "productionUrl",
]);
</script>
