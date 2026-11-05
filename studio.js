
const modelosIniciais = {
    "pagina.lhtml": `<pagina>
    <cabecalho>
        <titulo>Meu primeiro site</titulo>
        <texto>Desenvolvido com LipiBR</texto>
    </cabecalho>

    <conteudo>
        <subtitulo>Bem-vindo!</subtitulo>
        <texto>Este site foi criado usando HTML em português.</texto>

        <entrada id="nome" placeholder="Digite seu nome"></entrada>
        <botao id="enviar">Enviar</botao>

        <paragrafo id="resultado"></paragrafo>
    </conteudo>
</pagina>`,

    "estilo.lcss": `pagina {
    fundo: #101827;
    cor: branco;
    fonte: Arial, sans-serif;
    alinhamento: centralizado;
    espacamento: 30px;
}

titulo {
    tamanho: 32px;
    cor: #3794ff;
}

botao {
    fundo: #087acc;
    cor: branco;
    borda: nenhum;
    raio: 5px;
    espacamento: 12px;
    cursor: pointer;
}

entrada {
    espacamento: 12px;
    margem: 10px;
}`,

    "codigo.ljs": `let botao = document.getElementById("enviar");

botao.addEventListener("click", function() {
    let nome = document.getElementById("nome").value;

    if (nome == "") {
        alertar("Digite seu nome!");
    } else {
        document.getElementById("resultado").textContent =
            "Olá, " + nome + "! Você está usando LipiBR.";

        mostrar("Nome recebido: " + nome);
    }
});`
};

let arquivos = {};
let arquivoAtual = "pagina.lhtml";
let arquivosAbertos = [];
let editor = null;

const lista = document.getElementById("fileList");
const abas = document.getElementById("tabs");
const saida = document.getElementById("output");
const preview = document.getElementById("preview");
const statusTexto = document.getElementById("statusText");

function carregarDados() {
    try {
        const dados = JSON.parse(
            localStorage.getItem("lipibr_projeto") || "{}"
        );

        arquivos = { ...modelosIniciais, ...dados };
    } catch {
        arquivos = { ...modelosIniciais };
    }

    arquivosAbertos = ["pagina.lhtml"];
}

function salvarSilencioso() {
    if (editor && arquivoAtual) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    try {
        localStorage.setItem(
            "lipibr_projeto",
            JSON.stringify(arquivos)
        );
    } catch {
        saida.textContent = "Não foi possível salvar. O armazenamento pode estar cheio.";
    }
}

function salvarDados() {
    salvarSilencioso();
    saida.textContent = "Projeto salvo neste navegador.";
    statusTexto.textContent = "Salvo | UTF-8";
}

function linguagemDoArquivo(nome) {
    const extensao = nome.split(".").pop().toLowerCase();

    const linguagens = {
        html: "html",
        css: "css",
        js: "javascript",
        lhtml: "lipihtml",
        lcss: "lipicss",
        ljs: "lipijs"
    };

    return linguagens[extensao] || "plaintext";
}

