// Supabase Configuration
const SUPABASE_URL = 'https://edppzcfcqeuejmexsmgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcHB6Y2ZjcWV1ZWptZXhzbWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjM3NzYsImV4cCI6MjA4NDQ5OTc3Nn0.v0Uy8OzMaWStyjEIaATa7IU97VkfdK0gKkXuAB13MSs';

// Initialize Supabase Client with different name to avoid collision
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// Invitations CRUD Operations
// ========================================

async function getInvitations() {
    try {
        const { data, error } = await supabaseClient
            .from('invitations')
            .select('*')
            .order('wedding_date', { ascending: true });

        if (error) {
            console.error('Error fetching invitations:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Exception fetching invitations:', err);
        return [];
    }
}

async function getUpcomingInvitations() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseClient
            .from('invitations')
            .select('*')
            .gte('wedding_date', today)
            .order('wedding_date', { ascending: true });

        if (error) {
            console.error('Error fetching upcoming invitations:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Exception fetching upcoming invitations:', err);
        return [];
    }
}

async function getInvitationById(id) {
    try {
        const { data, error } = await supabaseClient
            .from('invitations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching invitation:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Exception fetching invitation:', err);
        return null;
    }
}

async function createInvitation(invitation) {
    const { data, error } = await supabaseClient
        .from('invitations')
        .insert([invitation])
        .select()
        .single();

    if (error) {
        console.error('Error creating invitation:', error);
        throw error;
    }
    return data;
}

async function updateInvitation(id, updates) {
    const { data, error } = await supabaseClient
        .from('invitations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating invitation:', error);
        throw error;
    }
    return data;
}

async function deleteInvitation(id) {
    const { error } = await supabaseClient
        .from('invitations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
    }
    return true;
}

// ========================================
// News CRUD Operations
// ========================================

async function getNews() {
    try {
        const { data, error } = await supabaseClient
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching news:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Exception fetching news:', err);
        return [];
    }
}

async function getNewsById(id) {
    try {
        const { data, error } = await supabaseClient
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching news item:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Exception fetching news item:', err);
        return null;
    }
}

async function createNews(newsItem) {
    const { data, error } = await supabaseClient
        .from('news')
        .insert([newsItem])
        .select()
        .single();

    if (error) {
        console.error('Error creating news:', error);
        throw error;
    }
    return data;
}

async function updateNews(id, updates) {
    const { data, error } = await supabaseClient
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating news:', error);
        throw error;
    }
    return data;
}

async function deleteNews(id) {
    const { error } = await supabaseClient
        .from('news')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting news:', error);
        throw error;
    }
    return true;
}

// ========================================
// Authentication
// ========================================

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Error signing in:', error);
        throw error;
    }
    return data;
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
        throw error;
    }
    return true;
}

async function getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session;
}

async function isAuthenticated() {
    const session = await getSession();
    return session !== null;
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user.email);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
    }
});

console.log('Supabase client initialized successfully');
