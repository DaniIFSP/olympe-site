
const visualizacaoConta = document.getElementById('visualizacao-conta');
const formConta = document.getElementById('form-conta');

const visualNome = document.getElementById('visual-nome');
const visualEmail = document.getElementById('visual-email');
const visualTelefone = document.getElementById('visual-telefone');

const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoTelefone = document.getElementById('telefone');

const mensagemConta = document.getElementById('mensagem-conta');

const btnEditar = document.getElementById('btn-editar-conta');
const btnCancelar = document.getElementById('btn-cancelar-edicao');
const btnSalvar = document.getElementById('btn-salvar-conta');

let dadosOriginais = null;

// Verifica se existe uma sessão válida no navegador
if (!estaLogado()) {
    window.location.href = 'login.html';
}

// Exibe mensagens
function mostrarMensagem(texto, tipo = '') {
    mensagemConta.textContent = texto;
    mensagemConta.className = tipo;
}

// Exibe a visualização
function mostrarVisualizacao() {
    visualizacaoConta.hidden = false;
    formConta.hidden = true;
}

// Exibe o formulário
function mostrarFormulario() {
    visualizacaoConta.hidden = true;
    formConta.hidden = false;
    mensagemConta.textContent = '';

    campoNome.focus();
}

// Preenche a visualização
function exibirDados(usuario) {
    visualNome.textContent = usuario.nome || 'Não informado';
    visualEmail.textContent = usuario.email || 'Não informado';
    visualTelefone.textContent = usuario.telefone || 'Não informado';
}

// Preenche os campos editáveis
function preencherFormulario(usuario) {
    campoNome.value = usuario.nome || '';
    campoEmail.value = usuario.email || '';
    campoTelefone.value = usuario.telefone || '';
}

// Interpreta a resposta da API de forma segura
async function lerResposta(resposta) {
    const texto = await resposta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch {
        throw new Error(
            'A API retornou uma resposta inesperada. Tente novamente.'
        );
    }
}

// Carrega os dados da usuária
async function carregarDadosUsuario() {
    mostrarMensagem('Carregando seus dados...');

    visualizacaoConta.hidden = true;
    formConta.hidden = true;

    try {
        const resposta = await apiAutenticada('/me');
        const dados = await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                'Não foi possível carregar seus dados.'
            );
        }

        const usuario = dados.usuario;

        if (!usuario) {
            throw new Error(
                'A API não retornou os dados da usuária.'
            );
        }

        dadosOriginais = {
            nome: usuario.nome || '',
            email: usuario.email || '',
            telefone: usuario.telefone || ''
        };

        exibirDados(dadosOriginais);
        preencherFormulario(dadosOriginais);

        mostrarMensagem('');
        mostrarVisualizacao();

    } catch (erro) {
        mostrarMensagem(
            erro.message || 'Erro ao carregar seus dados.',
            'mensagem-erro'
        );
    }
}

// Botão editar
btnEditar.addEventListener('click', () => {
    preencherFormulario(dadosOriginais);
    mostrarFormulario();
});

// Botão cancelar
btnCancelar.addEventListener('click', () => {
    preencherFormulario(dadosOriginais);
    mostrarMensagem('');
    mostrarVisualizacao();
});

// Salvar alterações
formConta.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const telefone = campoTelefone.value.trim();

    if (!nome || !email || !telefone) {
        mostrarMensagem(
            'Preencha todos os campos.',
            'mensagem-erro'
        );
        return;
    }

    const dadosAtualizados = {
        nome,
        email,
        telefone
    };

    btnSalvar.disabled = true;
    btnCancelar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    mostrarMensagem('Enviando alterações...');

    try {
        const resposta = await apiAutenticada('/usuario', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });

        const dados = await lerResposta(resposta);

        if (!resposta.ok) {
            let mensagemErro =
                dados.mensagem ||
                dados.message ||
                'Não foi possível atualizar seus dados.';

            if (dados.errors) {
                mensagemErro = Object.values(dados.errors)
                    .flat()
                    .join(' ');
            }

            throw new Error(mensagemErro);
        }

        // Atualiza os dados da sessão
        const usuarioAtual = obterUsuario();

        if (usuarioAtual) {
            const usuarioAtualizado = {
                ...usuarioAtual,
                ...dadosAtualizados,
                ...(dados.usuario || {})
            };

            localStorage.setItem(
                'olympe_usuario',
                JSON.stringify(usuarioAtualizado)
            );
        }

        // Atualiza a tela
        dadosOriginais = {
            nome,
            email,
            telefone
        };

        exibirDados(dadosOriginais);
        preencherFormulario(dadosOriginais);

        mostrarVisualizacao();

        mostrarMensagem(
            'Seus dados foram atualizados com sucesso!',
            'mensagem-sucesso'
        );

    } catch (erro) {
        console.error('Erro ao atualizar conta:', erro);

        mostrarMensagem(
            erro.message || 'Erro ao salvar as alterações.',
            'mensagem-erro'
        );

    } finally {
        btnSalvar.disabled = false;
        btnCancelar.disabled = false;
        btnSalvar.textContent = 'Salvar alterações';
    }
});

// Inicialização
carregarDadosUsuario();
