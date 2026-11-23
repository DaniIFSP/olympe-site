
const API_URL = "https://olympe-api.onrender.com/api";

const formEmail = document.getElementById("form-email");
const campoEmail = document.getElementById("email-recuperacao");
const mensagemEmail = document.getElementById("mensagem-email");

const etapaEmail = document.getElementById("etapa-email");
const etapaCodigo = document.getElementById("etapa-codigo");
const etapaSenha = document.getElementById("etapa-senha");

let emailRecuperacao = "";

function definirTipoMensagem(elemento, tipo) {
    elemento.classList.remove("mensagem-erro", "mensagem-sucesso", "mensagem-info");
    elemento.classList.add(tipo);
}

formEmail.addEventListener("submit", async (event) => {
    event.preventDefault();

    emailRecuperacao = campoEmail.value.trim();

    mensagemEmail.textContent = "Enviando código...";
    definirTipoMensagem(mensagemEmail, "mensagem-info");

    const botao = formEmail.querySelector("button");
    botao.disabled = true;
    botao.textContent = "ENVIANDO...";

    try {
        const resposta = await fetch(`${API_URL}/recuperar-senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: emailRecuperacao
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.message || "Não foi possível solicitar o código."
            );
        }

        mensagemEmail.textContent = dados.mensagem;
        definirTipoMensagem(mensagemEmail, "mensagem-sucesso");

        // Avança para a etapa do código
        etapaEmail.hidden = true;
        etapaCodigo.hidden = false;

    } catch (erro) {
        mensagemEmail.textContent =
            erro.message || "Erro ao enviar o código. Tente novamente.";

        definirTipoMensagem(mensagemEmail, "mensagem-erro");

    } finally {
        botao.disabled = false;
        botao.textContent = "ENVIAR CÓDIGO";
    }
});



const formCodigo = document.getElementById("form-codigo");
const campoCodigo = document.getElementById("codigo-recuperacao");
const mensagemCodigo = document.getElementById("mensagem-codigo");

formCodigo.addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = campoCodigo.value.trim();

    mensagemCodigo.textContent = "Verificando código...";
    definirTipoMensagem(mensagemCodigo, "mensagem-info");

    const botao = formCodigo.querySelector("button[type='submit']");
    botao.disabled = true;
    botao.textContent = "VERIFICANDO...";

    try {
        const resposta = await fetch(`${API_URL}/verificar-codigo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: emailRecuperacao,
                codigo: codigo
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.message || dados.mensagem ||
                "Código inválido. Tente novamente."
            );
        }

        mensagemCodigo.textContent = dados.mensagem;
        definirTipoMensagem(mensagemCodigo, "mensagem-sucesso");

        // Avança para a etapa da nova senha
        etapaCodigo.hidden = true;
        etapaSenha.hidden = false;

    } catch (erro) {
        mensagemCodigo.textContent =
            erro.message || "Erro ao verificar o código.";

        definirTipoMensagem(mensagemCodigo, "mensagem-erro");

    } finally {
        botao.disabled = false;
        botao.textContent = "VERIFICAR CÓDIGO";
    }
});



const formSenha = document.getElementById("form-senha");
const campoNovaSenha = document.getElementById("nova-senha");
const campoConfirmarSenha = document.getElementById("confirmar-senha");
const mensagemSenha = document.getElementById("mensagem-senha");

formSenha.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novaSenha = campoNovaSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    // Verifica se as senhas são iguais
    if (novaSenha !== confirmarSenha) {
        mensagemSenha.textContent = "As senhas não coincidem.";
        definirTipoMensagem(mensagemSenha, "mensagem-erro");
        return;
    }

    // Verifica o tamanho da senha
    if (novaSenha.length < 8) {
        mensagemSenha.textContent =
            "A senha deve ter pelo menos 8 caracteres.";

        definirTipoMensagem(mensagemSenha, "mensagem-erro");
        return;
    }

    mensagemSenha.textContent = "Alterando senha...";
    definirTipoMensagem(mensagemSenha, "mensagem-info");

    const botao = formSenha.querySelector("button[type='submit']");
    botao.disabled = true;
    botao.textContent = "ALTERANDO...";

    try {
        const resposta = await fetch(`${API_URL}/redefinir-senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: emailRecuperacao,
                senha: novaSenha,
                senha_confirmation: confirmarSenha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.message || dados.mensagem ||
                "Não foi possível alterar a senha."
            );
        }

        mensagemSenha.textContent = dados.mensagem;
        definirTipoMensagem(mensagemSenha, "mensagem-sucesso");

        // Esconde o formulário após o sucesso
        formSenha.hidden = true;

        // Cria um link para voltar ao login
        const linkLogin = document.createElement("a");
        linkLogin.href = "login.html";
        linkLogin.textContent = "Ir para o login";
        linkLogin.classList.add("link-login-recuperacao");

        mensagemSenha.insertAdjacentElement("afterend", linkLogin);

    } catch (erro) {
        mensagemSenha.textContent =
            erro.message || "Erro ao alterar a senha.";

        definirTipoMensagem(mensagemSenha, "mensagem-erro");

    } finally {
        botao.disabled = false;
        botao.textContent = "ALTERAR SENHA";
    }
});
