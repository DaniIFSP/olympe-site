const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    const url = formLogin.action;

    try {
        const resposta = await fetch( url, {
                method: formLogin.method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(
                dados.mensagem ||
                dados.message ||
                'E-mail ou senha inválidos.'
            );
            return;
        }

        localStorage.setItem(
            'olympe_token',
            dados.token
        );

        localStorage.setItem(
            'olympe_usuario',
            JSON.stringify(dados.usuario)
        );

        if (dados.usuario?.tipo === 'administrador') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'usuario.html';
        }

    } catch (error) {
        alert(
            'Não foi possível conectar à API.' +
            'Verifique sua conexão e tente novamente.'
        );
    }
});
