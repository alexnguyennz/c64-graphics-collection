<template>
  <div class="space-y-10 text-center">
    <div class="flex justify-center">
      <v-breadcrumbs :items="breadcrumbs" density="compact" divider="→"
        ><template v-slot:prepend>
          <v-btn
            variant="text"
            size="small"
            :icon="mdiHome"
            to="/"
          ></v-btn> </template
      ></v-breadcrumbs>
    </div>

    <h1>
      <v-btn
        v-if="user"
        :to="`/release/${release.id}/edit`"
        :icon="mdiPencil"
        size="x-small"
        class="mr-2"
      />
      {{ release.name }}
    </h1>

    <div class="grid gap-6 sm:grid-cols-2">
      <ReleaseImage
        size="lg"
        :src="
          release.has_screenshot
            ? `${supabaseUrl}/storage/v1/object/public/releases/${release.id}/screenshot.png`
            : `/no_screenshot.gif`
        "
      />

      <div class="space-y-4 text-center">
        <div>
          <p>Graphics Type: {{ release.graphics_type ?? "N/A" }}</p>

          <p>
            Release Date: {{ release.release_day }}
            {{ dayjs(release.release_month, "MM").format("MMMM") }}
            {{ release.release_year }}
            {{ !release.release_year && !release.release_month ? "N/A" : "" }}
          </p>
        </div>

        <div>
          <h3 class="underline">Related Links</h3>

          <ul>
            <li>
              <a
                :href="`https://csdb.dk/release/?id=${release.id}`"
                target="_blank"
                class="inline-flex items-center justify-center gap-1"
                >CSDb <v-icon :icon="mdiOpenInNew" size="sm"
              /></a>
            </li>
            <li v-for="(link, idx) in release.external_links" :key="idx">
              <a
                :href="link.url"
                target="_blank"
                class="inline-flex items-center justify-center gap-1"
                >{{ link.title }} <v-icon :icon="mdiOpenInNew" size="sm"
              /></a>
            </li>
          </ul>
        </div>

        <div class="flex justify-center gap-2">
          <v-btn
            icon
            :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              `${productionUrl}/release/${id}`,
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
              `${productionUrl}/release/${id}`,
            )}`"
            target="_blank"
            variant="text"
            aria-label="share on Facebook"
          >
            <v-icon :icon="mdiFacebook"></v-icon>
          </v-btn>

          <v-btn
            icon
            @click="downloadImage(supabaseUrl, id)"
            variant="text"
            aria-label="Download image"
          >
            <v-icon :icon="mdiImage"></v-icon>
          </v-btn>
        </div>

        <div>
          <h2 v-if="release.artists?.length" class="text-lg">Artists</h2>

          <ArtistGrid>
            <ArtistCard
              v-for="artist in release.artists"
              :key="artist.id"
              :id="artist.id"
              :name="artist.name"
              :releasesCount="artist.releasesCount"
            />
          </ArtistGrid>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  mdiHome,
  mdiPencil,
  mdiOpenInNew,
  mdiTwitter,
  mdiFacebook,
  mdiImage,
} from "@mdi/js";
import { downloadImage } from "~/src/utils";

import dayjs from "dayjs";

const {
  public: {
    title,
    supabase: { url: supabaseUrl },
    productionUrl,
  },
} = useRuntimeConfig();

const user = useSupabaseUser();

const {
  params: { id },
} = useRoute();

const breadcrumbs = ref([]);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(100);
const zoom = ref(false);

const { data: release } = await useAsyncData(
  `${id}Release`,
  async () => {
    const supabase = useSupabaseClient();

    const { data } = await supabase
      .from("releases")
      .select("*, artists:artists(*), artistsCount:artists(count)")
      .eq("id", id)
      .limit(pageSize.value)
      .range(
        pageSize.value * (currentPage.value - 1),
        pageSize.value * currentPage.value - 1,
        {
          foreignTable: "artists",
        },
      )
      .maybeSingle();

    console.log("data", data);

    if (!data.release_day && !data.release_month && !data.release_year) {
      data.no_date = "N/A";
    }

    return data;
  },
  { watch: [currentPage], deep: false },
);

totalPages.value = Math.ceil(
  release.value.artistsCount[0].count / pageSize.value,
);

useSeoMeta({
  title: `${release.value.name ?? id} - Release - ${title}`,
  ogTitle: `${release.value.name ?? id} - Release - ${title}`,
  description: `${release.value.name ?? id} - Release - ${title}`,
  ogDescription: `${release.value.name ?? id} Release - ${title}`,
  ogImage: release.value.has_screenshot
    ? `${supabaseUrl}/storage/v1/object/public/releases/${id}/screenshot.png`
    : `${productionUrl}/no_screenshot.gif`,
  twitterCard: "summary_large_image",
});

breadcrumbs.value = [
  {
    title: "",
    to: "/",
  },
  {
    title: `Releases - ${release.value.name.charAt(0)}`,
    to: `/releases/${release.value.name.charAt(0).toLowerCase()}`,
  },
  {
    title: release.value.name,
    to: "",
  },
];
</script>
