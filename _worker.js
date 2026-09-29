export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);

    /*
     * Semua request /api diteruskan ke Google Apps Script.
     * Request lainnya dilayani oleh Cloudflare Pages Assets.
     */

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {

      const GAS_URL =
        "https://script.google.com/macros/s/AKfycbwzR9vRwV2-_pYAdIIu5_kjgvqGBQFOJNWY_UcqC7iiHSKI21ymSJMORtacQkpX3NzS/exec";

      // CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }

      try {

        const targetUrl = new URL(GAS_URL);

        // Teruskan query parameter jika ada.
        url.searchParams.forEach((value, key) => {
          targetUrl.searchParams.append(key, value);
        });

        const headers = new Headers();

        const contentType =
          request.headers.get("Content-Type");

        if (contentType) {
          headers.set("Content-Type", contentType);
        }

        headers.set(
          "Accept",
          "application/json, text/plain, */*"
        );

        headers.set(
          "User-Agent",
          "Mozilla/5.0 Cloudflare-Worker"
        );

        let body = undefined;

        if (
          request.method !== "GET" &&
          request.method !== "HEAD"
        ) {
          body = await request.arrayBuffer();
        }

        const gasResponse = await fetch(
          targetUrl.toString(),
          {
            method: request.method,
            headers: headers,
            body: body,
            redirect: "follow"
          }
        );

        const responseBody =
          await gasResponse.arrayBuffer();

        const responseHeaders =
          new Headers();

        responseHeaders.set(
          "Content-Type",
          gasResponse.headers.get("content-type") ||
          "application/json; charset=utf-8"
        );

        responseHeaders.set(
          "Cache-Control",
          "no-store"
        );

        responseHeaders.set(
          "Access-Control-Allow-Origin",
          "*"
        );

        responseHeaders.set(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS"
        );

        responseHeaders.set(
          "Access-Control-Allow-Headers",
          "Content-Type"
        );

        return new Response(
          responseBody,
          {
            status: gasResponse.status,
            headers: responseHeaders
          }
        );

      } catch (error) {

        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Error Proxy Cloudflare: " +
              error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type":
                "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    /*
     * Bukan /api:
     * tampilkan file statis dari Cloudflare Pages.
     */
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "Cloudflare Pages Assets belum tersedia.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }
};
