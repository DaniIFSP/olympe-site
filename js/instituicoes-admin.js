document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ELEMENTOS DA PÁGINA
    // ==========================================

    const listaInstituicoes = document.getElementById('listaInstituicoes');
    const pesquisaInstituicoes = document.getElementById('pesquisaInstituicoes');
    const filtroCategoria = document.getElementById('filtroCategoriaInstituicao');
    const btnAtualizar = document.getElementById('btnAtualizarInstituicoes');

    const totalInstituicoes = document.getElementById('totalInstituicoes');
    const instituicoesExibidas = document.getElementById('instituicoesExibidas');
    const instituicoesComEndereco = document.getElementById('instituicoesComEndereco');
    const instituicoesComContato = document.getElementById('instituicoesComContato');
    const contadorInstituicoes = document.getElementById('contadorInstituicoes');

    // Modal
    const modal = document.getElementById('modalInstituicao');
    const btnNovaInstituicao = document.getElementById('btnNovaInstituicao');
    const btnFecharModal = document.getElementById('btnFecharModalInstituicao');
    const btnCancelar = document.getElementById('btnCancelarInstituicao');
    const formInstituicao = document.getElementById('formInstituicao');
    const btnSalvar = document.getElementById('btnSalvarInstituicao');
    const mensagemFormulario = document.getElementById('mensagemFormularioInstituicao');
    const tituloModal = document.getElementById('tituloModalInstituicao');

    // Endereços
    const listaEnderecos = document.getElementById('listaEnderecosInstituicao');
    const btnAdicionarEndereco = document.getElementById('btnAdicionarEndereco');

    // ==========================================
    // VARIÁVEIS
    // ==========================================

    let todasInstituicoes = [];
    let contadorEnderecos = 0;

    // null = cadastro
    // número = edição
    let instituicaoEditando = null;

    // ==========================================
    // PROTEGER TEXTO HTML
    // ==========================================

    function escaparHTML(texto) {

        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }

    // ==========================================
    // OBTER ENDEREÇOS
    // ==========================================

    function obterEnderecos(instituicao) {

        if (Array.isArray(instituicao.endereco)) {
            return instituicao.endereco;
        }

        if (Array.isArray(instituicao.enderecos)) {
            return instituicao.enderecos;
        }

        return [];
    }

    // ==========================================
    // CARREGAR INSTITUIÇÕES
    // ==========================================

    async function carregarInstituicoes() {

        listaInstituicoes.innerHTML = `
            <div class="estado-vazio-instituicoes">
                <p>Carregando instituições...</p>
            </div>
        `;

        btnAtualizar.disabled = true;

        try {

            const resposta = await fetch(`${API_URL}/instituicoes`);

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar as instituições.');
            }

            const dados = await resposta.json();

            todasInstituicoes = dados.instituicoes || [];

            atualizarResumo();
            preencherCategorias();
            aplicarFiltros();

        } catch (erro) {

            console.error('Erro ao carregar instituições:', erro);

            listaInstituicoes.innerHTML = `
                <div class="estado-vazio-instituicoes">
                    <h3>Erro ao carregar instituições</h3>
                    <p>
                        Não foi possível buscar os dados.
                        Verifique sua conexão e tente novamente.
                    </p>
                </div>
            `;

        } finally {

            btnAtualizar.disabled = false;

        }
    }

    // ==========================================
    // ATUALIZAR RESUMO
    // ==========================================

    function atualizarResumo() {

        const total = todasInstituicoes.length;

        const comEndereco = todasInstituicoes.filter(instituicao => {
            return obterEnderecos(instituicao).length > 0;
        }).length;

        const comContato = todasInstituicoes.filter(instituicao => {

            return obterEnderecos(instituicao).some(endereco => {

                return endereco.telefone &&
                    String(endereco.telefone).trim() !== '';

            });

        }).length;

        totalInstituicoes.textContent = total;
        instituicoesComEndereco.textContent = comEndereco;
        instituicoesComContato.textContent = comContato;
    }

    // ==========================================
    // PREENCHER CATEGORIAS
    // ==========================================

    function preencherCategorias() {

        if (!filtroCategoria) return;

        const categorias = todasInstituicoes
            .map(instituicao => instituicao.categoria || instituicao.tipo)
            .filter(categoria => categoria);

        const categoriasUnicas = [...new Set(categorias)];

        filtroCategoria.innerHTML = `
            <option value="">Todas as categorias</option>
        `;

        categoriasUnicas.sort().forEach(categoria => {

            const opcao = document.createElement('option');

            opcao.value = categoria;
            opcao.textContent = categoria;

            filtroCategoria.appendChild(opcao);

        });
    }

    // ==========================================
    // PESQUISA E FILTROS
    // ==========================================

    function aplicarFiltros() {

        const pesquisa = pesquisaInstituicoes.value
            .trim()
            .toLowerCase();

        const categoriaSelecionada = filtroCategoria
            ? filtroCategoria.value
            : '';

        const filtradas = todasInstituicoes.filter(instituicao => {

            const nome = String(instituicao.nome || '').toLowerCase();

            const descricao = String(instituicao.descricao || '').toLowerCase();

            const enderecos = obterEnderecos(instituicao);

            const textoEndereco = enderecos.map(endereco => {

                return [
                    endereco.logradouro,
                    endereco.bairro,
                    endereco.cidade,
                    endereco.uf,
                    endereco.telefone,
                    endereco.cep
                ].filter(Boolean).join(' ');

            }).join(' ').toLowerCase();

            const correspondePesquisa =
                nome.includes(pesquisa) ||
                descricao.includes(pesquisa) ||
                textoEndereco.includes(pesquisa);

            const categoria =
                instituicao.categoria || instituicao.tipo || '';

            const correspondeCategoria =
                !categoriaSelecionada ||
                categoria === categoriaSelecionada;

            return correspondePesquisa && correspondeCategoria;

        });

        instituicoesExibidas.textContent = filtradas.length;

        contadorInstituicoes.textContent =
            `${filtradas.length} instituição(ões) encontrada(s)`;

        renderizarInstituicoes(filtradas);
    }

    // ==========================================
    // RENDERIZAR INSTITUIÇÕES
    // ==========================================

    function renderizarInstituicoes(instituicoes) {

        listaInstituicoes.innerHTML = '';

        if (instituicoes.length === 0) {

            listaInstituicoes.innerHTML = `
                <div class="estado-vazio-instituicoes">
                    <h3>Nenhuma instituição encontrada</h3>
                    <p>
                        Tente alterar a pesquisa ou os filtros.
                    </p>
                </div>
            `;

            return;
        }

        instituicoes.forEach(instituicao => {

            const card = document.createElement('article');

            card.classList.add('card-instituicao-admin');

            const enderecos = obterEnderecos(instituicao);

            const primeiroEndereco = enderecos[0];

            const enderecoTexto = primeiroEndereco
                ? [
                    primeiroEndereco.logradouro,
                    primeiroEndereco.numero,
                    primeiroEndereco.bairro,
                    primeiroEndereco.cidade,
                    primeiroEndereco.uf
                ].filter(Boolean).join(', ')
                : 'Endereço não cadastrado';

            const telefone = primeiroEndereco?.telefone
                ? primeiroEndereco.telefone
                : 'Telefone não cadastrado';

            const nome = escaparHTML(
                instituicao.nome || 'Instituição sem nome'
            );

            const descricao = escaparHTML(
                instituicao.descricao || 'Sem descrição cadastrada.'
            );

            const enderecoSeguro = escaparHTML(enderecoTexto);
            const telefoneSeguro = escaparHTML(telefone);

            let imagemHTML = '';

            if (instituicao.imagem) {

                imagemHTML = `
                    <img
                        src="${escaparHTML(instituicao.imagem)}"
                        alt="${nome}"
                        class="imagem-instituicao-admin"
                    >
                `;

            } else {

                imagemHTML = `
                    <div class="imagem-instituicao-placeholder">
                        <span>🏢</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="card-instituicao-imagem">
                    ${imagemHTML}
                </div>

                <div class="card-instituicao-conteudo">

                    <h3>${nome}</h3>

                    <p class="descricao-instituicao-admin">
                        ${descricao}
                    </p>

                    <p class="informacao-instituicao-admin">
                        📍 ${enderecoSeguro}
                    </p>

                    <p class="informacao-instituicao-admin">
                        📞 ${telefoneSeguro}
                    </p>

                    <p class="informacao-instituicao-admin">
                        <strong>Endereços:</strong> ${enderecos.length}
                    </p>

                    <div class="acoes-instituicao-admin">

                        <button
                            type="button"
                            class="btn-editar-instituicao"
                            data-codigo="${escaparHTML(instituicao.cod)}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            type="button"
                            class="btn-excluir-instituicao"
                            data-codigo="${escaparHTML(instituicao.cod)}"
                        >
                            🗑️ Excluir
                        </button>

                    </div>

                </div>
            `;

            listaInstituicoes.appendChild(card);

        });
    }

    // ==========================================
    // CRIAR UM BLOCO DE ENDEREÇO
    // ==========================================

    function adicionarEndereco(dadosEndereco = {}) {

        contadorEnderecos++;

        const numeroEndereco = contadorEnderecos;

        const bloco = document.createElement('div');

        bloco.classList.add('bloco-endereco-instituicao');

        bloco.dataset.endereco = numeroEndereco;

        // Guardar código do endereço, quando estiver editando
        if (dadosEndereco.cod) {
            bloco.dataset.cod = dadosEndereco.cod;
        }

        bloco.innerHTML = `
            <div class="cabecalho-endereco-instituicao">

                <h4>Unidade / Endereço ${numeroEndereco}</h4>

                <button
                    type="button"
                    class="btn-remover-endereco"
                >
                    Remover
                </button>

            </div>

            <div class="campos-endereco-instituicao">

                <div class="campo-endereco campo-endereco-largo">
                    <label>Telefone</label>
                    <input
                        type="text"
                        data-campo="telefone"
                        placeholder="Telefone da unidade"
                    >
                </div>

                <div class="campo-endereco campo-cep-endereco">
                    <label>CEP</label>
                    <input
                        type="text"
                        data-campo="cep"
                        maxlength="9"
                        placeholder="00000-000"
                    >
                    <span class="mensagem-cep-endereco"></span>
                </div>

                <div class="campo-endereco">
                    <label>Logradouro</label>
                    <input
                        type="text"
                        data-campo="logradouro"
                        placeholder="Rua ou avenida"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Número</label>
                    <input
                        type="text"
                        data-campo="numero"
                        placeholder="Número"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Complemento</label>
                    <input
                        type="text"
                        data-campo="complemento"
                        placeholder="Sala, bloco..."
                    >
                </div>

                <div class="campo-endereco">
                    <label>Bairro</label>
                    <input
                        type="text"
                        data-campo="bairro"
                        placeholder="Bairro"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Cidade</label>
                    <input
                        type="text"
                        data-campo="cidade"
                        placeholder="Cidade"
                    >
                </div>

                <div class="campo-endereco">
                    <label>UF</label>
                    <input
                        type="text"
                        data-campo="uf"
                        maxlength="2"
                        placeholder="SP"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Dia de funcionamento</label>
                    <input
                        type="text"
                        data-campo="dia_semana"
                        placeholder="Ex.: Segunda a sexta"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Horário de abertura</label>
                    <input
                        type="time"
                        data-campo="horario_inicio"
                    >
                </div>

                <div class="campo-endereco">
                    <label>Horário de fechamento</label>
                    <input
                        type="time"
                        data-campo="horario_fim"
                    >
                </div>

            </div>
        `;

        listaEnderecos.appendChild(bloco);

        // Preencher campos se estiver editando
        Object.entries(dadosEndereco).forEach(([campo, valor]) => {

            const input = bloco.querySelector(`[data-campo="${campo}"]`);

            if (input && valor !== null && valor !== undefined) {
                input.value = valor;
            }

        });

        // Botão remover endereço
        const btnRemover = bloco.querySelector('.btn-remover-endereco');

        btnRemover.addEventListener('click', () => {

            bloco.remove();

            renumerarEnderecos();

        });

        // Consulta ViaCEP ao sair do campo CEP
        const campoCEP = bloco.querySelector('[data-campo="cep"]');

        campoCEP.addEventListener('blur', () => consultarCEP(bloco));

        // Formatar CEP enquanto digita
        campoCEP.addEventListener('input', () => {

            let cep = campoCEP.value.replace(/\D/g, '');

            if (cep.length > 5) {
                cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
            }

            campoCEP.value = cep.substring(0, 9);

        });
    }

    // ==========================================
    // RENUMERAR ENDEREÇOS
    // ==========================================

    function renumerarEnderecos() {

        const blocos = listaEnderecos.querySelectorAll(
            '.bloco-endereco-instituicao'
        );

        blocos.forEach((bloco, index) => {

            bloco.querySelector('h4').textContent =
                `Unidade / Endereço ${index + 1}`;

        });
    }

    // ==========================================
    // CONSULTAR CEP NO VIACEP
    // ==========================================

    async function consultarCEP(bloco) {

        const campoCEP = bloco.querySelector('[data-campo="cep"]');

        const mensagemCEP = bloco.querySelector('.mensagem-cep-endereco');

        const cep = campoCEP.value.replace(/\D/g, '');

        mensagemCEP.textContent = '';
        mensagemCEP.className = 'mensagem-cep-endereco';

        if (cep.length === 0) {
            return;
        }

        if (cep.length !== 8) {

            mensagemCEP.textContent = 'CEP deve conter 8 números.';
            mensagemCEP.classList.add('erro');

            return;
        }

        mensagemCEP.textContent = 'Consultando CEP...';

        try {

            const resposta = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

            if (!resposta.ok) {
                throw new Error('Falha ao consultar o CEP.');
            }

            const dados = await resposta.json();

            if (dados.erro) {

                mensagemCEP.textContent = 'CEP não encontrado.';
                mensagemCEP.classList.add('erro');

                return;
            }

            bloco.querySelector('[data-campo="logradouro"]').value =
                dados.logradouro || '';

            bloco.querySelector('[data-campo="bairro"]').value =
                dados.bairro || '';

            bloco.querySelector('[data-campo="cidade"]').value =
                dados.localidade || '';

            bloco.querySelector('[data-campo="uf"]').value =
                dados.uf || '';

            mensagemCEP.textContent = 'Endereço encontrado!';
            mensagemCEP.classList.add('sucesso');

        } catch (erro) {

            console.error('Erro ao consultar ViaCEP:', erro);

            mensagemCEP.textContent =
                'Não foi possível consultar. Preencha manualmente.';

            mensagemCEP.classList.add('erro');

        }
    }

    // ==========================================
    // ABRIR MODAL PARA CADASTRO
    // ==========================================

    function abrirModal() {

        instituicaoEditando = null;

        formInstituicao.reset();

        listaEnderecos.innerHTML = '';

        contadorEnderecos = 0;

        mensagemFormulario.innerHTML = '';

        tituloModal.textContent = 'Nova instituição';
        btnSalvar.textContent = 'Salvar instituição';

        adicionarEndereco();

        modal.style.display = 'flex';

        document.getElementById('nomeInstituicao').focus();
    }

    // ==========================================
    // ABRIR MODAL PARA EDIÇÃO
    // ==========================================

    function editarInstituicao(codigo) {

        const instituicao = todasInstituicoes.find(item => {
            return String(item.cod) === String(codigo);
        });

        if (!instituicao) {
            alert('Não foi possível encontrar essa instituição.');
            return;
        }

        instituicaoEditando = instituicao.cod;

        formInstituicao.reset();

        listaEnderecos.innerHTML = '';

        contadorEnderecos = 0;

        mensagemFormulario.innerHTML = '';

        tituloModal.textContent = 'Editar instituição';
        btnSalvar.textContent = 'Salvar alterações';

        // Preencher os dados principais
        document.getElementById('nomeInstituicao').value =
            instituicao.nome || '';

        document.getElementById('descricaoInstituicao').value =
            instituicao.descricao || '';

        // Preencher os endereços existentes
        const enderecos = obterEnderecos(instituicao);

        if (enderecos.length > 0) {

            enderecos.forEach(endereco => {
                adicionarEndereco(endereco);
            });

        } else {

            // Se não tiver endereço, criar um bloco vazio
            adicionarEndereco();

        }

        modal.style.display = 'flex';

        document.getElementById('nomeInstituicao').focus();
    }

    // ==========================================
    // FECHAR MODAL
    // ==========================================

    function fecharModal() {

        modal.style.display = 'none';

        formInstituicao.reset();

        listaEnderecos.innerHTML = '';

        contadorEnderecos = 0;

        mensagemFormulario.innerHTML = '';

        instituicaoEditando = null;

        tituloModal.textContent = 'Nova instituição';
        btnSalvar.textContent = 'Salvar instituição';
    }

    // ==========================================
    // MOSTRAR MENSAGEM
    // ==========================================

    function mostrarMensagem(texto, tipo) {

        mensagemFormulario.innerHTML = '';

        const mensagem = document.createElement('div');

        mensagem.className = tipo === 'sucesso'
            ? 'mensagem-sucesso-instituicao'
            : 'mensagem-erro-instituicao';

        mensagem.textContent = texto;

        mensagemFormulario.appendChild(mensagem);
    }

    // ==========================================
    // MONTAR FORM DATA
    // ==========================================

    function montarFormData() {

        const formData = new FormData();

        formData.append(
            'nome',
            document.getElementById('nomeInstituicao').value.trim()
        );

        formData.append(
            'descricao',
            document.getElementById('descricaoInstituicao').value.trim()
        );

        // Imagem (se uma nova foi selecionada)
        const arquivoImagem =
            document.getElementById('imagemInstituicao').files[0];

        if (arquivoImagem) {
            formData.append('imagem', arquivoImagem);
        }

        // Coletar endereços
        const blocos = listaEnderecos.querySelectorAll(
            '.bloco-endereco-instituicao'
        );

        let indiceEndereco = 0;

        blocos.forEach(bloco => {

            const endereco = {};

            bloco.querySelectorAll('[data-campo]').forEach(campo => {

                endereco[campo.dataset.campo] = campo.value.trim();

            });

            const possuiDados = Object.values(endereco).some(valor => {
                return valor !== '';
            });

            if (possuiDados) {

                // Preservar código dos endereços já existentes
                if (bloco.dataset.cod) {

                    formData.append(
                        `enderecos[${indiceEndereco}][cod]`,
                        bloco.dataset.cod
                    );

                }

                Object.entries(endereco).forEach(([campo, valor]) => {

                    formData.append(
                        `enderecos[${indiceEndereco}][${campo}]`,
                        valor
                    );

                });

                indiceEndereco++;

            }
        });

        // Ao editar e remover todos os endereços,
        // enviar um campo vazio para o backend entender
        // que os endereços devem ser removidos.
        if (instituicaoEditando !== null && indiceEndereco === 0) {

            formData.append('enderecos[0][cod]', '0');

        }

        return formData;
    }

    // ==========================================
    // CADASTRAR / ATUALIZAR
    // ==========================================

    async function salvarInstituicao(evento) {

        evento.preventDefault();

        btnSalvar.disabled = true;

        btnSalvar.textContent = instituicaoEditando !== null
            ? 'Atualizando...'
            : 'Salvando...';

        mensagemFormulario.innerHTML = '';

        try {

            const token = obterToken();

            if (!token) {
                throw new Error('Sua sessão expirou. Faça login novamente.');
            }

            const formData = montarFormData();

            let url = `${API_URL}/instituicoes`;
            let metodo = 'POST';

            // Se estiver editando
            if (instituicaoEditando !== null) {

                url = `${API_URL}/instituicoes/${instituicaoEditando}`;

                // Laravel aceita method spoofing para multipart
                formData.append('_method', 'PATCH');

            }

            const resposta = await fetch(url, {

                method: metodo,

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },

                body: formData

            });

            const dados = await resposta.json();

            if (!resposta.ok) {

                let mensagemErro =
                    dados.message || 'Erro ao salvar instituição.';

                if (dados.errors) {

                    mensagemErro = Object.values(dados.errors)
                        .flat()
                        .join(' ');

                }

                throw new Error(mensagemErro);
            }

            const estavaEditando = instituicaoEditando !== null;

            await carregarInstituicoes();

            fecharModal();

            alert(estavaEditando
                ? 'Instituição atualizada com sucesso!'
                : 'Instituição cadastrada com sucesso!');

        } catch (erro) {

            console.error('Erro ao salvar instituição:', erro);

            mostrarMensagem(
                erro.message || 'Não foi possível salvar a instituição.',
                'erro'
            );

        } finally {

            btnSalvar.disabled = false;

            btnSalvar.textContent = instituicaoEditando !== null
                ? 'Salvar alterações'
                : 'Salvar instituição';

        }
    }

    // ==========================================
    // EXCLUIR INSTITUIÇÃO
    // ==========================================

    async function excluirInstituicao(codigo) {

        const instituicao = todasInstituicoes.find(item => {
            return String(item.cod) === String(codigo);
        });

        if (!instituicao) {
            alert('Instituição não encontrada.');
            return;
        }

        const confirmar = confirm(
            `Tem certeza que deseja excluir "${instituicao.nome}"?\n\n` +
            `Essa ação excluirá a instituição e seus endereços cadastrados.`
        );

        if (!confirmar) {
            return;
        }

        try {

            const token = obterToken();

            if (!token) {
                throw new Error('Sua sessão expirou. Faça login novamente.');
            }

            const resposta = await fetch(
                `${API_URL}/instituicoes/${codigo}`,
                {
                    method: 'DELETE',

                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.message || dados.erro ||
                    'Não foi possível excluir a instituição.'
                );
            }

            await carregarInstituicoes();

            alert('Instituição excluída com sucesso!');

        } catch (erro) {

            console.error('Erro ao excluir instituição:', erro);

            alert(erro.message || 'Erro ao excluir instituição.');

        }
    }

    // ==========================================
    // EVENTOS DOS BOTÕES DOS CARDS
    // ==========================================

    listaInstituicoes.addEventListener('click', evento => {

        const btnEditar = evento.target.closest(
            '.btn-editar-instituicao'
        );

        const btnExcluir = evento.target.closest(
            '.btn-excluir-instituicao'
        );

        if (btnEditar) {

            editarInstituicao(btnEditar.dataset.codigo);

        }

        if (btnExcluir) {

            excluirInstituicao(btnExcluir.dataset.codigo);

        }
    });

    // ==========================================
    // EVENTOS GERAIS
    // ==========================================

    pesquisaInstituicoes.addEventListener('input', aplicarFiltros);

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', aplicarFiltros);
    }

    btnAtualizar.addEventListener('click', carregarInstituicoes);

    btnNovaInstituicao.addEventListener('click', abrirModal);

    btnFecharModal.addEventListener('click', fecharModal);

    btnCancelar.addEventListener('click', fecharModal);

    btnAdicionarEndereco.addEventListener('click', () => {
        adicionarEndereco();
    });

    formInstituicao.addEventListener('submit', salvarInstituicao);

    modal.addEventListener('click', evento => {

        if (evento.target === modal) {
            fecharModal();
        }
    });

    document.addEventListener('keydown', evento => {

        if (evento.key === 'Escape' && modal.style.display !== 'none') {
            fecharModal();
        }
    });

    // ==========================================
    // INICIALIZAR
    // ==========================================

    carregarInstituicoes();

});