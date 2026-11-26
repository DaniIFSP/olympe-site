
const formEncomenda = document.getElementById('formEncomendaDispositivo');

if (formEncomenda) {
    formEncomenda.addEventListener('submit', async (event) => {
        event.preventDefault();

        const botaoEnviar = formEncomenda.querySelector('button[type="submit"]');
        const mensagem = document.getElementById('mensagemEncomenda');

        botaoEnviar.disabled = true;
        botaoEnviar.textContent = 'Enviando...';
        mensagem.textContent = '';

        const dados = {
            nome: document.getElementById('nomeEncomenda').value.trim(),
            email: document.getElementById('emailEncomenda').value.trim(),
            cidade: document.getElementById('cidadeEncomenda').value.trim(),
            estado: document.getElementById('estadoEncomenda').value.trim().toUpperCase(),
            quantidade: Number(document.getElementById('quantidadeEncomenda').value),
            observacoes: document.getElementById('observacoesEncomenda').value.trim(),
            autorizacao: document.getElementById('autorizacaoContato').checked
        };

        try {
            const resposta = await fetch(`${API_URL}/encomendar`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            const retorno = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    retorno.mensagem ||
                    retorno.message ||
                    'Não foi possível enviar sua manifestação.'
                );
            }

            mensagem.textContent =
                'Interesse registrado com sucesso! Agradecemos pelo seu interesse no dispositivo Olympe. Quando tivermos novidades sobre disponibilidade, valores e envio, entraremos em contato pelo e-mail informado, caso você tenha autorizado o contato.';

            mensagem.style.color = 'green';

            formEncomenda.reset();

        } catch (erro) {
            console.error('Erro ao enviar manifestação:', erro);

            mensagem.textContent =
                'Não foi possível enviar sua manifestação no momento. Tente novamente mais tarde.';

            mensagem.style.color = 'red';

        } finally {
            botaoEnviar.disabled = false;
            botaoEnviar.textContent = 'Enviar manifestação de interesse';
        }
    });
}