function configurarLinguagens() {
    const definicoes = [
        {
            id: "lipihtml",
            palavras: [
                "pagina", "cabecalho", "rodape", "conteudo",
                "secao", "artigo", "navegacao", "titulo",
                "subtitulo", "titulo3", "texto", "paragrafo",
                "botao", "caixa", "imagem", "link", "entrada",
                "formulario", "rotulo", "lista", "item",
                "quebra", "linha", "video"
            ],
            exemplo: `<pagina>
    <cabecalho>
        <titulo>Meu site</titulo>
    </cabecalho>
    <conteudo>
        <texto>Olá, mundo!</texto>
    </conteudo>
</pagina>`
        },
        {
            id: "lipicss",
            palavras: [
                "fundo", "cor", "largura", "altura",
                "espacamento", "margem", "alinhamento",
                "borda", "raio", "sombra", "tamanho",
                "fonte", "exibicao", "direcao",
                "justificacao", "itens", "opacidade",
                "posicao", "cursor", "transicao"
            ],
            exemplo: `pagina {
    fundo: #101827;
    cor: branco;
    espacamento: 20px;
}`
        },
        {
            id: "lipijs",
            palavras: [
                "mostrar", "perguntar", "alertar",
                "let", "const", "var", "if", "else",
                "for", "while", "function", "return",
                "true", "false", "null"
            ],
            exemplo: `let nome = "Felipe";
mostrar("Olá, " + nome);`
        }
    ];

    definicoes.forEach(def => {
        monaco.languages.register({ id: def.id });

        monaco.languages.setMonarchTokensProvider(def.id, {
            tokenizer: {
                root: [
                    [/\/\/.*$/, "comment"],
                    [/"([^"\\]|\\.)*"/, "string"],
                    [/'([^'\\]|\\.)*'/, "string"],
                    [/\b(let|const|var|if|else|for|while|function|return|true|false|null)\b/, "keyword"],
                    [/\b(mostrar|perguntar|alertar)\b/, "function"],
                    [/\b[0-9]+\b/, "number"],
                    [/[{}()\[\]]/, "@brackets"],
                    [/[a-zA-ZÀ-ÿ_$][\wÀ-ÿ$]*/, "identifier"]
                ]
            }
        });

        monaco.languages.registerCompletionItemProvider(def.id, {
            provideCompletionItems() {
                const sugestoes = def.palavras.map(palavra => ({
                    label: palavra,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: palavra
                }));

                sugestoes.push({
                    label: "modelo inicial",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: def.exemplo,
                    detail: "Modelo de código LipiBR"
                });

                return { suggestions: sugestoes };
            }
        });
    });
}

function iniciarEditor() {
    if (typeof require === "undefined") {
        saida.textContent = "Erro: Monaco não carregou. Verifique sua conexão.";
        return;
    }

    window.MonacoEnvironment = {
        getWorkerUrl: function() {
            const codigo = `
                self.MonacoEnvironment = {
                    baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/"
                };
                importScripts(
                    "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js"
                );
            `;

            return "data:text/javascript;charset=utf-8," +
                encodeURIComponent(codigo);
        }
    };

    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    require(["vs/editor/editor.main"], function() {
        configurarLinguagens();

        monaco.editor.defineTheme("lipibr-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#1e1e1e",
                "editorLineNumber.foreground": "#858585",
                "editorCursor.foreground": "#ffffff",
                "editor.selectionBackground": "#264f78"
            }
        });

        editor = monaco.editor.create(
            document.getElementById("editor"),
            {
                value: arquivos[arquivoAtual],
                language: linguagemDoArquivo(arquivoAtual),
                theme: "lipibr-dark",
                automaticLayout: true,
                fontSize: 14,
                fontFamily: "Consolas, monospace",
                minimap: { enabled: true },
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoIndent: "full",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true }
            }
        );

        editor.onDidChangeModelContent(() => {
            arquivos[arquivoAtual] = editor.getValue();
            salvarSilencioso();
            statusTexto.textContent = "Editando | UTF-8";
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            salvarDados
        );

        abrirArquivo("pagina.lhtml");
        saida.textContent = "LipiBR Studio pronto.\nEditor inteligente carregado.";
    });
}

function classeArquivo(nome) {
    if (nome.endsWith(".lhtml")) return ["L", "html-icon"];
    if (nome.endsWith(".lcss")) return ["L", "css-icon"];
    if (nome.endsWith(".ljs")) return ["L", "js-icon"];
    if (nome.endsWith(".html")) return ["H", "html-icon"];
    if (nome.endsWith(".css")) return ["C", "css-icon"];
    if (nome.endsWith(".js")) return ["J", "js-icon"];

    return ["F", "lipi-icon"];
}

function desenharArquivos() {
    lista.innerHTML = "";

    Object.keys(arquivos).sort().forEach(nome => {
        const botao = document.createElement("button");
        const [letra, classe] = classeArquivo(nome);

        botao.className =
            "file" + (nome === arquivoAtual ? " active" : "");

        const icone = document.createElement("span");
        icone.className = "file-icon " + classe;
        icone.textContent = letra;

        botao.append(icone, document.createTextNode(nome));

        botao.addEventListener("click", () => abrirArquivo(nome));
        lista.appendChild(botao);
    });
}

