let mapa;
let marcador;
let geocoder;

// API
const API_URL = "https://olympe-api.onrender.com/api";

// Inicialização chamada pelo Google Maps
function initMap() {

    // Localização inicial: São Paulo
    const localInicial = {
        lat: -23.550520,
        lng: -46.633308
    };

    mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: localInicial,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
    });

    geocoder = new google.maps.Geocoder();

    // Clique no mapa seleciona a localização
    mapa.addListener("click", function (evento) {
        selecionarLocal(
            evento.latLng.lat(),
            evento.latLng.lng()
        );
    });

    // Botão de localização atual
    const botaoLocalizacao = document.getElementById("btn-localizacao");

    if (botaoLocalizacao) {
        botaoLocalizacao.addEventListener("click", obterLocalizacaoAtual);
    }

    // Botão de pesquisa de endereço
    const botaoBuscarLocal = document.getElementById("btn-buscar-local");

    if (botaoBuscarLocal) {
        botaoBuscarLocal.addEventListener("click", pesquisarLocalPorEndereco);
    }

    // Pesquisar endereço ao apertar Enter
    const campoLocal = document.getElementById("local");

    if (campoLocal) {
        campoLocal.addEventListener("keydown", function (evento) {

            if (evento.key === "Enter") {
                evento.preventDefault();
                pesquisarLocalPorEndereco();
            }

        });
    }

    // Configurar formulário
    configurarFormulario();
}


// ================================
// SELECIONAR LOCAL NO MAPA
// ================================

function selecionarLocal(latitude, longitude) {

    const coordenadas = {
        lat: latitude,
        lng: longitude
    };

    // Criar ou mover marcador
    if (marcador) {

        marcador.setPosition(coordenadas);

    } else {

        marcador = new google.maps.Marker({
            position: coordenadas,
            map: mapa,
            draggable: true,
            title: "Local selecionado"
        });

        // Permite arrastar o marcador
        marcador.addListener("dragend", function () {

            const novaPosicao = marcador.getPosition();

            selecionarLocal(
                novaPosicao.lat(),
                novaPosicao.lng()
            );

        });

    }

    // Centralizar mapa
    mapa.setCenter(coordenadas);
    mapa.setZoom(17);

    // Preencher latitude e longitude
    document.getElementById("latitude").value = latitude;
    document.getElementById("longitude").value = longitude;

    document.getElementById("status-localizacao").textContent =
        "Local selecionado com sucesso.";

    // Buscar endereço
    buscarEndereco(latitude, longitude);
}


// ================================
// BUSCAR ENDEREÇO
// ================================

function buscarEndereco(latitude, longitude) {

    const coordenadas = {
        lat: latitude,
        lng: longitude
    };

    geocoder.geocode(
        { location: coordenadas },
        function (resultados, status) {

            if (status === "OK" && resultados.length > 0) {

                document.getElementById("local").value =
                    resultados[0].formatted_address;

            } else {

                document.getElementById("local").value =
                    latitude.toFixed(6) + ", " + longitude.toFixed(6);

            }

        }
    );
}

// ================================
// PESQUISAR LOCAL PELO ENDEREÇO
// ================================

function pesquisarLocalPorEndereco() {

    const campoLocal = document.getElementById("local");
    const botaoBuscar = document.getElementById("btn-buscar-local");
    const status = document.getElementById("status-localizacao");

    const endereco = campoLocal.value.trim();

    if (!endereco) {
        status.textContent = "Digite um endereço para pesquisar.";
        campoLocal.focus();
        return;
    }

    status.textContent = "Pesquisando endereço...";
    botaoBuscar.disabled = true;

    geocoder.geocode(
        { address: endereco },
        function (resultados, statusGoogle) {

            botaoBuscar.disabled = false;

            if (
                statusGoogle === "OK" &&
                resultados &&
                resultados.length > 0
            ) {

                const resultado = resultados[0];
                const coordenadas = resultado.geometry.location;

                selecionarLocal(
                    coordenadas.lat(),
                    coordenadas.lng()
                );

                campoLocal.value = resultado.formatted_address;

                status.textContent =
                    "Endereço encontrado! Confira se o marcador está no local correto.";

            } else {

                status.textContent =
                    "Não encontramos esse endereço. Tente informar uma rua, número, bairro ou cidade.";

            }

        }
    );
}


// ================================
// LOCALIZAÇÃO ATUAL
// ================================

