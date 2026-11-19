"use client";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads a profile image file through the WedPlan server, which forwards
 * it to ImgBB server-side (the ImgBB API key never reaches the browser).
 * Returns the hosted image URL.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be smaller than 5 MB");
  }

  const dataUrl = await readAsDataUrl(file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/uploads/image`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, fileName: file.name }),
    }
  );

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: { url?: string };
  } | null;

  if (!response.ok || !result?.success || !result.data?.url) {
    throw new Error(result?.message || "Failed to upload profile image");
  }

  return result.data.url;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () =>
      reject(new Error("Image could not be read"))
    );

    reader.readAsDataURL(file);
  });
}
