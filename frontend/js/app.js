// Substitua por suas credenciais reais do Supabase
const SUPABASE_URL = 'https://dkozosqnqbivvgteqyao.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vJDxgTZlMZaYIjQ4n2j-3A_mg_fbALf';

let supabaseClient;
let currentUser = null;

// Inicialização do Supabase
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Verifica sessão atual ao carregar a página
async function checkSession() {
    if (!supabaseClient) return;
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        updateUIForLoggedInUser(session.user);
    }

    // Escuta mudanças no auth
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session) {
            currentUser = session.user;
            updateUIForLoggedInUser(session.user);
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
}

const API_BASE = window.location.port === '3000' ? 'http://127.0.0.1:8000' : '';
window.API_BASE = API_BASE;

// Atualiza UI se logado
function updateUIForLoggedInUser(user) {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <div class="flex items-center space-x-3">
                <a href="destination.html" class="text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-md font-medium text-sm transition">Experiências</a>
                <a href="objectives.html" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-semibold text-sm transition flex items-center">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    Meus Objetivos
                </a>
                <a href="profile.html" class="text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-md font-medium text-sm transition">Perfil</a>
                <button id="logout-btn" class="text-slate-400 hover:text-red-600 text-sm font-medium transition ml-1">
                    Sair
                </button>
            </div>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
        });
    }
}

// Atualiza UI se deslogado
function updateUIForLoggedOutUser() {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <div class="flex items-center space-x-3">
                <a href="destination.html" class="text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-md font-medium text-sm transition">Experiências</a>
                <button id="login-btn" class="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-sm">
                    Entrar com Google
                </button>
            </div>
        `;
        document.getElementById('login-btn')?.addEventListener('click', signInWithGoogle);
    }
}

// Helper: Buscar cards salvos do usuário
async function fetchUserSavedCards(userId) {
    try {
        const res = await fetch(`${API_BASE}/cards/saved/${userId}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.cards || [];
    } catch (e) {
        console.error("Erro ao buscar cards salvos:", e);
        return [];
    }
}

// Helper: Salvar card
async function saveExperienceCard(userId, card) {
    const res = await fetch(`${API_BASE}/cards/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            card: {
                id: String(card.id || card.title),
                destination: card.destination,
                title: card.title,
                description: card.description,
                image: card.image,
                type: card.type
            }
        })
    });
    return res.json();
}

// Helper: Remover card
async function removeExperienceCard(userId, title, cardId) {
    const res = await fetch(`${API_BASE}/cards/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            title: title,
            card_id: cardId ? String(cardId) : null
        })
    });
    return res.json();
}

// Iniciar Login com Google via Supabase
async function signInWithGoogle() {
    if (!supabaseClient) {
        alert("Supabase não configurado.");
        return;
    }
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) console.error("Erro no login:", error.message);
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    // Adiciona evento no botão de login se ele existir inicialmente
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', signInWithGoogle);
    }
});
