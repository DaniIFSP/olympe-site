const API_URL = 'https://olympe-api.onrender.com/api';

function obterToken() {
    return localStorage.getItem('olympe_token');
}

function obterUsuario() {
    const usuario = localStorage.getItem('olympe_usuario');
    if (!usuario) return null;

    try {
        return JSON.parse(usuario);
    } catch (error) {
        localStorage.removeItem('olympe_usuario');
        return null;
    }
}

function salvarSessao(token, usuario) {
    localStorage.setItem('olympe_token', token);
    localStorage.setItem('olympe_usuario', JSON.stringify(usuario));
}

function limparSessao() {
    localStorage.removeItem('olympe_token');
    localStorage.removeItem('olympe_usuario');
}

function estaLogado() {
    return Boolean(obterToken() && obterUsuario());
}

function admin() {
    return obterUsuario()?.tipo === 'administrador';
}

function logout() {
    const token = obterToken();
    limparSessao();

    if (token) {
        fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch(() => {});
    }

    window.location.href = window.location.pathname.includes('/view/')
        ? '../index.html'
        : 'index.html';
}

async function apiAutenticada(endpoint, opcoes = {}) {
    const token = obterToken();
    if (!token) {
        window.location.href = window.location.pathname.includes('/view/')
            ? 'login.html'
            : 'view/login.html';
        throw new Error('Usuário não autenticado.');
    }

    const headers = {
        'Accept': 'application/json',
        ...(opcoes.headers || {}),
        'Authorization': `Bearer ${token}`
    };

    const resposta = await fetch(`${API_URL}${endpoint}`, { ...opcoes, headers });
    if (resposta.status === 401) {
        limparSessao();
        window.location.href = window.location.pathname.includes('/view/')
            ? 'login.html'
            : 'view/login.html';
        throw new Error('Sua sessão expirou.');
    }
    return resposta;
}
