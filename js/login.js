const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch(formLogin.action, {
            method: formLogin.method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || dados.message || 'E-mail ou senha inválidos.');
            return;
        }

        // Salva o login utilizando a função centralizada
        salvarSessao(dados.token, dados.usuario);

        // Redireciona de acordo com o tipo de usuário
        if (dados.usuario.tipo === 'administrador') {
            window.location.href = 'funcionarios.html';
        } else {
            window.location.href = '../index.html';
        }

    } catch (erro) {
        console.error('Erro real no login:', erro);

        alert('Erro ao concluir login: ' + erro.message);
    }
});