function obterLocalizacaoAtual() {

    const status = document.getElementById("status-localizacao");
    const botao = document.getElementById("btn-localizacao");

    if (!navigator.geolocation) {

        status.textContent =
            "Seu navegador não permite obter localização.";

        return;
    }

    status.textContent = "Obtendo sua localização...";
    botao.disabled = true;

    navigator.geolocation.getCurrentPosition(

        function (posicao) {

            const latitude = posicao.coords.latitude;
            const longitude = posicao.coords.longitude;

            selecionarLocal(latitude, longitude);

            botao.disabled = false;
        },

        function (erro) {

            botao.disabled = false;

            switch (erro.code) {

                case erro.PERMISSION_DENIED:
                    status.textContent =
                        "Você não autorizou o acesso à localização. Você pode selecionar o ponto manualmente no mapa.";
                    break;

                case erro.POSITION_UNAVAILABLE:
                    status.textContent =
                        "Não foi possível identificar sua localização. Selecione o ponto manualmente no mapa.";
                    break;

                case erro.TIMEOUT:
                    status.textContent =
                        "A solicitação de localização demorou muito. Tente novamente.";
                    break;

                default:
                    status.textContent =
                        "Ocorreu um erro ao obter sua localização.";
                    break;
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


// ================================
// FORMULÁRIO DE DENÚNCIA
// ================================

function configurarFormulario() {

    const formulario = document.getElementById("form-denuncia");

    if (!formulario) {
        console.error("Formulário #form-denuncia não encontrado.");
        return;
    }

    // Criar área de mensagens, se não existir
    let mensagem = document.getElementById("mensagem-envio");

    if (!mensagem) {

        mensagem = document.createElement("div");
        mensagem.id = "mensagem-envio";

        mensagem.classList.add("mensagem-mapeamento");
        mensagem.hidden = true;

        formulario.appendChild(mensagem);
    }

    formulario.addEventListener("submit", async function (evento) {

        evento.preventDefault();

        const botaoEnviar = formulario.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const tipo = document.getElementById("tipo").value;
        const descricao = document.getElementById("descricao").value;
        const local = document.getElementById("local").value;
        const dataOcorrido = document.getElementById("data_ocorrido").value;
        const email = document.getElementById("email").value.trim();

        // Verificar localização
        if (latitude === "" || longitude === "") {

            mostrarMensagem(
                mensagem,
                "Selecione o local da ocorrência no mapa antes de enviar.",
                "erro"
            );

            return;
        }

        // Verificar e-mail
        if (!email) {

            mostrarMensagem(
                mensagem,
                "Informe seu e-mail para receber o protocolo e código de acesso.",
                "erro"
            );

            document.getElementById("email").focus();

            return;
        }

        // Dados enviados à API
        const dados = {
            latitude: latitude,
            longitude: longitude,
            tipo: tipo,
            descricao: descricao,
            local: local,
            data_ocorrido: dataOcorrido || null,
            email: email
        };

        // Evitar múltiplos envios
        if (botaoEnviar) {
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = "Enviando relato...";
        }

        mostrarMensagem(
            mensagem,
            "Enviando seu relato. Aguarde...",
            "info"
        );

        try {

            const resposta = await fetch(`${API_URL}/denuncias`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(dados)

            });

            const resultado = await resposta.json();

            // Erros de validação ou API
            if (!resposta.ok) {

                let textoErro = resultado.mensagem || "Não foi possível enviar o relato.";

                if (resultado.errors) {

                    textoErro = Object.values(resultado.errors)
                        .flat()
                        .join(" ");

                }

                mostrarMensagem(
                    mensagem,
                    textoErro,
                    "erro"
                );

                return;
            }

            // Relato registrado com sucesso
            mostrarResultadoDenuncia(mensagem, resultado);

            // Limpar formulário após sucesso
            formulario.reset();

            // Limpar marcador e coordenadas
            if (marcador) {
                marcador.setMap(null);
                marcador = null;
            }

            document.getElementById("latitude").value = "";
            document.getElementById("longitude").value = "";

            document.getElementById("status-localizacao").textContent =
                "Selecione novamente o local no mapa.";

        } catch (erro) {

            console.error("Erro ao enviar denúncia:", erro);

            mostrarMensagem(
                mensagem,
                "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
                "erro"
            );

        } finally {

            if (botaoEnviar) {
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = "Enviar relato";
            }

        }

    });
}


// ================================
// MOSTRAR MENSAGEM
// ================================

function mostrarMensagem(elemento, texto, tipo) {

    elemento.textContent = texto;
    elemento.hidden = false;
    elemento.classList.remove("mensagem-erro", "mensagem-sucesso", "mensagem-info");
    elemento.classList.add(
        tipo === "erro" ? "mensagem-erro" :
        tipo === "sucesso" ? "mensagem-sucesso" : "mensagem-info"
    );
}


// ================================
// RESULTADO DO ENVIO
// ================================

function mostrarResultadoDenuncia(elemento, resultado) {

    elemento.innerHTML = "";
    elemento.hidden = false;
    elemento.classList.remove("mensagem-erro", "mensagem-info");
    elemento.classList.add("mensagem-sucesso");

    const titulo = document.createElement("h3");
    titulo.textContent = "Relato registrado com sucesso!";

    const texto = document.createElement("p");
    texto.textContent = resultado.mensagem;

    const protocolo = document.createElement("p");
    protocolo.textContent = "Protocolo: " + resultado.protocolo;

    const codigo = document.createElement("p");
    codigo.textContent = "Código de acesso: " + resultado.codigo_acesso;

    const aviso = document.createElement("p");
    aviso.textContent =
        "Guarde seu protocolo e código. Eles são necessários para consultar o andamento do relato.";

    elemento.appendChild(titulo);
    elemento.appendChild(texto);
    elemento.appendChild(protocolo);
    elemento.appendChild(codigo);
    elemento.appendChild(aviso);

    // Informação sobre envio do e-mail
    if (resultado.email_enviado) {

        const emailConfirmacao = document.createElement("p");
        emailConfirmacao.textContent =
            "Também enviamos essas informações para seu e-mail.";

        elemento.appendChild(emailConfirmacao);

    } else {

        const alertaEmail = document.createElement("p");
        alertaEmail.textContent =
            "Atenção: não conseguimos enviar o e-mail. Copie e guarde seu protocolo e código de acesso.";

        alertaEmail.classList.add("texto-alerta-email");

        elemento.appendChild(alertaEmail);

    }

}