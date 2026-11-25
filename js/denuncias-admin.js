// ==========================================
// GERENCIAMENTO DE DENÚNCIAS - ADMIN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    const listaDenuncias = document.getElementById('listaDenuncias');
    const pesquisa = document.getElementById('pesquisaDenuncias');
    const filtroStatus = document.getElementById('filtroStatus');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const btnAtualizar = document.getElementById('btnAtualizarDenuncias');

    const totalDenuncias = document.getElementById('totalDenuncias');
    const totalPendentes = document.getElementById('totalPendentes');
    const totalEmAnalise = document.getElementById('totalEmAnalise');
    const totalResolvidas = document.getElementById('totalResolvidas');
    const contador = document.getElementById('contadorDenuncias');

    let denuncias = [];

    const usuario = obterUsuario();
    const ehAdmin = admin();

    // ==========================================
    // PROTEÇÃO DA PÁGINA
    // ==========================================

    if (!estaLogado()) {
        window.location.href = caminhoLogin();
        return;
    }

    if (!usuario || (usuario.tipo !== 'administrador' && usuario.tipo !== 'funcionario')) {
        alert('Você não tem permissão para acessar esta página.');
        window.location.href = '../index.html';
        return;
    }

    // ==========================================
    // FORMATAÇÃO
    // ==========================================

    function escaparHTML(valor) {
        return String(valor ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatarData(data) {
        if (!data) return 'Não informado';

        const texto = String(data).trim();

        // Formato vindo do Laravel: DD-MM-YYYY HH:mm:ss
        const formatoBrasileiro = texto.match(
            /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
        );

        let dataObj;

        if (formatoBrasileiro) {
            const [, dia, mes, ano, hora, minuto, segundo] = formatoBrasileiro;

            dataObj = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                Number(hora || 0),
                Number(minuto || 0),
                Number(segundo || 0)
            );
        } else {
            // Tenta formatos ISO e outros reconhecidos pelo navegador
            dataObj = new Date(texto);
        }

        if (Number.isNaN(dataObj.getTime())) {
            return 'Não informado';
        }

        return dataObj.toLocaleString('pt-BR');
    }

    function normalizarStatus(status) {
        return String(status || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');
    }

    function classeStatus(status) {
        const statusNormalizado = normalizarStatus(status);

        switch (statusNormalizado) {
            case 'pendente':
                return 'status-pendente';

            case 'em_analise':
                return 'status-em-analise';

            case 'resolvida':
                return 'status-resolvida';

            case 'arquivada':
                return 'status-arquivada';

            default:
                return 'status-pendente';
        }
    }

    function mensagemVazia(mensagem) {
        listaDenuncias.innerHTML = `
            <div class="estado-vazio-denuncias">
                <p>${escaparHTML(mensagem)}</p>
            </div>
        `;
    }

    // ==========================================
    // CARREGAR DENÚNCIAS
    // ==========================================

    async function carregarDenuncias() {

        listaDenuncias.innerHTML = `
            <div class="estado-vazio-denuncias">
                <p>Carregando denúncias...</p>
            </div>
        `;

        try {
            const resposta = await apiAutenticada('/denuncias');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar as denúncias.');
            }

            const dados = await resposta.json();

            denuncias = dados.denuncias || [];

            atualizarResumo();
            atualizarCategorias();
            aplicarFiltros();

        } catch (erro) {
            console.error('Erro ao carregar denúncias:', erro);

            mensagemVazia(
                erro.message || 'Erro ao carregar denúncias.'
            );
        }
    }

    // ==========================================
    // RESUMO DOS CARDS
    // ==========================================

    function atualizarResumo() {

        totalDenuncias.textContent = denuncias.length;

        totalPendentes.textContent = denuncias.filter(d =>
            normalizarStatus(d.status) === 'pendente'
        ).length;

        totalEmAnalise.textContent = denuncias.filter(d =>
            normalizarStatus(d.status) === 'em_analise'
        ).length;

        totalResolvidas.textContent = denuncias.filter(d =>
            normalizarStatus(d.status) === 'resolvida'
        ).length;
    }

    // ==========================================
    // FILTRO DE CATEGORIAS
    // ==========================================

    function atualizarCategorias() {

        if (!filtroCategoria) return;

        const categorias = [
            ...new Set(
                denuncias
                    .map(d => d.tipo)
                    .filter(Boolean)
            )
        ].sort();

        const categoriaSelecionada = filtroCategoria.value;

        filtroCategoria.innerHTML = `
            <option value="">Todas as categorias</option>
        `;

        categorias.forEach(categoria => {

            const option = document.createElement('option');

            option.value = categoria;
            option.textContent = categoria;

            filtroCategoria.appendChild(option);
        });

        if (categorias.includes(categoriaSelecionada)) {
            filtroCategoria.value = categoriaSelecionada;
        }
    }

    // ==========================================
    // FILTROS E PESQUISA
    // ==========================================

    function aplicarFiltros() {

        const texto = (pesquisa?.value || '')
            .trim()
            .toLowerCase();

        const statusSelecionado = filtroStatus?.value || '';
        const categoriaSelecionada = filtroCategoria?.value || '';

        const filtradas = denuncias.filter(denuncia => {

            const protocolo = String(denuncia.protocolo || '').toLowerCase();
            const local = String(denuncia.local || '').toLowerCase();
            const tipo = String(denuncia.tipo || '').toLowerCase();

            const correspondePesquisa =
                protocolo.includes(texto) ||
                local.includes(texto) ||
                tipo.includes(texto);

            const correspondeStatus =
                !statusSelecionado ||
                normalizarStatus(denuncia.status) === statusSelecionado;

            const correspondeCategoria =
                !categoriaSelecionada ||
                denuncia.tipo === categoriaSelecionada;

            return correspondePesquisa &&
                correspondeStatus &&
                correspondeCategoria;
        });

        renderizarDenuncias(filtradas);
    }

    // ==========================================
    // EXIBIR DENÚNCIAS
    // ==========================================

    function renderizarDenuncias(lista) {

        contador.textContent = `${lista.length} denúncia(s) encontrada(s)`;

        if (lista.length === 0) {
            mensagemVazia('Nenhuma denúncia encontrada.');
            return;
        }

        listaDenuncias.innerHTML = lista.map(denuncia => {

            const status = denuncia.status || 'Pendente';
            const statusClasse = classeStatus(status);

            const mapa = denuncia.latitude && denuncia.longitude
                ? `https://www.google.com/maps?q=${denuncia.latitude},${denuncia.longitude}`
                : '';

            return `
                <article class="cartao-denuncia-admin">

                    <div class="cabecalho-cartao-denuncia-admin">

                        <div>
                            <h3>
                                ${escaparHTML(denuncia.protocolo || 'Sem protocolo')}
                            </h3>

                            <p class="categoria-denuncia-admin">
                                ${escaparHTML(denuncia.tipo || 'Sem categoria')}
                            </p>
                        </div>

                        <span class="badge-status-denuncia ${statusClasse}">
                            ${escaparHTML(status)}
                        </span>

                    </div>

                    <div class="dados-cartao-denuncia-admin">

                        <p>
                            <strong>Local:</strong>
                            ${escaparHTML(denuncia.local || 'Não informado')}
                        </p>

                        <p>
                            <strong>Data do ocorrido:</strong>
                            ${formatarData(denuncia.data_ocorrido)}
                        </p>

                        <p>
                            <strong>Data do registro:</strong>
                            ${formatarData(denuncia.data_denuncia)}
                        </p>

                        <p>
                            <strong>Descrição:</strong>
                            ${escaparHTML(denuncia.descricao || 'Sem descrição')}
                        </p>

                        ${mapa ? `
                            <p>
                                <a href="${mapa}"
                                   target="_blank"
                                   rel="noopener noreferrer">
                                    Ver localização no mapa
                                </a>
                            </p>
                        ` : ''}

                    </div>

                    <div class="acoes-denuncia-admin">

                        <label>
                            <strong>Alterar status:</strong>

                            <select
                                class="select-status-denuncia"
                                data-id="${denuncia.cod}"
                            >
                                <option value="Pendente"
                                    ${status === 'Pendente' ? 'selected' : ''}>
                                    Pendente
                                </option>

                                <option value="Em análise"
                                    ${status === 'Em análise' ? 'selected' : ''}>
                                    Em análise
                                </option>

                                <option value="Resolvida"
                                    ${status === 'Resolvida' ? 'selected' : ''}>
                                    Resolvida
                                </option>

                                <option value="Arquivada"
                                    ${status === 'Arquivada' ? 'selected' : ''}>
                                    Arquivada
                                </option>
                            </select>
                        </label>

                        ${ehAdmin ? `
                            <button
                                type="button"
                                class="btn-excluir-denuncia"
                                data-id="${denuncia.cod}"
                            >
                                Excluir denúncia
                            </button>
                        ` : ''}

                    </div>

                </article>
            `;

        }).join('');

        configurarBotoes();
    }

    // ==========================================
    // ALTERAR STATUS
    // ==========================================

    function configurarBotoes() {

        const selects = document.querySelectorAll('.select-status-denuncia');

        selects.forEach(select => {

            select.addEventListener('change', async () => {

                const id = select.dataset.id;
                const novoStatus = select.value;

                select.disabled = true;

                try {
                    const resposta = await apiAutenticada(
                        `/denuncias/${id}/status`,
                        {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: novoStatus
                            })
                        }
                    );

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            dados.mensagem || 'Não foi possível atualizar o status.'
                        );
                    }

                    const denuncia = denuncias.find(d => String(d.cod) === String(id));

                    if (denuncia) {
                        denuncia.status = novoStatus;
                    }

                    atualizarResumo();
                    aplicarFiltros();

                    alert('Status atualizado com sucesso!');

                } catch (erro) {
                    alert(erro.message);

                    carregarDenuncias();

                } finally {
                    select.disabled = false;
                }
            });
        });

        // ==========================================
        // EXCLUIR DENÚNCIA (ADMIN)
        // ==========================================

        const botoesExcluir = document.querySelectorAll(
            '.btn-excluir-denuncia'
        );

        botoesExcluir.forEach(botao => {

            botao.addEventListener('click', async () => {

                const id = botao.dataset.id;

                const confirmar = confirm(
                    'Tem certeza que deseja excluir esta denúncia? Esta ação não poderá ser desfeita.'
                );

                if (!confirmar) return;

                botao.disabled = true;

                try {
                    const resposta = await apiAutenticada(
                        `/denuncias/${id}`,
                        {
                            method: 'DELETE'
                        }
                    );

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            dados.mensagem || 'Não foi possível excluir a denúncia.'
                        );
                    }

                    denuncias = denuncias.filter(
                        d => String(d.cod) !== String(id)
                    );

                    atualizarResumo();
                    atualizarCategorias();
                    aplicarFiltros();

                    alert('Denúncia excluída com sucesso!');

                } catch (erro) {
                    alert(erro.message);

                } finally {
                    botao.disabled = false;
                }
            });
        });
    }

    // ==========================================
    // EVENTOS DOS FILTROS
    // ==========================================

    if (pesquisa) {
        pesquisa.addEventListener('input', aplicarFiltros);
    }

    if (filtroStatus) {
        filtroStatus.addEventListener('change', aplicarFiltros);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', aplicarFiltros);
    }

    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', carregarDenuncias);
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    carregarDenuncias();

});