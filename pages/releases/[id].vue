<template>
  <div class="space-y-10 text-center">
    <h1>Releases - {{ String(id).toUpperCase() }}</h1>

    <CardGrid>
      <ReleaseCard
        v-for="release in releases.data"
        :key="release.id"
        :data="release"
        :release_month="dayjs(release.release_month, 'MM').format('MMMM')"
        :artists="release.artists"
        :supabaseUrl="supabaseUrl"
        :user="user"
        :productionUrl="productionUrl"
      />
    </CardGrid>

    <v-lazy :options="{ threshold: 0.5 }" transition="fade-transition">
      <v-pagination
        v-model="currentPage"
        v-if="releases.data.length > 0"
        :length="totalPages"
      ></v-pagination
    ></v-lazy>
  </div>
</template>

<script setup lang="ts">
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
  params: { id },
} = useRoute();

const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(100);

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const { data: releases } = await useAsyncData(
  `${id}Artists`,
  async () => {
    const { data, count } = await supabase
      .from("releases")
      .select("*", { count: "exact" })
      .ilike("name", `${id}%`)
      .limit(pageSize.value)
      .range(
        pageSize.value * (currentPage.value - 1),
        pageSize.value * currentPage.value - 1,
      );

    return { data, count };
  },
  { default: () => [], watch: [currentPage], deep: false },
);

totalPages.value = Math.ceil(releases?.value?.count! / pageSize.value);

useSeoMeta({
  title: `Releases - ${String(id).toUpperCase()} - ${title}`,
  description: `${String(id).toUpperCase()} releases page for ${title}`,
});
</script>
