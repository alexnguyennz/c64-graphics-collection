<template>
  <div>
    <v-app>
      <v-app-bar color="black" :elevation="0">
        <div class="drawer-toggle ml-3">
          <v-btn
            @click.stop="drawer = !drawer"
            variant="text"
            :icon="mdiClose"
            aria-label="Open drawer"
            ><v-icon v-show="drawer" :icon="mdiClose"></v-icon
            ><v-icon v-show="!drawer" :icon="mdiMenu"></v-icon
          ></v-btn>
        </div>

        <v-toolbar-title
          ><NuxtLink to="/">
            C64 Graphics Collection
          </NuxtLink></v-toolbar-title
        >
      </v-app-bar>

      <v-navigation-drawer
        color="#334155"
        theme="dark"
        v-model="drawer"
        width="220"
      >
        <v-list open-strategy="single" aria-label="navigation list">
          <v-list-item :prepend-icon="mdiMagnify" value="search" to="/search"
            ><v-list-item-title>Search</v-list-item-title></v-list-item
          >

          <v-list-group
            value="releases"
            :expand-icon="mdiArrowDownThin"
            :collapse-icon="mdiArrowUpThin"
          >
            <template v-slot:activator="{ props }">
              <v-list-item :prepend-icon="mdiFloppy" v-bind="props"
                ><v-list-item-title>Releases</v-list-item-title></v-list-item
              >
            </template>

            <div class="list-group">
              <v-list-item
                v-for="letter in releases"
                :key="`${letter}-release`"
                :value="`${letter}-release`"
                :to="`/releases/${letter.toLowerCase()}`"
              >
                {{ letter }}
              </v-list-item>
            </div>
          </v-list-group>

          <v-list-group
            value="artists"
            :expand-icon="mdiArrowDownThin"
            :collapse-icon="mdiArrowUpThin"
          >
            <template v-slot:activator="{ props }">
              <v-list-item :prepend-icon="mdiAccount" v-bind="props"
                ><v-list-item-title>Artists</v-list-item-title></v-list-item
              >
            </template>

            <div class="list-group">
              <v-list-item
                v-for="letter in artists"
                :key="`${letter}-artist`"
                :value="`${letter}-artist`"
                :to="`/artists/${letter.toLowerCase()}`"
              >
                {{ letter }}
              </v-list-item>
            </div>
          </v-list-group>

          <v-list-item
            :prepend-icon="mdiDownload"
            value="downloads"
            to="/downloads"
            ><v-list-item-title>Downloads</v-list-item-title></v-list-item
          >

          <v-list-group
            v-if="user"
            value="admin"
            :expand-icon="mdiArrowDownThin"
            :collapse-icon="mdiArrowUpThin"
          >
            <template v-slot:activator="{ props }">
              <v-list-item :prepend-icon="mdiCog" v-bind="props"
                ><v-list-item-title>Admin</v-list-item-title></v-list-item
              >
            </template>

            <div class="list-group">
              <v-list-item to="/release/new" :prepend-icon="mdiPlus">
                Release
              </v-list-item>
              <v-list-item to="/artist/new" :prepend-icon="mdiPlus">
                Artist
              </v-list-item>
              <v-list-item
                v-if="user"
                @click="signOut()"
                :prepend-icon="mdiLogout"
                >Log Out</v-list-item
              >
            </div>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <div class="my-10 p-5"><slot /></div>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>
.v-app-bar {
  background: #1e293b !important;
  color: #f1f5f9 !important;
}

.v-toolbar-title {
  @apply text-2xl font-semibold;
}

.v-list {
  @apply pt-0;
}

.v-main {
  @apply container mx-auto mt-20;
}

.v-app-bar-nav-icon {
  @apply md:hidden;
}

.drawer-toggle {
  @apply lg:hidden;
}

.v-text-field {
  @apply rounded-none;
}

.footer span {
  @apply flex w-full justify-center;
}

.v-img {
  @apply mx-auto;
}

.v-list-item-title {
  @apply text-base;
}

.list-group {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: auto;
  scrollbar-color: #ebebeb #ffffff;
}

.list-group::-webkit-scrollbar {
  width: 8px;
}

.list-group::-webkit-scrollbar-thumb {
  background-color: #ebebeb;
}

.v-toolbar-title {
  text-shadow: 2px 1px #a1683c;
}
</style>

<script lang="ts">
import {
  mdiClose,
  mdiMenu,
  mdiMagnify,
  mdiAccount,
  mdiCog,
  mdiDownload,
  mdiPlus,
  mdiLogout,
  mdiEmail,
  mdiInformation,
} from "@mdi/js";

export default {
  data: () => ({
    drawer: null, // change to false on production
    releases: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    artists: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  }),
};
</script>

<script setup lang="ts">
import {
  mdiArrowDownThick,
  mdiArrowDownThin,
  mdiArrowUpThin,
  mdiFloppy,
} from "@mdi/js";

const { auth } = useSupabaseClient();
const user = useSupabaseUser();

async function signOut() {
  await auth.signOut();

  await navigateTo("/");
}
</script>
