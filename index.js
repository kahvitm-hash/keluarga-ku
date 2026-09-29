export default {
  async fetch(request, env, ctx) {
    // =========================================================================
    // 1. ISIKAN URL DEPLOY GOOGLE APPS SCRIPT ANDA DI BAWAH INI
    // =========================================================================
    const GAS_URL = "https://script.google.com/macros/s/AKfycbwzR9vRwV2-_pYAdIIu5_kjgvqGBQFOJNWY_UcqC7iiHSKI21ymSJMORtacQkpX3NzS/exec";

    // Jika URL GAS belum diganti, tampilkan pesan petunjuk
    if (GAS_URL.includes("AKfycbx...")) {
      return new Response(
        "<h1>Harap ganti `GAS_URL` di dalam kode dengan URL Web App Google Apps Script Anda!</h1>",
        { headers: { "content-type": "text/html;charset=UTF-8" } }
      );
    }

    try {
      const url = new URL(request.url);
      const targetUrl = new URL(GAS_URL);

      // Teruskan semua query parameter dari URL
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      // Salin header & atur User-Agent
      const headers = new Headers(request.headers);
      headers.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');

      // Buat request baru untuk proxy ke Google Apps Script
      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
        redirect: 'follow'
      });

      const response = await fetch(modifiedRequest);

      // Kembalikan hasil ke browser pengguna
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      return new Response("Error Proxy: " + error.message, { status: 500 });
    }
  }
};
