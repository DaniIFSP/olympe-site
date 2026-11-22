const API_URL = 'https://olympe-api.onrender.com/api';

const formulario = document.getElementById('form-consultar-denuncia');
const campoProtocolo = document.getElementById('protocolo');
const campoCodigo = document.getElementById('codigo_acesso');
const botaoConsultar = document.getElementById('btn-consultar-denuncia');
const resultadoConsulta = document.getElementById('resultado-consulta');

// Classes visuais dos status
function obterClasseStatus(status) {
    switch (status) {
        case 'Pendente':
            return 'status-pendente';

        case 'Em análise':
            return 'status-em-analise';

        case 'Resolvida':
            return 'status-resolvida';

        case 'Arquivada':
            return 'status-arquivada';

        default:
            return '';
    }
}

// Cria informações com segurança
function criarInformacao(rotulo, valor) {
    const paragrafo = document.createElement('p');
    paragrafo.classList.add('informacao-denuncia');

    const destaque = document.createElement('strong');
    destaque.textContent = rotulo;

    paragrafo.appendChild(destaque);

    paragrafo.appendChild(
        document.createTextNode(` ${valor || 'Não informado'}`)
    );

    return paragrafo;
}

// Exibe mensagens na área de resultado
function mostrarMensagem(texto, tipo = 'erro') {
    resultadoConsulta.innerHTML = '';
    resultadoConsulta.style.display = 'block';

    const mensagem = document.createElement('p');
    mensagem.textContent = texto;

    mensagem.classList.add('mensagem-vazia');

    if (tipo === 'erro') {
        mensagem.style.color = '#a32020';
    } else {
        mensagem.style.color = '#24558a';
    }

    resultadoConsulta.appendChild(mensagem);
}

// Exibe os dados do relato consultado
function mostrarDenuncia(denuncia) {
    resultadoConsulta.innerHTML = '';
    resultadoConsulta.style.display = 'block';

    const cartao = document.createElement('article');
    cartao.classList.add('cartao-denuncia');

    // Cabeçalho
    const cabecalho = document.createElement('div');
    cabecalho.classList.add('cabecalho-cartao-denuncia');

    const titulo = document.createElement('h3');
    titulo.textContent = 'Relato encontrado';

    const status = document.createElement('span');
    status.classList.add('status-denuncia');

    const classeStatus = obterClasseStatus(denuncia.status);

    if (classeStatus) {
        status.classList.add(classeStatus);
    }

    status.textContent = denuncia.status || 'Sem status';

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(status);

    cartao.appendChild(cabecalho);

    // Informações
    cartao.appendChild(
        criarInformacao('Protocolo:', denuncia.protocolo)
    );

    cartao.appendChild(
        criarInformacao('Tipo de relato:', denuncia.tipo)
    );

    cartao.appendChild(
        criarInformacao('Descrição:', denuncia.descricao)
    );

    cartao.appendChild(
        criarInformacao('Local:', denuncia.local)
    );

    cartao.appendChild(
        criarInformacao('Data do ocorrido:', denuncia.data_ocorrido)
    );

    cartao.appendChild(
        criarInformacao('Data do registro:', denuncia.data_denuncia)
    );

    // Aviso explicativo
    const aviso = document.createElement('p');
    aviso.classList.add('mensagem-vazia');

    aviso.textContent =
        'O status do relato poderá ser atualizado após a avaliação da equipe Olympe for Safe.';

    cartao.appendChild(aviso);

    resultadoConsulta.appendChild(cartao);
}

// Consulta o relato na API
async function consultarDenuncia(protocolo, codigoAcesso) {
    try {
        botaoConsultar.disabled = true;
        botaoConsultar.textContent = 'CONSULTANDO...';

        mostrarMensagem(
            'Estamos buscando seu relato. Aguarde...',
            'info'
        );

        const resposta = await fetch(
            `${API_URL}/consultar-denuncia`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },

                body: JSON.stringify({
                    protocolo: protocolo,
                    codigo_acesso: codigoAcesso
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                'Protocolo ou código de acesso inválido.'
            );
        }

        if (!dados.denuncia) {
            throw new Error(
                'Não encontramos os dados desse relato.'
            );
        }

        mostrarDenuncia(dados.denuncia);

    } catch (erro) {
        console.error('Erro na consulta:', erro);

        mostrarMensagem(
            erro.message ||
            'Não foi possível consultar seu relato. Tente novamente.'
        );

    } finally {
        botaoConsultar.disabled = false;
        botaoConsultar.textContent = 'CONSULTAR RELATO';
    }
}

// Evento do formulário
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const protocolo = campoProtocolo.value.trim().toUpperCase();
    const codigoAcesso = campoCodigo.value.trim().toUpperCase();

    if (!protocolo || !codigoAcesso) {
        mostrarMensagem(
            'Preencha o protocolo e o código de acesso.'
        );

        return;
    }

    consultarDenuncia(protocolo, codigoAcesso);
});

// Deixa protocolo e código em maiúsculas ao digitar
campoProtocolo.addEventListener('input', function () {
    this.value = this.value.toUpperCase();
});

campoCodigo.addEventListener('input', function () {
    this.value = this.value.toUpperCase();
});