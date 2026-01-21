import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const ONESIGNAL_APP_ID = '33461894-4470-4dd2-b2c3-222591f4ca88'
const ONESIGNAL_REST_API_KEY = 'os_v2_app_gndbrfceobg5fmwdeiszd5gkrdxrj2yckbqu3j5eze33qh53anwdftux7fesoh4ewayoyp2idc7ogk4ce5ufhkbrwpmvwlx5rwnqs6i'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, message, url } = await req.json()

    // Send notification via OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { ar: title, en: title },
        contents: { ar: message, en: message },
        url: url || 'https://auham.github.io',
        chrome_web_icon: 'https://auham.github.io/icons/icon-192.png'
      })
    })

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: response.ok, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
