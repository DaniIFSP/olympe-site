
const API_URL = "https://olympe-api.onrender.com/api";

const formEmail = document.getElementById("form-email");
const campoEmail = document.getElementById("email-recuperacao");
const mensagemEmail = document.getElementById("mensagem-email");

const etapaEmail = document.getElementById("etapa-email");
const etapaCodigo = document.getElementById("etapa-codigo");
const etapaSenha = document.getElementById("etapa-senha");

let emailRecuperacao = "";

formEmail.addEventListener("submit", async (event) => {
    event.preventDefault();

    emailRecuperacao = campoEmail.value.trim();

    mensagemEmail.textContent = "Enviando código...";
    mensagemEmail.style.color = "#4d065f";

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
        mensagemEmail.style.color = "green";

        // Avança para a etapa do código
        etapaEmail.hidden = true;
        etapaCodigo.hidden = false;

    } catch (erro) {
        mensagemEmail.textContent =
            erro.message || "Erro ao enviar o código. Tente novamente.";

        mensagemEmail.style.color = "red";

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
    mensagemCodigo.style.color = "#4d065f";

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
        mensagemCodigo.style.color = "green";

        // Avança para a etapa da nova senha
        etapaCodigo.hidden = true;
        etapaSenha.hidden = false;

    } catch (erro) {
        mensagemCodigo.textContent =
            erro.message || "Erro ao verificar o código.";

        mensagemCodigo.style.color = "red";

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
        mensagemSenha.style.color = "red";
        return;
    }

    // Verifica o tamanho da senha
    if (novaSenha.length < 8) {
        mensagemSenha.textContent =
            "A senha deve ter pelo menos 8 caracteres.";

        mensagemSenha.style.color = "red";
        return;
    }

    mensagemSenha.textContent = "Alterando senha...";
    mensagemSenha.style.color = "#4d065f";

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
        mensagemSenha.style.color = "green";

        // Esconde o formulário após o sucesso
        formSenha.style.display = "none";

        // Cria um link para voltar ao login
        const linkLogin = document.createElement("a");
        linkLogin.href = "login.html";
        linkLogin.textContent = "Ir para o login";
        linkLogin.style.display = "block";
        linkLogin.style.textAlign = "center";
        linkLogin.style.marginTop = "20px";

        mensagemSenha.insertAdjacentElement("afterend", linkLogin);

    } catch (erro) {
        mensagemSenha.textContent =
            erro.message || "Erro ao alterar a senha.";

        mensagemSenha.style.color = "red";

    } finally {
        botao.disabled = false;
        botao.textContent = "ALTERAR SENHA";
    }
});
