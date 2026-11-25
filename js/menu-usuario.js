document.addEventListener('DOMContentLoaded', () => {
    const areaAcesso = document.getElementById('acesso');

    if (!areaAcesso) return;

    const token = obterToken();
    const usuario = obterUsuario();

    if (!token || !usuario) return;

    const administrador = usuario.tipo === 'administrador';
    const primeiroNome = (usuario.nome || 'Usuário').trim().split(/\s+/)[0];

    // Identifica se estamos na pasta view
    const estaNaView = window.location.pathname.includes('/view/');

    const caminhoView = estaNaView ? '' : 'view/';
    const caminhoImagem = estaNaView ? '../img/' : 'img/';

    // Monta os links de acordo com o tipo de usuário
    let links = `
        <a href="${caminhoView}minha-conta.html">Minha conta</a>
        <a href="${caminhoView}mapeamento.html">Ajude no mapeamento</a>
        <a href="${caminhoView}minhas-denuncias.html">Minhas denúncias</a>
        <a href="${caminhoView}encomenda.html">Encomendar dispositivo</a>
    `;

    if (administrador) {
        links = `
            <a href="${caminhoView}minha-conta.html">Minha conta</a>
            <a href="${caminhoView}funcionarios.html">Painel administrativo</a>
        `;
    }

    areaAcesso.classList.add('acesso-logado');

    areaAcesso.innerHTML = `
        <details class="menu-conta">
            <summary aria-label="Abrir menu da conta">
                ${escapeHtml(primeiroNome)}
            </summary>

            <div class="opcoes-conta">
                ${links}
                <button type="button" id="btn-logout-menu">
                    Sair da conta
                </button>
            </div>
        </details>

        <img src="${caminhoImagem}sol_detalhe.png" alt="" aria-hidden="true">
    `;

    // Botão de sair
    const botaoLogout = document.getElementById('btn-logout-menu');

    botaoLogout.addEventListener('click', () => {
        logout();
    });
});


// Protege o nome do usuário contra inserção de HTML
function escapeHtml(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[caractere]));
}