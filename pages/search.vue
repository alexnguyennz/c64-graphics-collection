<template>
  <div>
    <h1>Search</h1>

    <v-form
      v-model="formValid"
      @submit.prevent="handleSubmit"
      class="flex flex-col items-center"
    >
      <v-text-field
        class="mx-auto w-full max-w-md"
        v-model="inputValue"
        :loading="loading"
        density="compact"
        variant="solo"
        label="Keyword(s)"
        :clearable="true"
        :append-inner-icon="mdiMagnify"
        @click:append-inner="handleSubmit"
      ></v-text-field>

      <v-no-ssr>
        <v-btn-toggle
          v-model="filter"
          mandatory
          :multiple="true"
          color="black"
          rounded="xl"
        >
          <v-btn :prepend-icon="mdiFloppy" value="releases">Releases</v-btn>
          <v-btn :prepend-icon="mdiAccount" value="artists">Artists</v-btn>
        </v-btn-toggle></v-no-ssr
      >
    </v-form>

    <v-no-ssr>
      <div v-if="!loading" class="my-4 text-center text-xl">
        <p v-if="results?.artists.length > 0">
          {{ results?.artists.length }} artist<span
            v-if="results?.artists.length > 1"
            >s</span
          >
          found
        </p>
      </div>
      <ArtistGrid>
        <ArtistCard
          v-for="artist in results.artists"
          :key="artist.id"
          :id="artist.id"
          :name="artist.name"
        />
      </ArtistGrid>

      <div v-if="!loading" class="my-4 text-center text-xl">
        <p v-if="results?.releases.length > 0">
          {{ results?.releases.length }} release<span
            v-if="results?.releases.length > 1"
            >s</span
          >
          found
        </p>
      </div>
      <CardGrid>
        <ReleaseCard
          v-for="release in results.releases"
          :key="release.id"
          :data="release"
          :release_month="dayjs(release.release_month, 'MM').format('MMMM')"
          :artists="release.artists"
          :supabaseUrl="supabaseUrl"
          :user="user"
          :productionUrl="productionUrl"
        /> </CardGrid
    ></v-no-ssr>
  </div>
</template>

<script setup lang="ts">
import type { LocationQueryValue } from "vue-router";

import { mdiMagnify, mdiAccount, mdiFloppy } from "@mdi/js";
import type { Database } from "~/src/types/supabase";
import dayjs from "dayjs";

const {
  public: {
    title,
    supabase: { url: supabaseUrl },
    productionUrl,
  },
} = useRuntimeConfig();

const {
  query: { q },
} = useRoute();
const router = useRouter();

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const filter = ref(["releases", "artists"]);

const formValid = ref(false);
const inputValue = ref(q);

const results = ref({
  artists: [],
  releases: [],
});

const { data } = await useAsyncData("search", async () => {
  if (q) return await search(q, filter.value);
});

if (data.value) results.value = data.value;

async function handleSubmit() {
  if (!formValid.value) return;

  results.value = {
    artists: [],
    releases: [],
  };
  loading.value = true;

  await router.push({
    path: "/search",
    query: { q: inputValue.value },
  });

  results.value = await search(inputValue.value, filter.value);

  loading.value = false;
}

async function search(
  query: LocationQueryValue | LocationQueryValue[],
  filter: string[],
) {
  let data = {
    artists: [],
    releases: [],
  };

  filter.sort(); // sort in case releases/artists are toggled and out of order

  if (filter.length > 1) {
    data[filter[0]] = (
      await supabase
        .from(filter[0])
        .select()
        .ilike("name", `%${query}%`)
        .limit(100)
    ).data;

    data[filter[1]] = (
      await supabase
        .from(filter[1])
        .select()
        .ilike("name", `%${query}%`)
        .limit(100)
    ).data;
  } else {
    data[filter[0]] = (
      await supabase
        .from(filter[0])
        .select()
        .ilike("name", `%${query}%`)
        .limit(100)
    ).data;
  }

  return data;
}

useSeoMeta({
  title: `Search - ${title}`,
  description: `Search page for ${title}`,
});
</script>
