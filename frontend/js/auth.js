// ==========================================================================
// Tripadinho - Auth Client
// ==========================================================================

window.auth = {
    supabaseClient: null,
    session: null,

    _initPromise: null,

    init() {
        if (!this._initPromise) {
            this._initPromise = this._doInit();
        }
        return this._initPromise;
    },

    async _doInit() {
        if (this.supabaseClient) return;

        // Fetch config from backend
        const res = await fetch('/api/config');
        if (!res.ok) {
            console.error('Failed to fetch config');
            return;
        }
        const config = await res.json();
        
        // Initialize Supabase
        this.supabaseClient = window.supabase.createClient(config.supabase_url, config.supabase_anon_key);
        
        // Get current session
        const { data } = await this.supabaseClient.auth.getSession();
        this.session = data.session;

        // Listen for auth changes
        this.supabaseClient.auth.onAuthStateChange((event, session) => {
            this.session = session;
            this.updateUIVisibility();
        });

        this.updateUIVisibility();
    },

    updateUIVisibility() {
        const loggedInElems = document.querySelectorAll('.auth-logged-in');
        const loggedOutElems = document.querySelectorAll('.auth-logged-out');

        if (this.session) {
            loggedInElems.forEach(el => el.classList.remove('hidden'));
            loggedOutElems.forEach(el => el.classList.add('hidden'));
        } else {
            loggedInElems.forEach(el => el.classList.add('hidden'));
            loggedOutElems.forEach(el => el.classList.remove('hidden'));
        }
    },

    requireAuth() {
        if (!this.session) {
            window.location.href = '/login.html';
        }
    },

    async getToken() {
        if (!this.session) return null;
        return this.session.access_token;
    },

    async signInWithGoogle() {
        const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/objectives.html'
            }
        });
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await this.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    async signUp(email, password) {
        const { data, error } = await this.supabaseClient.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await this.supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = '/';
    },

    // A wrapper around fetch that automatically adds the Authorization header
    async fetchWithAuth(url, options = {}) {
        const token = await this.getToken();
        if (!token) {
            console.error("Attempted to fetch without token", url);
            throw new Error("Não autenticado");
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        return fetch(url, { ...options, headers });
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        window.auth.init();
    }
});
