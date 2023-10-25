export async function downloadImage(supabaseUrl: string, id: string) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/public/releases/${id}/screenshot.png`,
  );

  const blobImage = await response.blob();

  const href = URL.createObjectURL(blobImage);

  const anchorElement = document.createElement("a");
  anchorElement.href = href;
  anchorElement.download = `${id}.png`;

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
}
