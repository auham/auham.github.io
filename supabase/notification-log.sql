-- Create a table to track sent notifications (to avoid duplicates)
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- 'week_before' or 'day_of'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invitation_id, notification_type)
);

-- Enable RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert
CREATE POLICY "Service role can insert notification_log" ON notification_log
    FOR INSERT TO service_role WITH CHECK (true);

-- Allow service role to select
CREATE POLICY "Service role can select notification_log" ON notification_log
    FOR SELECT TO service_role USING (true);
