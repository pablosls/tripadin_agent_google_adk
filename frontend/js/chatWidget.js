// chatWidget.js

const chatWidgetHTML = `
<div id="chat-widget" class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Janela do Chat -->
    <div id="chat-window" class="hidden w-[350px] md:w-[400px] h-[550px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden chat-enter">
        <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div class="flex items-center">
                <span class="text-xl mr-2">🌴</span>
                <h3 class="font-bold">Guia Tripadinho</h3>
            </div>
            <button id="close-chat" class="text-white hover:text-blue-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        
        <div id="chat-messages" class="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col space-y-4">
            <!-- Mensagem Inicial -->
            <div class="self-start bg-white p-3 rounded-lg shadow-sm border border-slate-100 max-w-[85%] text-slate-700 text-sm">
                Olá! Sou seu guia virtual do Nordeste. Que destino você quer explorar hoje? Posso montar roteiros ou sugerir lugares para você salvar!
            </div>
        </div>

        <div class="p-3 bg-white border-t border-slate-200">
            <form id="chat-form" class="flex space-x-2">
                <input type="text" id="chat-input" class="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Digite sua mensagem...">
                <button type="submit" class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Botão Flutuante -->
    <button id="chat-widget-button" class="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
    </button>
</div>
`;

let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('chat-widget-container');
    if (!container) return;
    
    container.innerHTML = chatWidgetHTML;

    const chatWindow = document.getElementById('chat-window');
    const chatBtn = document.getElementById('chat-widget-button');
    const closeBtn = document.getElementById('close-chat');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    // Toggle Chat
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Handle form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        appendMessage('user', text);
        input.value = '';
        
        // Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            const baseUrl = window.API_BASE !== undefined ? window.API_BASE : (window.location.port === '3000' ? 'http://127.0.0.1:8000' : '');
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: chatHistory })
            });

            const data = await response.json();
            
            // Remove typing
            document.getElementById(typingId)?.remove();

            // Add bot text response
            if (data.response) {
                appendMessage('bot', data.response);
                chatHistory.push({ role: 'user', parts: [{text: text}] });
                chatHistory.push({ role: 'model', parts: [{text: data.response}] });
            }

            // Render cards if any
            if (data.cards && data.cards.length > 0) {
                data.cards.forEach(card => renderCardInChat(card));
            }

        } catch (error) {
            document.getElementById(typingId)?.remove();
            appendMessage('bot', 'Desculpe, ocorreu um erro ao conectar com o servidor.');
        }
    });

    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `p-3 rounded-lg shadow-sm text-sm max-w-[85%] ${
            sender === 'user' 
                ? 'self-end bg-blue-600 text-white' 
                : 'self-start bg-white border border-slate-100 text-slate-700'
        }`;
        // Basic markdown formatting for bold (replace **text** with <strong>text</strong>)
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // line breaks
        formattedText = formattedText.replace(/\\n/g, '<br>');
        
        div.innerHTML = formattedText;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'self-start bg-white p-3 rounded-lg shadow-sm border border-slate-100 max-w-[85%] text-slate-500 text-sm flex items-center space-x-2';
        div.innerHTML = `
            <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return id;
    }

    function renderCardInChat(card) {
        const div = document.createElement('div');
        div.className = 'self-start bg-white border border-slate-200 rounded-lg shadow-sm w-[90%] overflow-hidden my-2';
        // Convert card object to JSON for button onclick
        const cardJson = JSON.stringify(card).replace(/"/g, '&quot;');
        
        div.innerHTML = `
            <div class="h-32 bg-slate-200 relative" style="background-image: url('${card.image}'); background-size: cover; background-position: center;">
                <div class="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">
                    ${card.type}
                </div>
            </div>
            <div class="p-3">
                <h4 class="font-bold text-slate-900 text-sm">${card.title}</h4>
                <p class="text-xs text-slate-500 flex items-center mt-1">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    ${card.destination}
                </p>
                <p class="text-xs text-slate-600 mt-2 line-clamp-2">${card.description}</p>
                <button onclick="saveCard(${cardJson}, this)" class="mt-3 w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 font-medium py-1.5 rounded transition text-xs flex justify-center items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    Salvar no Perfil
                </button>
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
});

// Global function to be called from inline onclick
async function saveCard(cardData, btnElement) {
    if (typeof currentUser === 'undefined' || !currentUser) {
        alert('Por favor, faça login com o Google para salvar!');
        return;
    }
    
    // Change button state to loading
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = 'Salvando...';
    btnElement.disabled = true;

    try {
        const baseUrl = window.API_BASE !== undefined ? window.API_BASE : (window.location.port === '3000' ? 'http://127.0.0.1:8000' : '');
        const response = await fetch(`${baseUrl}/cards/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                card: cardData
            })
        });

        if (response.ok) {
            btnElement.innerHTML = '✔ Salvo!';
            btnElement.classList.replace('bg-blue-50', 'bg-green-500');
            btnElement.classList.replace('text-blue-600', 'text-white');
            btnElement.classList.replace('border-blue-200', 'border-green-600');
        } else {
            throw new Error('Erro do servidor');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar card.');
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
    }
}
