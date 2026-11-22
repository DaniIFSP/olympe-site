
/* ==========================================
   GERENCIAMENTO DA EQUIPE
   Olympe for Safe
========================================== */


/* PROTEÇÃO DA PÁGINA */

if (!estaLogado() || !admin()) {
    window.location.href = "admin.html";
}


/* ELEMENTOS HTML */

const listaEquipe = document.getElementById("lista-equipe");
const pesquisaEquipe = document.getElementById("pesquisa-equipe");
const contadorEquipe = document.getElementById("contador-equipe");
const mensagemLista = document.getElementById("mensagem-lista");

const formEquipe = document.getElementById("form-equipe");
const mensagemCadastro = document.getElementById("mensagem-cadastro");
const botaoCadastrar = document.getElementById("botao-cadastrar");

const modalEdicao = document.getElementById("modal-edicao");
const formEdicao = document.getElementById("form-edicao");
const mensagemEdicao = document.getElementById("mensagem-edicao");

const editarCod = document.getElementById("editar-cod");
const editarNome = document.getElementById("editar-nome");
const editarIdade = document.getElementById("editar-idade");
const editarEmail = document.getElementById("editar-email");
const editarTelefone = document.getElementById("editar-telefone");
const editarTipo = document.getElementById("editar-tipo");

const botaoSalvarEdicao =
    document.getElementById("botao-salvar-edicao");


/* ARMAZENAR MEMBROS */

let membrosEquipe = [];


/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */


/* INTERPRETAR STATUS DO BANCO */

function membroEstaAtivo(membro) {

    // Banco de dados:
    // 1 = ativo
    // 0 = desativado

    return membro.ativo == 1;

}


/* MOSTRAR MENSAGENS */

function mostrarMensagem(elemento, texto, tipo = "") {

    elemento.textContent = texto;

    elemento.className = "";

    if (tipo === "sucesso") {
        elemento.classList.add("mensagem-sucesso");
    }

    if (tipo === "erro") {
        elemento.classList.add("mensagem-erro");
    }

}


/* TRATAR ERROS DA API */

async function obterMensagemErro(resposta) {

    try {

        const dados = await resposta.json();

        if (dados.mensagem) {
            return dados.mensagem;
        }

        if (dados.message) {
            return dados.message;
        }

        if (dados.errors) {

            return Object.values(dados.errors)
                .flat()
                .join(" ");

        }

        return "Não foi possível realizar a operação.";

    } catch {

        return "Não foi possível realizar a operação.";

    }

}


/* CRIAR ELEMENTOS HTML */

function criarElemento(tag, classe = "", texto = "") {

    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== "") {
        elemento.textContent = texto;
    }

    return elemento;

}


/* ==========================================
   CARREGAR MEMBROS
========================================== */

async function carregarEquipe() {

    listaEquipe.innerHTML = "Carregando membros...";

    mostrarMensagem(mensagemLista, "");

    try {

        const resposta = await apiAutenticada("/funcionarios");

        if (!resposta.ok) {
            throw new Error(await obterMensagemErro(resposta));
        }

        const dados = await resposta.json();

        console.log("Resposta da API:", dados);

        membrosEquipe = Array.isArray(dados)
            ? dados
            : (dados.data || dados.funcionarios || []);

        console.log("Membros carregados:", membrosEquipe);

        membrosEquipe.forEach(membro => {
            console.log(
                "Nome:",
                membro.nome,
                "| Código:",
                membro.cod,
                "| Status recebido:",
                membro.ativo
            );
        });

        renderizarEquipe();

    } catch (erro) {

        listaEquipe.innerHTML = "";

        listaEquipe.appendChild(
            criarElemento(
                "p",
                "mensagem-erro",
                erro.message || "Erro ao carregar membros."
            )
        );

        contadorEquipe.textContent = "";

    }

}


/* ==========================================
   EXIBIR MEMBROS
========================================== */

