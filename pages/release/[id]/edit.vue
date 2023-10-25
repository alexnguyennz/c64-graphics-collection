<template>
  <div>
    <v-form
      v-model="formValid"
      @submit.prevent="handleSubmit"
      class="mx-auto max-w-md space-y-3"
    >
      <h1 class="text-center">
        {{ releaseData.name }}
      </h1>

      <ReleaseImage
        :url="
          releaseData.has_screenshot
            ? `${supabaseUrl}/storage/v1/object/public/releases/${releaseData.id}/screenshot.png`
            : `/no_screenshot.gif`
        "
      />

      <div class="flex gap-5">
        <v-text-field
          v-model="form.id"
          :rules="requiredRule"
          class="mx-auto w-32 w-full"
          density="compact"
          variant="solo"
          label="ID"
          type="number"
        ></v-text-field>

        <v-text-field
          v-model="form.name"
          :rules="requiredRule"
          class="mx-auto w-full"
          density="compact"
          variant="solo"
          label="Name"
          type="text"
        ></v-text-field>
      </div>

      <v-select
        v-model="form.graphics_type"
        density="compact"
        variant="solo"
        label="Graphics Type"
        :items="graphicsTypes"
      ></v-select>

      <div class="grid gap-5 sm:grid-cols-3">
        <v-select
          v-model="form.release_day"
          density="compact"
          variant="solo"
          label="Day"
          :items="Array.from({ length: 31 }, (_, index) => index + 1)"
        />

        <v-select
          v-model="form.release_month"
          density="compact"
          variant="solo"
          label="Month"
          :items="months"
        ></v-select>

        <v-text-field
          v-model="form.release_year"
          class="mx-auto w-full"
          density="compact"
          variant="solo"
          label="Year"
          type="text"
        ></v-text-field>
      </div>

      <div>
        <h2 class="text-center">External Links</h2>

        <ul class="my-3">
          <li
            v-for="(element, index) in form.external_links"
            :key="index"
            class="flex items-center justify-center gap-2"
          >
            <a
              :href="element.url"
              target="_blank"
              rel="noreferrer noopener nofollow"
              >{{ element.title }}</a
            >

            <v-btn
              @click="deleteExternalLink(index)"
              variant="text"
              :icon="mdiDelete"
              color="red-lighten-2"
            ></v-btn>
          </li>
        </ul>

        <div class="flex items-start gap-5">
          <v-text-field
            v-model="external_title"
            class="mx-auto w-full"
            density="compact"
            variant="solo"
            label="Title"
            type="text"
          ></v-text-field>

          <v-text-field
            v-model="external_url"
            class="mx-auto w-full"
            density="compact"
            variant="solo"
            label="URL"
            type="url"
          ></v-text-field>
          <v-btn
            @click="addExternalLink"
            :icon="mdiPlus"
            :disabled="!(!!external_title?.length && !!external_url?.length)"
          ></v-btn>
        </div>
      </div>

      <v-combobox
        v-model="form.artists"
        clearable
        chips
        multiple
        :append-inner-icon="mdiPlus"
        density="compact"
        variant="solo"
        label="Artist ID(s)"
      ></v-combobox>

      <v-file-input
        v-model="form.image"
        density="compact"
        variant="solo"
        label="Screenshot"
        accept="image/*"
        :prepend-icon="null"
        :append-inner-icon="mdiImageEdit"
        @change="displayImage"
        @click:clear="displayImage"
      ></v-file-input>

      <v-img
        v-if="previewImage"
        :src="previewImage"
        class="release-img mx-auto transition-all duration-300"
      ></v-img>

      <div class="flex justify-center gap-5">
        <v-btn
          type="submit"
          :prepend-icon="mdiCheck"
          color="green"
          :loading="loading"
          >Update</v-btn
        >
        <v-btn
          @click="resetReleaseValues"
          :prepend-icon="mdiClose"
          color="red"
          :disabled="loading"
          >Reset</v-btn
        >
        <v-btn
          @click="deleteRelease"
          :prepend-icon="mdiDelete"
          :disabled="loading"
          >Delete</v-btn
        >
      </div>
    </v-form>

    <v-snackbar v-model="snackbar" :timeout="3000">
      Error occurred. Check IDs used - release ID can't be in use and artist
      ID(s) must exist.
    </v-snackbar>
  </div>
