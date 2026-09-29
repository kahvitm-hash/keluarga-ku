export default {
  async fetch(request, env, ctx) {
    // PASTI KAN URL INI ADALAH URL DEPLOYMENT APPS SCRIPT ANDA
    const GAS_URL = "https://script.google.com/macros/s/AKfycbwzR9vRwV2-_pYAdIIu5_kjgvqGBQFOJNWY_UcqC7iiHSKI21ymSJMORtacQkpX3NzS/exec";

    try {
      const url = new URL(request.url);
      const targetUrl = new URL(GAS_URL);

      // Salin semua query parameter (action, payload, callback)
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      // Lakukan fetch ke Google Apps Script dengan penanganan redirect manual
      let response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        redirect: 'follow' // Wajib follow redirect Google Apps Script
      });

      // Ambil isi teks / JSON dari Google
      const bodyText = await response.text();

      // Kembalikan response lengkap ke browser dengan Header CORS
      return new Response(bodyText, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    } catch (error) {
      return new Response("Error Proxy Cloudflare: " + error.message, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
