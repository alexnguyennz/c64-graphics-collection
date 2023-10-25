<template>
  <div class="space-y-10 text-center">
    <div class="flex justify-center">
      <v-breadcrumbs :items="breadcrumbs" density="compact"
        ><template v-slot:divider>
          <v-icon :icon="mdiArrowRightThin"></v-icon></template
      ></v-breadcrumbs>
    </div>
    <h1>
      <v-btn
        v-if="user"
        :to="`/artist/${artist.id}/edit`"
        :icon="mdiPencil"
        size="x-small"
        class="mr-2"
      />{{ artist.name }}
    </h1>

    <v-img
      :max-width="192"
      :max-height="192"
      class="mx-auto"
      :alt="`${artist.name} artist screenshot`"
      :src="
        artist.has_avatar
          ? `${supabaseUrl}/storage/v1/object/public/artists/${artist.id}/screenshot.png`
          : `/avatar.svg`
      "
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center fill-height justify-center">
          <v-progress-circular
            color="dark-blue"
            indeterminate
            :width="5"
          ></v-progress-circular></div
      ></template>
      <template v-slot:error>
        <v-img
          src="/avatar.svg"
          width="256"
          height="256"
          alt="No avatar placeholder"
        ></v-img></template
    ></v-img>

    <div v-if="artist.country">
      <span class="flex items-center justify-center gap-2"
        ><i
          :class="`em em-flag-${countries[artist.country]?.toLowerCase()}`"
          :aria-label="artist.country"
        ></i>
        {{ artist.country }}</span
      >
    </div>

    <h2 class="text-xl">Releases</h2>

    <CardGrid>
      <ReleaseCard
        v-for="release in artist.releases"
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
        v-if="artist.releases.length > 0"
        :length="totalPages"
      ></v-pagination
    ></v-lazy>
  </div>
</template>

<script setup lang="ts">
import { mdiArrowRightThin, mdiPencil } from "@mdi/js";
import "~/assets/emoji.css";
import dayjs from "dayjs";
import { countries } from "~/src/countries";
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

const {
  params: { id },
} = useRoute();

const breadcrumbs = ref<{ title: string; to: string }[]>([]);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(100);

const { data: artist } = await useAsyncData(
  `${id}Artist`,
  async () => {
    const { data } = await supabase
      .from("artists")
      .select(
        "*, releases:releases(*, artists(*)), releasesCount:releases(count)",
      )
      .eq("id", id)
      .range(
        pageSize.value * (currentPage.value - 1),
        pageSize.value * currentPage.value - 1,
        {
          foreignTable: "releases",
        },
      )
      .order("id", {
        // sort by ID first (assume higher ID = newer release) for tiebreaker with same dates
        foreignTable: "releases",
        ascending: false,
      })
      .order("release_year", {
        foreignTable: "releases",
        ascending: false,
        nullsFirst: false,
      })
      .order("release_month", {
        foreignTable: "releases",
        ascending: false,
        nullsFirst: false,
      })
      .order("release_day", {
        foreignTable: "releases",
        ascending: false,
        nullsFirst: false,
      })
      .maybeSingle();

    return data;
  },
  { watch: [currentPage] },
);

if (!artist.value)
  throw createError({ statusCode: 404, message: "Artist not found" });

totalPages.value = Math.ceil(
  artist.value.releasesCount[0].count / pageSize.value,
);

useSeoMeta({
  title: `${artist.value.name ?? id} - Artist - ${title}`,
  description: `${artist.value.name ?? id} artist page for ${title}`,
});

breadcrumbs.value = [
  {
    title: "Home",
    to: "/",
  },
  {
    title: `Artists - ${artist.value.name.charAt(0)}`,
    to: `/artists/${artist.value.name.charAt(0).toLowerCase()}`,
  },
  {
    title: artist.value.name,
    to: "",
  },
];
</script>
