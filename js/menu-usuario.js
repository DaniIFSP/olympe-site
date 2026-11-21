document.addEventListener('DOMContentLoaded', () => {
    const areaAcesso = document.getElementById('acesso');
    if (!areaAcesso) return;

    const token = localStorage.getItem('olympe_token');
    let usuario = null;
    try {
        usuario = JSON.parse(localStorage.getItem('olympe_usuario') || 'null');
    } catch (error) {
        localStorage.removeItem('olympe_usuario');
    }

    if (!token || !usuario || usuario.tipo === 'administrador') return;

    const primeiroNome = (usuario.nome || 'Usuária').trim().split(/\s+/)[0];
    areaAcesso.classList.add('acesso-logado');
    areaAcesso.innerHTML = `
        <details class="menu-conta">
            <summary aria-label="Abrir menu da conta">${escapeHtml(primeiroNome)}</summary>
            <div class="opcoes-conta">
                <a href="view/minha-conta.html">Minha conta</a>
                <a href="view/mapeamento.html">Ajude no mapeamento</a>
                <a href="view/minhas-denuncias.html">Minhas denúncias</a>
                <a href="view/encomenda.html">Encomendar dispositivo</a>
                <button type="button" id="btn-logout-menu">Sair da conta</button>
            </div>
        </details>
        <img src="img/sol_detalhe.png" alt="detalhe">
    `;

    document.getElementById('btn-logout-menu')?.addEventListener('click', () => {
        const tokenAtual = localStorage.getItem('olympe_token');
        localStorage.removeItem('olympe_token');
        localStorage.removeItem('olympe_usuario');
        if (tokenAtual) {
            fetch('https://olympe-api.onrender.com/api/logout', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenAtual}` }
            }).catch(() => {});
        }
        window.location.href = 'index.html';
    });
});

function escapeHtml(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
    }[caractere]));
}
