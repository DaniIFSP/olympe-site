const API_URL = 'https://olympe-api.onrender.com/api';


// Recupera o token salvo
function obterToken() {
    return localStorage.getItem('olympe_token');
}


// Recupera os dados do usuário
function obterUsuario() {
    const dados = localStorage.getItem('olympe_usuario');

    if (!dados) return null;

    try {
        return JSON.parse(dados);
    } catch (erro) {
        limparSessao();
        return null;
    }
}


// Salva o login
function salvarSessao(token, usuario) {
    localStorage.setItem('olympe_token', token);
    localStorage.setItem('olympe_usuario', JSON.stringify(usuario));
}


// Apaga os dados do login
function limparSessao() {
    localStorage.removeItem('olympe_token');
    localStorage.removeItem('olympe_usuario');
}


// Verifica se o usuário está logado
function estaLogado() {
    return Boolean(obterToken() && obterUsuario());
}


// Verifica se o usuário é administrador
function admin() {
    return obterUsuario()?.tipo === 'administrador';
}


// Define o caminho para a página de login
function caminhoLogin() {
    return window.location.pathname.includes('/view/')
        ? 'login.html'
        : 'view/login.html';
}


// Encerra a sessão
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

    const paginaInicial = window.location.pathname.includes('/view/')
        ? '../index.html'
        : 'index.html';

    window.location.href = paginaInicial;
}


// Faz requisições para a API com autenticação
async function apiAutenticada(endpoint, opcoes = {}) {
    const token = obterToken();

    if (!token) {
        window.location.href = caminhoLogin();
        throw new Error('Usuário não autenticado.');
    }

    const headers = {
        'Accept': 'application/json',
        ...opcoes.headers,
        'Authorization': `Bearer ${token}`
    };

    const resposta = await fetch(`${API_URL}${endpoint}`, {
        ...opcoes,
        headers
    });

    // Se a sessão expirou, encerra o login
    if (resposta.status === 401) {
        limparSessao();
        window.location.href = caminhoLogin();

        throw new Error('Sua sessão expirou.');
    }

    return resposta;
}