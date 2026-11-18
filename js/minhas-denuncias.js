
const API_URL = 'https://olympe-api.onrender.com/api';

const token = localStorage.getItem('olympe_token');

const listaDenuncias = document.getElementById('lista-denuncias');
const quantidadeDenuncias = document.getElementById('quantidade-denuncias');

// Verifica se existe uma sessão.
if (!token) {
    window.location.href = 'login.html';
}

// Define a classe visual de cada status.
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

// Cria um elemento de texto.
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

// Cria o cartão de cada denúncia.
function criarCartaoDenuncia(denuncia) {
    const cartao = document.createElement('article');
    cartao.classList.add('cartao-denuncia');

    const cabecalho = document.createElement('div');
    cabecalho.classList.add('cabecalho-cartao-denuncia');

    const titulo = document.createElement('h3');
    titulo.textContent = `Denúncia #${denuncia.cod}`;

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

    cartao.appendChild(
        criarInformacao('Tipo:', denuncia.tipo)
    );

    cartao.appendChild(
        criarInformacao('Data:', denuncia.data_denuncia)
    );

    cartao.appendChild(
        criarInformacao('Descrição:', denuncia.descricao)
    );

    return cartao;
}

// Busca as denúncias da usuária autenticada.
async function listarMinhasDenuncias() {
    try {
        const resposta = await fetch(
            `${API_URL}/minhas-denuncias`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const dados = await resposta.json();

        if (resposta.status === 401) {
            localStorage.removeItem('olympe_token');
            localStorage.removeItem('olympe_usuario');

            window.location.href = 'login.html';
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                'Não foi possível carregar suas denúncias.'
            );
        }

        const denuncias = dados.denuncias || [];

        listaDenuncias.innerHTML = '';

        quantidadeDenuncias.textContent =
            `${denuncias.length} denúncia(s)`;

        if (denuncias.length === 0) {
            const mensagem = document.createElement('p');

            mensagem.classList.add('mensagem-vazia');

            mensagem.textContent =
                'Você ainda não possui denúncias cadastradas.';

            listaDenuncias.appendChild(mensagem);

            return;
        }

        denuncias.forEach((denuncia) => {
            const cartao = criarCartaoDenuncia(denuncia);

            listaDenuncias.appendChild(cartao);
        });

    } catch (error) {
        console.error(error);

        listaDenuncias.innerHTML = '';

        quantidadeDenuncias.textContent = '';

        alert(
            error.message ||
            'Não foi possível conectar à API.'
        );

        const mensagem = document.createElement('p');

        mensagem.classList.add('mensagem-vazia');
        mensagem.textContent =
            'Não foi possível carregar suas denúncias. Tente novamente.';

        listaDenuncias.appendChild(mensagem);
    }
}

if (token) {
    listarMinhasDenuncias();
}