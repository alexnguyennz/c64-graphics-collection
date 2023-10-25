import { serverSupabaseClient } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase.storage
    .from("packs")
    .createSignedUrl("artists.zip", 15);

  if (error) {
    throw createError({ statusMessage: error.message });
  }

  return data;
});