function renderizarEquipe() {

    listaEquipe.innerHTML = "";

    const termo = pesquisaEquipe.value
        .trim()
        .toLowerCase();

    const filtrados = membrosEquipe.filter(membro => {

        const texto = [
            membro.nome,
            membro.email,
            membro.telefone,
            membro.tipo
        ].join(" ").toLowerCase();

        return texto.includes(termo);

    });


    contadorEquipe.textContent =
        `${filtrados.length} membro(s) encontrado(s).`;


    if (filtrados.length === 0) {

        listaEquipe.appendChild(
            criarElemento(
                "p",
                "",
                "Nenhum membro encontrado."
            )
        );

        return;

    }


    filtrados.forEach(membro => {

        const ativo = membroEstaAtivo(membro);


        /* CARD */

        const card = document.createElement("details");

        card.className = "membro-equipe";


        /* CABEÇALHO */

        const resumo = document.createElement("summary");

        const cabecalho = criarElemento(
            "div",
            "cabecalho-membro"
        );


        const nome = criarElemento(
            "span",
            "nome-membro",
            membro.nome || "Nome não informado"
        );


        const status = criarElemento(
            "span",
            `status-membro ${ativo ? "status-ativo" : "status-inativo"}`,
            ativo ? "Ativo" : "Desativado"
        );


        cabecalho.appendChild(nome);
        cabecalho.appendChild(status);


        const informacoes = criarElemento(
            "div",
            "informacoes-resumo",
            `${membro.email || ""} • ${
                membro.tipo === "administrador"
                    ? "Administrador"
                    : "Funcionário"
            }`
        );


        resumo.appendChild(cabecalho);
        resumo.appendChild(informacoes);

        card.appendChild(resumo);


        /* DETALHES */

        const detalhes = criarElemento(
            "div",
            "detalhes-membro"
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `Nome: ${membro.nome || "Não informado"}`
            )
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `E-mail: ${membro.email || "Não informado"}`
            )
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `Telefone: ${membro.telefone || "Não informado"}`
            )
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `Idade: ${membro.idade ?? "Não informada"}`
            )
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `Perfil: ${
                    membro.tipo === "administrador"
                        ? "Administrador"
                        : "Funcionário"
                }`
            )
        );


        detalhes.appendChild(
            criarElemento(
                "p",
                "",
                `Situação: ${ativo ? "Ativo" : "Desativado"}`
            )
        );


        /* BOTÕES */

        const acoes = criarElemento(
            "div",
            "acoes-membro"
        );


        const botaoEditar = criarElemento(
            "button",
            "botao-editar",
            "Editar"
        );

        botaoEditar.type = "button";

        botaoEditar.dataset.acao = "editar";

        botaoEditar.dataset.cod = membro.cod;


        const botaoSituacao = criarElemento(
            "button",
            ativo ? "botao-desativar" : "botao-reativar",
            ativo ? "Desativar" : "Reativar"
        );

        botaoSituacao.type = "button";

        botaoSituacao.dataset.acao = "situacao";

        botaoSituacao.dataset.cod = membro.cod;


        acoes.appendChild(botaoEditar);

        acoes.appendChild(botaoSituacao);

        detalhes.appendChild(acoes);

        card.appendChild(detalhes);

        listaEquipe.appendChild(card);

    });

}


/* ==========================================
   PESQUISAR
========================================== */

pesquisaEquipe.addEventListener(
    "input",
    renderizarEquipe
);


/* ==========================================
   ATUALIZAR LISTA
========================================== */

document
    .getElementById("botao-atualizar")
    .addEventListener("click", carregarEquipe);


/* ==========================================
   ABRIR MODAL DE EDIÇÃO
========================================== */

function abrirModalEdicao(membro) {

    editarCod.value = membro.cod;

    editarNome.value = membro.nome || "";

    editarIdade.value = membro.idade ?? "";

    editarEmail.value = membro.email || "";

    editarTelefone.value = membro.telefone || "";

    editarTipo.value = membro.tipo || "funcionario";


    mostrarMensagem(mensagemEdicao, "");

    modalEdicao.classList.add("aberto");

    document.body.style.overflow = "hidden";

    editarNome.focus();

}


/* ==========================================
   FECHAR MODAL
========================================== */

function fecharModalEdicao() {

    modalEdicao.classList.remove("aberto");

    document.body.style.overflow = "";

    formEdicao.reset();

    editarCod.value = "";

    mostrarMensagem(mensagemEdicao, "");

}


document
    .getElementById("fechar-modal")
    .addEventListener("click", fecharModalEdicao);


document
    .getElementById("cancelar-edicao")
    .addEventListener("click", fecharModalEdicao);


/* FECHAR CLICANDO NO FUNDO */

modalEdicao.addEventListener("click", function(evento) {

    if (evento.target === modalEdicao) {
        fecharModalEdicao();
    }

});


/* FECHAR COM ESC */

document.addEventListener("keydown", function(evento) {

    if (
        evento.key === "Escape" &&
        modalEdicao.classList.contains("aberto")
    ) {

        fecharModalEdicao();

    }

});


/* ==========================================
   BOTÕES EDITAR E ATIVAR/DESATIVAR
========================================== */

