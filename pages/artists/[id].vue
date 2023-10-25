<template>
  <div class="space-y-10 text-center">
    <h1>Artists - {{ String(id).toUpperCase() }}</h1>

    <ArtistGrid>
      <ArtistCard
        v-for="artist in artists.data"
        :key="artist.id"
        :id="artist.id"
        :name="artist.name"
      />
    </ArtistGrid>

    <v-lazy :options="{ threshold: 0.5 }" transition="fade-transition">
      <v-pagination
        v-model="currentPage"
        v-if="artists.data.length > 0"
        :length="totalPages"
      ></v-pagination
    ></v-lazy>
  </div>
</template>

<script setup lang="ts">
const {
  public: { title },
} = useRuntimeConfig();
import type { Database } from "~/src/types/supabase";

const {
  params: { id },
} = useRoute();

const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(100);

const supabase = useSupabaseClient<Database>();

const { data: artists } = await useAsyncData(
  `${id}Artists`,
  async () => {
    const { data, count } = await supabase
      .from("artists")
      .select("*", { count: "exact" })
      .ilike("name", `${id}%`)
      .limit(pageSize.value)
      .range(
        pageSize.value * (currentPage.value - 1),
        pageSize.value * currentPage.value - 1,
      );

    // sort artists alphabetically
    data?.sort(({ name: aName }, { name: bName }) => {
      const nameA = aName.toLowerCase();
      const nameB = bName.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      return 0;
    });

    return { data, count };
  },
  { default: () => [], watch: [currentPage], deep: false },
);
if (!artists?.value?.data)
  throw createError({
    statusCode: 404,
    message: "A server or page error occurred. Please try again.",
  });

totalPages.value = Math.ceil(artists?.value?.count! / pageSize.value);

useSeoMeta({
  title: `Artists - ${String(id).toUpperCase()} - ${title}`,
  description: `${String(id).toUpperCase()} artists page for ${title}`,
});
</script>