function desenharAbas() {
    abas.innerHTML = "";

    arquivosAbertos.forEach(nome => {
        const botao = document.createElement("button");

        botao.className =
            "tab" + (nome === arquivoAtual ? " active" : "");

        botao.textContent = nome;
        botao.addEventListener("click", () => abrirArquivo(nome));

        abas.appendChild(botao);
    });
}

function abrirArquivo(nome) {
    if (!editor || arquivos[nome] === undefined) return;

    if (!arquivosAbertos.includes(nome)) {
        arquivosAbertos.push(nome);
    }

    arquivoAtual = nome;
    editor.setValue(arquivos[nome]);

    monaco.editor.setModelLanguage(
        editor.getModel(),
        linguagemDoArquivo(nome)
    );

    desenharArquivos();
    desenharAbas();

    statusTexto.textContent = nome + " | UTF-8";
}

function novoArquivo() {
    const nome = prompt(
        "Nome do arquivo: exemplo.lhtml, exemplo.lcss ou exemplo.ljs"
    );

    if (!nome) return;

    if (!/^[\wÀ-ÿ.-]+\.(html|css|js|lhtml|lcss|ljs)$/i.test(nome)) {
        alert("Extensão inválida.");
        return;
    }

    if (arquivos[nome] !== undefined) {
        alert("Esse arquivo já existe.");
        return;
    }

    arquivos[nome] = "";
    salvarSilencioso();
    abrirArquivo(nome);

    saida.textContent = "Arquivo criado: " + nome;
}

function renomearArquivo() {
    if (!arquivoAtual) return;

    const nome = prompt("Novo nome:", arquivoAtual);

    if (!nome || nome === arquivoAtual) return;

    if (arquivos[nome] !== undefined) {
        alert("Esse arquivo já existe.");
        return;
    }

    arquivos[nome] = arquivos[arquivoAtual];
    delete arquivos[arquivoAtual];

    arquivosAbertos = arquivosAbertos.map(item =>
        item === arquivoAtual ? nome : item
    );

    arquivoAtual = nome;
    salvarSilencioso();
    abrirArquivo(nome);
}

function excluirArquivo() {
    if (!arquivoAtual) return;

    if (!confirm("Excluir " + arquivoAtual + "?")) return;

    delete arquivos[arquivoAtual];

    arquivosAbertos = arquivosAbertos.filter(
        item => item !== arquivoAtual
    );

    const proximo = Object.keys(arquivos)[0];

    salvarSilencioso();

    if (proximo) {
        abrirArquivo(proximo);
    } else {
        arquivoAtual = "";
        editor.setValue("");
        abas.innerHTML = "";
        desenharArquivos();
    }
}

function executarProjeto() {
    salvarSilencioso();

    try {
        const resultado = LipiMotor.montarProjeto(arquivos);

        preview.srcdoc = resultado;
        saida.textContent =
            "Projeto LipiBR executado com sucesso.";

        statusTexto.textContent = "Execução concluída";
    } catch (erro) {
        saida.textContent = "Erro: " + erro.message;
        statusTexto.textContent = "Erro na execução";
    }
}

document.getElementById("newFile")
    .addEventListener("click", novoArquivo);

document.getElementById("saveFiles")
    .addEventListener("click", salvarDados);

document.getElementById("runProject")
    .addEventListener("click", executarProjeto);

document.getElementById("refreshPreview")
    .addEventListener("click", executarProjeto);

document.getElementById("renameFile")
    .addEventListener("click", renomearArquivo);

document.getElementById("deleteFile")
    .addEventListener("click", excluirArquivo);

document.getElementById("newFolder")
    .addEventListener("click", () => {
        alert("A criação de pastas ainda não está implementada.");
    });

carregarDados();
desenharArquivos();
iniciarEditor();
