<template>
  <div>
    <v-form
      v-model="formValid"
      @submit.prevent="handleSubmit"
      class="mx-auto max-w-md space-y-3"
    >
      <h1 class="text-center">
        <v-btn
          :to="`/artist/${artistData.id}/`"
          :icon="mdiArrowLeft"
          size="x-small"
          class="mr-2"
        />
        {{ artistData.name }}
      </h1>

      <v-img
        :max-width="384"
        :max-height="271"
        min-height="150"
        class="mx-auto transition-all duration-300"
        :src="`${supabaseUrl}/storage/v1/object/public/artists/${artistData.id}/screenshot.png`"
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
            width="384"
            height="272"
            alt="No avatar placeholder"
          ></v-img></template
      ></v-img>

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
          >Update</v-btn
        >
        <v-btn
          @click="resetArtistValues"
          :prepend-icon="mdiClose"
          color="red"
          :disabled="loading"
          >Reset</v-btn
        >
        <v-btn
          @click="deleteArtist"
          :prepend-icon="mdiDelete"
          :disabled="loading"
          >Delete</v-btn
        >
      </div>
    </v-form>

    <v-snackbar v-model="snackbar" :timeout="3000">
      Error occurred. Check IDs used.
    </v-snackbar>
  </div>
</template>

<script setup>
import {
  mdiArrowLeft,
  mdiDelete,
  mdiPlus,
  mdiImageEdit,
  mdiCheck,
  mdiClose,
} from "@mdi/js";

import { countries } from "~/src/countries";

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
const previewImage = ref(null);

const form = ref({});
const formValid = ref(false);
const requiredRule = ref([(value) => (value ? true : "Required.")]);

const { data: artistData } = await useAsyncData(`${id}Artist`, async () => {
  const { data } = await supabase
    .from("artists")
    .select("*, releases:releases(*)")
    .eq("id", id)
    .maybeSingle();

  return data;
});

const releaseIds = artistData.value.releases.map((release) => release.id);

form.value = { ...artistData.value, releases: releaseIds };

async function handleSubmit() {
  if (!formValid.value) return;

  loading.value = true;

  const { id, name, country, releases, image } = form.value;

  if (image) await updateImage(image);

  const data = await updateArtist(name, country);

  if (data) {
    artistData.value = data; // update original data

    if (releases) {
      const releasesData = await updateReleases(id, releases);
    }
  }

  loading.value = false;
}

async function updateArtist(name, country) {
  const { data, error } = await supabase
    .from("artists")
    .update({
      name,
      country,
      ...(form.value.image && {
        has_avatar: true,
      }),
    })
    .eq("id", artistData.value.id)
    .select()
    .maybeSingle();

  if (error) snackbar.value = true;

  return data;
}

async function updateReleases(artist_id, releases) {
  const releaseCredits = releases.map((release_id) => {
    return {
      artist_id,
      release_id,
    };
  });

  // delete then insert relations, not possible to update directly with Supabase SDK
  await deleteReleaseRelations(artist_id);

  const { data, error } = await supabase
    .from("artists_releases")
    .insert(releaseCredits)
    .select();

  if (error) snackbar.value = true;

  return data;
}

async function deleteReleaseRelations(artist_id) {
  const { error } = await supabase
    .from("artists_releases")
    .delete()
    .eq("artist_id", artist_id);

  if (error) snackbar.value = true;
}

async function updateImage(image) {
  const { error } = await supabase.storage
    .from("artists")
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

function resetArtistValues() {
  form.value = { ...artistData.value, releases: releaseIds };
}

async function deleteArtist() {
  const deleteRelationsError = await deleteReleaseRelations(form.value.id);

  if (!deleteRelationsError) {
    const { error } = await supabase
      .from("artists")
      .delete()
      .eq("id", form.value.id);

    if (!error) navigateTo("/");
  }
}

useSeoMeta({
  title: `${id} - EDIT Artist - ${title}`,
  ogTitle: `${id} - EDIT Artist - ${title}`,
  description: `${id} edit artist page for ${title}`,
  ogDescription: `${id} edit artist page for ${title}`,
});

definePageMeta({
  middleware: "auth",
});
</script>
