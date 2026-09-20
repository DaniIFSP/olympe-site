const API_URL = 'https://olympe-api.onrender.com/api';

function obterToken() {
    return localStorage.getItem('olympe_token');
}

function obterUsuario() {
    const usuario = localStorage.getItem('olympe_usuario');

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch (error) {
        localStorage.removeItem('olympe_usuario');
        return null;
    }
}

function salvarSessao(token, usuario) {
    localStorage.setItem('olympe_token', token);
    localStorage.setItem(
        'olympe_usuario',
        JSON.stringify(usuario)
    );
}

function limparSessao() {
    localStorage.removeItem('olympe_token', token);
    localStorage.removeItem('olympe_usuario');
}

function estaLogado() {
    return !!obterToken() && !!obterUsuario();
}

function admin() { 
    const usuario = obterUsuario(); 
    
    return usuario?.tipo === 'administrador'; 
} 

function exigirLogin() { 
    if (!estaLogado()) { 
        window.location.href = 'login.html'; 
    } 
} 

function exigirAdministrador() { 
    exigirLogin(); 
    
    if (!admin()) { 
        window.location.href = 'usuario.html'; 
    } 
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
        }).catch(() => { }); 
    } 
    window.location.href = 'login.html'; } 
    
async function apiAutenticada(endpoint, opcoes = {}) {
    const token = obterToken(); 
    
    if (!token) { 
        window.location.href = 'login.html'; 
        throw new Error('Usuário não autenticado.'); 
    } 
    
    const headers = { 
        'Accept': 'application/json', 
        ...(opcoes.headers || {}), 
        'Authorization': `Bearer ${token}` 
    }; 
    
    const resposta = await fetch( 
        `${API_URL}${endpoint}`, 
        { ...opcoes, headers } ); 
        
        if (resposta.status === 401) { 
            limparSessao(); 
            window.location.href = 'login.html'; 
            throw new Error('Sua sessão expirou.'); 
        } 
        return resposta; 
}