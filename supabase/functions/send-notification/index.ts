import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const ONESIGNAL_APP_ID = '33461894-4470-4dd2-b2c3-222591f4ca88'
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_API_KEY') || ''

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
    const body = await req.json()

    // Extract title and message properly
    const title = body.title || 'إشعار جديد'
    const message = body.message || ''
    const url = body.url || 'https://auham.github.io'

    console.log('Sending notification:', { title, message, url })

    // Send notification via OneSignal with correct format
    const notificationBody = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: {
        ar: title,
        en: title
      },
      contents: {
        ar: message,
        en: message
      },
      url: url,
      chrome_web_icon: 'https://auham.github.io/icons/icon-192.png',
      chrome_web_badge: 'https://auham.github.io/icons/icon-72.png'
    }

    console.log('OneSignal request body:', JSON.stringify(notificationBody))

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(notificationBody)
    })

    const result = await response.json()
    console.log('OneSignal response:', JSON.stringify(result))

    return new Response(
      JSON.stringify({ success: response.ok, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

