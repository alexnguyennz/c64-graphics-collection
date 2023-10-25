<template>
  <div class="flex flex-col gap-10">
    <img
      class="mx-auto"
      src="/commodore-64-keyboard.png"
      width="500"
      height="156"
      alt="Commodore 64 keyboard"
      fetchpriority="high"
      loading="eager"
    />

    <v-tabs v-model="tab" align-tabs="center" :stacked="true" :grow="true">
      <v-tab value="releases">
        <v-icon :icon="mdiFloppy"></v-icon>
        <span class="text-lg normal-case tracking-normal">Releases</span>
      </v-tab>

      <v-tab value="artists">
        <v-icon :icon="mdiAccount"></v-icon>
        <span class="text-lg normal-case tracking-normal">Artists</span>
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="releases" class="m-1 flex flex-col gap-4">
        <h2>Featured Releases</h2>

        <CardGrid
          ><ReleaseCard
            v-for="release in data?.featuredReleases"
            :key="release.id!"
            :data="release"
            :release_month="dayjs(release.release_month, 'MM').format('MMMM')"
            :artists="release.artists ? [release.artists] : []"
            :supabaseUrl="supabaseUrl"
            :user="user"
            :productionUrl="productionUrl"
        /></CardGrid>

        <h2 class="mt-6">Latest Releases</h2>

        <CardGrid
          ><ReleaseCard
            v-for="release in data?.latestReleases"
            :key="release.id"
            :data="release"
            :release_month="dayjs(release.release_month, 'MM').format('MMMM')"
            :artists="release.artists"
            :supabaseUrl="supabaseUrl"
            :user="user"
            :productionUrl="productionUrl" /></CardGrid
      ></v-window-item>
      <v-window-item value="artists" class="m-1 flex flex-col gap-4">
        <h2>Featured Artists</h2>

        <ArtistGrid
          ><ArtistCard
            v-for="artist in data?.featuredArtists"
            :key="artist.id!"
            :id="artist.id"
            :name="artist.name"
            :releasesCount="artist.releasescount"
        /></ArtistGrid>

        <h2 class="mt-6">Latest Artists</h2>

        <ArtistGrid
          ><ArtistCard
            v-for="artist in data?.latestArtists"
            :key="artist.id"
            :id="artist.id"
            :name="artist.name"
            :releasesCount="artist.releasesCount[0].count" /></ArtistGrid
      ></v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { mdiFloppy, mdiAccount } from "@mdi/js";
import dayjs from "dayjs";
import type { Database } from "~/src/types/supabase";

const {
  public: {
    title,
    supabase: { url: supabaseUrl },
    productionUrl,
  },
} = useRuntimeConfig();

const supabase = useSupabaseClient<Database>();

const user = useSupabaseUser();

const pageSize = ref(8);
const tab = ref("ReleasesArtists");

const { data } = await useAsyncData(
  "index",
  async () => {
    const [featuredReleases, latestReleases, featuredArtists, latestArtists] =
      await Promise.allSettled([
        supabase.from("get_featured_releases").select(),
        supabase
          .from("releases")
          .select("*, artists:artists(*)")
          .limit(pageSize.value)
          .order("id", { ascending: false }),
        supabase.from("get_featured_artists").select(),
        supabase
          .from("artists")
          .select("*, releasesCount:releases(count)")
          .limit(pageSize.value)
          .order("id", { ascending: false }),
      ]);

    return {
      featuredReleases: featuredReleases.value.data,
      latestReleases: latestReleases.value.data,
      featuredArtists: featuredArtists.value.data,
      latestArtists: latestArtists.value.data,
    };
  },
  { deep: false },
);

useSeoMeta({
  title: `Home - ${title}`,
  description: `Home page - ${title}`,
});

useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: "/commodore-64-keyboard.png",
    },
  ],
});
</script>