</template>

<script setup>
import { mdiDelete, mdiPlus, mdiImageEdit, mdiCheck, mdiClose } from "@mdi/js";

import { graphicsTypes, months } from "~/src/data";

const {
  public: {
    title,
    supabase: { url: supabaseUrl },
  },
} = useRuntimeConfig();

const {
  params: { id },
} = useRoute();

const supabase = useSupabaseClient();

const loading = ref(false);
const snackbar = ref(false);
const external_title = ref("");
const external_url = ref("");
const previewImage = ref(null);

const form = ref({ external_links: [] });
const formValid = ref(false);
const requiredRule = ref([(value) => (value ? true : "Required.")]);

const { data: releaseData } = await useAsyncData(`${id}Release`, async () => {
  const { data } = await supabase
    .from("releases")
    .select("*, artists:artists(*)")
    .eq("id", id)
    .maybeSingle();

  return data;
});

const artistIds = releaseData.value.artists.map((artist) => artist.id);

form.value = { ...releaseData.value, artists: artistIds };

async function handleSubmit() {
  if (!formValid.value) return;

  loading.value = true;

  const {
    id,
    name,
    graphics_type,
    release_day,
    release_month,
    release_year,
    external_links,
    artists,
    image,
  } = form.value;

  if (image) await updateImage(image);

  const data = await updateRelease(
    name,
    graphics_type,
    release_day,
    release_month,
    release_year,
    external_links,
  );

  if (data) {
    releaseData.value = data; // update original data

    if (artists) {
      const artistsData = await updateArtists(id, artists);
    }
  }

  loading.value = false;
}

async function updateRelease(
  name,
  graphics_type,
  release_day,
  release_month,
  release_year,
  external_links,
) {
  const { data, error } = await supabase
    .from("releases")
    .update({
      name,
      graphics_type,
      release_day,
      release_month,
      release_year,
      external_links,
      ...(form.value.image && {
        has_screenshot: true,
      }),
    })
    .eq("id", releaseData.value.id)
    .select()
    .maybeSingle();

  if (error) snackbar.value = true;

  return data;
}

async function updateArtists(release_id, artists) {
  const artistCredits = artists.map((artist_id) => {
    return {
      release_id,
      artist_id,
    };
  });

  // delete then insert relations, not possible to update directly with Supabase SDK
  await deleteArtistRelations(release_id);

  const { data, error } = await supabase
    .from("artists_releases")
    .insert(artistCredits)
    .select();

  if (error) snackbar.value = true;

  return data;
}

function addExternalLink() {
  if (external_title.value && external_url.value) {
    form.value.external_links.push({
      title: external_title.value,
      url: addProtocol(external_url.value),
    });

    external_title.value = "";
    external_url.value = "";
  }
}

function deleteExternalLink(index) {
  form.value.external_links.splice(index, 1);
}

function addProtocol(url) {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "https://" + url;
  }
  return url;
}

async function updateImage(image) {
  const { error } = await supabase.storage
    .from("releases")
    .upload(`${form.value.id}/screenshot.png`, image[0], {
      contentType: image[0].type,
      upsert: true,
    });

  if (error) snackbar.value = true;

  return error;
}

function displayImage() {
  form.value.image[0]
    ? (previewImage.value = URL.createObjectURL(form.value.image[0]))
    : (previewImage.value = null);
}

function resetReleaseValues() {
  form.value = { ...releaseData.value, artists: artistIds };
}

async function deleteArtistRelations(release_id) {
  const { error } = await supabase
    .from("artists_releases")
    .delete()
    .eq("release_id", release_id);

  if (error) snackbar.value = true;
}

async function deleteRelease() {
  const deleteRelationsError = await deleteArtistRelations(form.value.id);

  if (!deleteRelationsError) {
    const { error } = await supabase
      .from("releases")
      .delete()
      .eq("id", form.value.id);

    if (!error) navigateTo("/");
  }
}

useSeoMeta({
  title: `${id} - EDIT Release - ${title}`,
  ogTitle: `${id} - EDIT Release - ${title}`,
  description: `${id} edit release page for ${title}`,
  ogDescription: `${id} edit release page for ${title}`,
});

definePageMeta({
  middleware: "auth",
});
</script>
