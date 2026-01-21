// Supabase Edge Function: send-wedding-reminders
// This function checks for upcoming weddings and sends push notifications
// Schedule: Run daily at 9:00 AM (Saudi Time = 6:00 AM UTC)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_APP_ID = '33461894-4470-4dd2-b2c3-222591f4ca88'
const ONESIGNAL_REST_API_KEY = 'drb5ebr47e7deqpfygkjrttea'

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
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Date 7 days from now
        const oneWeekLater = new Date(today)
        oneWeekLater.setDate(oneWeekLater.getDate() + 7)

        const results = {
            weekBefore: [],
            dayOf: [],
            errors: []
        }

        // 1. Check for weddings happening in exactly 7 days
        const { data: weekBeforeWeddings, error: weekError } = await supabase
            .from('invitations')
            .select('id, groom_name, groom_father, wedding_date')
            .eq('wedding_date', oneWeekLater.toISOString().split('T')[0])

        if (weekError) {
            results.errors.push(`Week before query error: ${weekError.message}`)
        } else if (weekBeforeWeddings && weekBeforeWeddings.length > 0) {
            for (const wedding of weekBeforeWeddings) {
                // Check if notification already sent
                const { data: existing } = await supabase
                    .from('notification_log')
                    .select('id')
                    .eq('invitation_id', wedding.id)
                    .eq('notification_type', 'week_before')
                    .single()

                if (!existing) {
                    // Send notification
                    const groomInfo = wedding.groom_father
                        ? `${wedding.groom_name} ابن ${wedding.groom_father}`
                        : wedding.groom_name

                    const sent = await sendPushNotification(
                        '📅 الأسبوع القادم',
                        `زواج ابن العم ${groomInfo}`,
                        wedding.id
                    )

                    if (sent) {
                        // Log the notification
                        await supabase.from('notification_log').insert({
                            invitation_id: wedding.id,
                            notification_type: 'week_before'
                        })
                        results.weekBefore.push(wedding.groom_name)
                    }
                }
            }
        }

        // 2. Check for weddings happening today
        const { data: todayWeddings, error: todayError } = await supabase
            .from('invitations')
            .select('id, groom_name, groom_father, wedding_date')
            .eq('wedding_date', today.toISOString().split('T')[0])

        if (todayError) {
            results.errors.push(`Today query error: ${todayError.message}`)
        } else if (todayWeddings && todayWeddings.length > 0) {
            for (const wedding of todayWeddings) {
                // Check if notification already sent
                const { data: existing } = await supabase
                    .from('notification_log')
                    .select('id')
                    .eq('invitation_id', wedding.id)
                    .eq('notification_type', 'day_of')
                    .single()

                if (!existing) {
                    // Send notification
                    const groomInfo = wedding.groom_father
                        ? `${wedding.groom_name} ابن ${wedding.groom_father}`
                        : wedding.groom_name

                    const sent = await sendPushNotification(
                        '💒 تذكير: اليوم الزواج!',
                        `زواج ابن العم ${groomInfo}`,
                        wedding.id
                    )

                    if (sent) {
                        // Log the notification
                        await supabase.from('notification_log').insert({
                            invitation_id: wedding.id,
                            notification_type: 'day_of'
                        })
                        results.dayOf.push(wedding.groom_name)
                    }
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Notification check completed',
                results
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})

async function sendPushNotification(title: string, message: string, invitationId: string): Promise<boolean> {
    try {
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
                url: `https://auham.github.io/invitation.html?id=${invitationId}`,
                chrome_web_icon: 'https://auham.github.io/icons/icon-192.png',
                firefox_icon: 'https://auham.github.io/icons/icon-192.png'
            })
        })

        const result = await response.json()
        console.log('OneSignal response:', result)
        return response.ok
    } catch (error) {
        console.error('Push notification error:', error)
        return false
    }
}
