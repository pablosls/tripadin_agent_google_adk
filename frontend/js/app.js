const API_BASE = window.location.port === '3000' ? 'http://127.0.0.1:8000' : '';
window.API_BASE = API_BASE;

// Helper: Buscar cards salvos do usuário
async function fetchUserSavedCards() {
    try {
        const res = await window.auth.fetchWithAuth(`${API_BASE}/cards/saved`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.cards || [];
    } catch (e) {
        console.error("Erro ao buscar cards salvos:", e);
        return [];
    }
}

// Helper: Salvar card
async function saveExperienceCard(card) {
    const res = await window.auth.fetchWithAuth(`${API_BASE}/cards/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
async function removeExperienceCard(title, cardId) {
    const res = await window.auth.fetchWithAuth(`${API_BASE}/cards/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