listaEquipe.addEventListener("click", async function(evento) {

    const botao = evento.target.closest("button[data-acao]");

    if (!botao) {
        return;
    }


    const cod = botao.dataset.cod;

    const acao = botao.dataset.acao;


    const membro = membrosEquipe.find(
        item => String(item.cod) === String(cod)
    );


    if (!membro) {
        return;
    }


    /* EDITAR */

    if (acao === "editar") {

        abrirModalEdicao(membro);

        return;

    }


    /* ATIVAR OU DESATIVAR */

    if (acao === "situacao") {

        const ativoAtual = membroEstaAtivo(membro);

        const novoStatus = !ativoAtual;


        const confirmacao = novoStatus
            ? `Deseja reativar ${membro.nome}?`
            : `Deseja desativar ${membro.nome}?`;


        if (!confirm(confirmacao)) {
            return;
        }


        botao.disabled = true;


        try {

            const resposta = await apiAutenticada(
                `/funcionarios/${cod}/situacao`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        ativo: novoStatus
                    })
                }
            );


            if (!resposta.ok) {

                throw new Error(
                    await obterMensagemErro(resposta)
                );

            }


            mostrarMensagem(
                mensagemLista,
                novoStatus
                    ? "Membro reativado com sucesso!"
                    : "Membro desativado com sucesso!",
                "sucesso"
            );


            await carregarEquipe();


        } catch (erro) {

            mostrarMensagem(
                mensagemLista,
                erro.message || "Erro ao alterar situação.",
                "erro"
            );

            botao.disabled = false;

        }

    }

});


/* ==========================================
   SALVAR EDIÇÃO
========================================== */

formEdicao.addEventListener("submit", async function(evento) {

    evento.preventDefault();


    const cod = editarCod.value;

    if (!cod) {
        return;
    }


    botaoSalvarEdicao.disabled = true;

    botaoSalvarEdicao.textContent = "Salvando...";


    mostrarMensagem(mensagemEdicao, "");


    const dados = {

        nome: editarNome.value.trim(),

        email: editarEmail.value.trim(),

        telefone: editarTelefone.value.trim(),

        tipo: editarTipo.value,

        idade: editarIdade.value === ""
            ? null
            : Number(editarIdade.value)

    };


    try {

        const resposta = await apiAutenticada(
            `/funcionarios/${cod}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)
            }
        );


        if (!resposta.ok) {

            throw new Error(
                await obterMensagemErro(resposta)
            );

        }


        fecharModalEdicao();


        mostrarMensagem(
            mensagemLista,
            "Dados atualizados com sucesso!",
            "sucesso"
        );


        await carregarEquipe();


    } catch (erro) {

        mostrarMensagem(
            mensagemEdicao,
            erro.message || "Erro ao salvar alterações.",
            "erro"
        );

    } finally {

        botaoSalvarEdicao.disabled = false;

        botaoSalvarEdicao.textContent = "Salvar alterações";

    }

});


/* ==========================================
   CADASTRAR MEMBRO
========================================== */

formEquipe.addEventListener("submit", async function(evento) {

    evento.preventDefault();


    botaoCadastrar.disabled = true;

    botaoCadastrar.textContent = "Cadastrando...";


    mostrarMensagem(mensagemCadastro, "");


    const dados = {

        nome: document
            .getElementById("nome-equipe")
            .value.trim(),

        email: document
            .getElementById("email-equipe")
            .value.trim(),

        telefone: document
            .getElementById("telefone-equipe")
            .value.trim(),

        senha: document
            .getElementById("senha-equipe")
            .value,

        tipo: document
            .getElementById("tipo-equipe")
            .value,

        idade: document
            .getElementById("idade-equipe")
            .value === ""
                ? null
                : Number(
                    document
                        .getElementById("idade-equipe")
                        .value
                )

    };


    try {

        const resposta = await apiAutenticada(
            "/funcionarios",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)
            }
        );


        if (!resposta.ok) {

            throw new Error(
                await obterMensagemErro(resposta)
            );

        }


        formEquipe.reset();


        mostrarMensagem(
            mensagemCadastro,
            "Membro cadastrado com sucesso!",
            "sucesso"
        );


        await carregarEquipe();


    } catch (erro) {

        mostrarMensagem(
            mensagemCadastro,
            erro.message || "Erro ao cadastrar membro.",
            "erro"
        );

    } finally {

        botaoCadastrar.disabled = false;

        botaoCadastrar.textContent = "Cadastrar membro";

    }

});


/* ==========================================
   INICIAR PÁGINA
========================================== */

carregarEquipe();
