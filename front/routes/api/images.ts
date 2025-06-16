// routes/api/images.ts
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    // In a real application, you'd fetch these from a database,
    // cloud storage (e.g., S3, Cloudinary), etc.
    const imageUrls: string[] = [];
    for (let i = 1; i <= 50; i++) {
      // Using a placeholder image service for demonstration
      imageUrls.push(`https://picsum.photos/300/300?random=${i}`);
    }

    return new Response(JSON.stringify(imageUrls), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
