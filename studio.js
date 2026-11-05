const arquivos = {
    "pagina.lhtml": `<pagina>
    <cabecalho>
        <titulo>Meu primeiro site</titulo>
    </cabecalho>

    <conteudo>
        <texto>Bem-vindo ao LipiBR!</texto>
        <botao id="botao">Clique aqui</botao>
    </conteudo>
</pagina>`,

    "estilo.lcss": `pagina {
    fundo: #101827;
    cor: branco;
    fonte: Arial;
    espacamento: 25px;
}

titulo {
    cor: azul;
    alinhamento: centralizado;
}

botao {
    fundo: azul;
    cor: branco;
    espacamento: 12px;
    borda: none;
    cursor: pointer;
}`,

    "codigo.ljs": `let mensagem = "LipiBR funcionando!"

show(mensagem)

document.getElementById("botao").onclick = function() {
    alert("Olá! Você executou seu primeiro programa LipiBR!")
}`
};

let arquivoAtual = "pagina.lhtml";

const editor = document.getElementById("codigo");
const saida = document.getElementById("saida");
const preview = document.getElementById("preview");

function abrirArquivo(nome) {
    if (!(nome in arquivos)) return;

    arquivoAtual = nome;
    editor.value = arquivos[nome];

    document.querySelectorAll(".arquivo").forEach(botao => {
        botao.classList.toggle(
            "ativo",
            botao.dataset.arquivo === nome
        );
    });

    document.querySelector(".aba").textContent = nome;
    atualizarNumeros();
}

document.querySelectorAll(".arquivo").forEach(botao => {
    botao.addEventListener("click", () => {
        salvarAtual();
        abrirArquivo(botao.dataset.arquivo);
    });
});

function salvarAtual() {
    arquivos[arquivoAtual] = editor.value;

    localStorage.setItem(
        "lipibr_arquivos",
        JSON.stringify(arquivos)
    );
}

function carregarArquivos() {
    const salvos = localStorage.getItem("lipibr_arquivos");

    if (!salvos) return;

    try {
        Object.assign(arquivos, JSON.parse(salvos));
    } catch {
        saida.textContent = "Não foi possível carregar os arquivos salvos.";
    }
}

function executarProjeto() {
    salvarAtual();

    const html = arquivos["pagina.lhtml"] || "";
    const css = arquivos["estilo.lcss"] || "";
    const js = arquivos["codigo.ljs"] || "";

    try {
        const resultado = LipiMotor.executar(html, css, js);

        preview.srcdoc = resultado;
        saida.textContent = "Projeto executado com sucesso!";
    } catch (erro) {
        saida.textContent = "Erro: " + erro.message;
    }
}

function atualizarNumeros() {
    const quantidade = editor.value.split("\n").length;

    document.getElementById("numeros").textContent =
        Array.from(
            { length: quantidade },
            (_, i) => i + 1
        ).join("\n");
}

editor.addEventListener("input", () => {
    atualizarNumeros();
});

editor.addEventListener("keydown", evento => {
    if (evento.key === "Tab") {
        evento.preventDefault();

        const inicio = editor.selectionStart;
        const fim = editor.selectionEnd;

        editor.setRangeText("    ", inicio, fim, "end");
        atualizarNumeros();
    }

    const pares = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        "'": "'"
    };

    if (pares[evento.key]) {
        evento.preventDefault();

        const inicio = editor.selectionStart;
        const fim = editor.selectionEnd;

        editor.setRangeText(
            evento.key + pares[evento.key],
            inicio,
            fim,
            "end"
        );

        editor.selectionStart = inicio + 1;
        editor.selectionEnd = inicio + 1;
    }
});

document.getElementById("executar")
    .addEventListener("click", executarProjeto);

document.getElementById("atualizar")
    .addEventListener("click", executarProjeto);

document.getElementById("salvar")
    .addEventListener("click", () => {
        salvarAtual();
        saida.textContent = "Arquivos salvos neste navegador!";
    });

document.getElementById("novoArquivo")
    .addEventListener("click", () => {
        const nome = prompt("Nome do arquivo (exemplo: teste.ljs):");

        if (!nome) return;

        if (!/\.(ljs|lhtml|lcss)$/.test(nome)) {
            alert("Use .ljs, .lhtml ou .lcss");
            return;
        }

        if (arquivos[nome]) {
            alert("Esse arquivo já existe!");
            return;
        }

        arquivos[nome] = "";

        const botao = document.createElement("button");
        botao.className = "arquivo";
        botao.dataset.arquivo = nome;
        botao.textContent = nome;
        botao.addEventListener("click", () => {
            salvarAtual();
            abrirArquivo(nome);
        });

        document.getElementById("arquivos").appendChild(botao);
        salvarAtual();
        abrirArquivo(nome);
    });

carregarArquivos();
abrirArquivo("pagina.lhtml");
atualizarNumeros();
