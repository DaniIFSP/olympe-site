
const token = localStorage.getItem('olympe_token');
const usuarioSalvo = localStorage.getItem('olympe_usuario');

let usuario = null;

try {
    usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
} catch (error) {
    usuario = null;
}

// Verifica se existe uma sessão válida localmente.
if (!token || !usuario) {
    localStorage.removeItem('olympe_token');
    localStorage.removeItem('olympe_usuario');

    window.location.href = 'login.html';
}

// Impede que administradores utilizem a área da usuária.
else if (usuario.tipo === 'administrador') {
    window.location.href = 'admin.html';
}

// Botão para encerrar a sessão.
const btnSair = document.getElementById('btn-sair');

btnSair.addEventListener('click', async () => {
    try {
        await fetch('https://olympe-api.onrender.com/api/logout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Erro ao encerrar sessão:', error);
    } finally {
        localStorage.removeItem('olympe_token');
        localStorage.removeItem('olympe_usuario');

        window.location.href = 'login.html';
    }
});
