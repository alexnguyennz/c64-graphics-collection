<template>
  <div>
    <h1>Login</h1>

    <v-form
      v-model="formValid"
      @submit.prevent="handleSubmit"
      class="mx-auto max-w-md space-y-3"
    >
      <v-text-field
        v-model="email"
        class="mx-auto w-full"
        density="compact"
        variant="solo"
        label="Email"
        :prepend-inner-icon="mdiEmailOutline"
        :rules="requiredRule"
        type="email"
      ></v-text-field>

      <v-text-field
        v-model="password"
        density="compact"
        variant="solo"
        label="Password"
        :prepend-inner-icon="mdiLockOutline"
        :append-inner-icon="showPassword ? mdiEye : mdiEyeOff"
        @click:append-inner="showPassword = !showPassword"
        :rules="requiredRule"
        :type="showPassword ? 'text' : 'password'"
      ></v-text-field>

      <v-btn variant="outlined" :prepend-icon="mdiLogin" type="submit"
        >Login
      </v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import {
  mdiEmailOutline,
  mdiLockOutline,
  mdiEye,
  mdiEyeOff,
  mdiLogin,
} from "@mdi/js";

const {
  public: { title },
} = useRuntimeConfig();

const { auth } = useSupabaseClient();
const user = useSupabaseUser();
if (user.value) navigateTo("/");

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const formValid = ref(false);
const requiredRule = ref([(value: string) => (value ? true : "Required.")]);

async function handleSubmit() {
  if (!formValid.value) return;

  const { error } = await auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert(`Error occurred ${error}`);
  } else {
    await navigateTo("/");
  }
}

useSeoMeta({
  title: `Login - ${title}`,
  description: `Login page for ${title}`,
});
</script>
