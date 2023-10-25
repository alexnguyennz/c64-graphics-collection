<template>
  <div>
    <v-form
      v-model="formValid"
      @submit.prevent="handleSubmit"
      class="mx-auto max-w-md space-y-3"
    >
      <h1 class="text-center">Add New Artist</h1>
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
        v-model="form.country"
        density="compact"
        variant="solo"
        label="Country"
        :items="Object.keys(countries)"
      ></v-select>

      <v-combobox
        v-model="form.releases"
        clearable
        chips
        multiple
        :append-inner-icon="mdiPlus"
        density="compact"
        variant="solo"
        label="Release ID(s)"
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
          >Create</v-btn
        >
      </div>
    </v-form>

    <v-snackbar v-model="snackbar" :timeout="3000">
      Error occurred. Check IDs used - artist ID can't be in use and release
      ID(s) must exist.
    </v-snackbar>
  </div>
</template>

<script setup>
import { mdiPlus, mdiImageEdit, mdiCheck } from "@mdi/js";

import { countries } from "~/src/countries";

const {
  public: { title },
} = useRuntimeConfig();

const supabase = useSupabaseClient();

const loading = ref(false);
const snackbar = ref(false);
const previewImage = ref(null);

const form = ref({});
const formValid = ref(false);
const requiredRule = ref([(value) => (value ? true : "Required.")]);

async function handleSubmit() {
  if (!formValid.value) return;

  loading.value = true;

  const { id, name, country, releases, image } = form.value;

  if (image) await insertImage(image);

  const data = await insertArtist(id, name, country);

  if (data) {
    if (releases) {
      const releasesData = await insertReleases(id, releases);

      if (releasesData) navigateTo(`/artist/${id}/`);
    } else {
      navigateTo(`/artist/${id}/`);
    }
  }

  loading.value = false;
}

async function insertArtist(id, name, country) {
  const { data, error } = await supabase
    .from("artists")
    .insert({
      id,
      name,
      country,
      ...(form.value.image && {
        has_avatar: true,
      }),
    })
    .select();

  if (error) snackbar.value = true;

  return data;
}

async function insertReleases(artist_id, releases) {
  const releaseCredits = releases.map((release_id) => {
    return {
      artist_id,
      release_id,
    };
  });

  const { data, error } = await supabase
    .from("artists_releases")
    .insert(releaseCredits)
    .select();

  if (error) snackbar.value = true;

  return data;
}

async function insertImage(image) {
  const { error } = await supabase.storage
    .from("artists")
    .upload(`${form.value.id}/screenshot.png`, image[0], {
      contentType: image[0].type,
      upsert: true,
    });

  if (error) snackbar.value = true;
}

function displayImage() {
  form.value.image[0]
    ? (previewImage.value = URL.createObjectURL(form.value.image[0]))
    : (previewImage.value = null);
}

useSeoMeta({
  title: `New Artist - ${title}`,
  ogTitle: `New Artist - ${title}`,
  description: `new artist page for ${title}`,
  ogDescription: `new artist page for ${title}`,
});

definePageMeta({
  middleware: "auth",
});
</script>
