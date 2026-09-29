export default {
  async fetch(request, env, ctx) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbwzR9vRwV2-_pYAdIIu5_kjgvqGBQFOJNWY_UcqC7iiHSKI21ymSJMORtacQkpX3NzS/exec";

    try {
      const url = new URL(request.url);
      const targetUrl = new URL(GAS_URL);

      // Teruskan semua query parameter
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      const headers = new Headers(request.headers);
      headers.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');

      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
        redirect: 'follow'
      });

      const response = await fetch(modifiedRequest);

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
