
const modelosIniciais = {
    "index.html": `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu projeto</title>
</head>
<body>
    <h1>Olá, mundo!</h1>
    <p>Meu primeiro projeto no LipiBR Studio.</p>
    <button id="botao">Clique aqui</button>
</body>
</html>`,

    "style.css": `body {
    background: #101827;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 30px;
}

button {
    background: #087acc;
    color: white;
    border: none;
    padding: 12px 20px;
    cursor: pointer;
}`,

    "script.js": `const botao = document.getElementById("botao");

botao.addEventListener("click", function() {
    alert("LipiBR está funcionando!");
});`,

    "pagina.lhtml": `<pagina>
    <cabecalho>
        <titulo>Meu primeiro site</titulo>
    </cabecalho>
    <conteudo>
        <texto>Feito com LipiBR!</texto>
        <botao id="botao">Clique aqui</botao>
    </conteudo>
</pagina>`,

    "estilo.lcss": `pagina {
    fundo: #101827;
    cor: branco;
    fonte: Arial, sans-serif;
    alinhamento: centralizado;
    espacamento: 30px;
}

botao {
    fundo: azul;
    cor: branco;
    borda: none;
    espacamento: 12px;
    cursor: pointer;
}`,

    "codigo.ljs": `let nome = "LipiBR";

mostrar("Olá, " + nome);

const botao = document.getElementById("botao");

botao.addEventListener("click", function() {
    alert("Você executou LipiJS!");
});`
};

let arquivos = {};
let arquivoAtual = "index.html";
let editor = null;
let modelos = {};
let arquivosAbertos = ["index.html"];

const lista = document.getElementById("fileList");
const abas = document.getElementById("tabs");
const saida = document.getElementById("output");
const preview = document.getElementById("preview");
const statusTexto = document.getElementById("statusText");

function carregarDados() {
    try {
        const dados = JSON.parse(localStorage.getItem("lipibr_projeto") || "{}");
        arquivos = { ...modelosIniciais, ...dados };
    } catch {
        arquivos = { ...modelosIniciais };
    }
}

function salvarDados() {
    if (editor && arquivoAtual) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    localStorage.setItem("lipibr_projeto", JSON.stringify(arquivos));
    saida.textContent = "Projeto salvo neste navegador.";
    statusTexto.textContent = "Salvo | UTF-8 | Espaços: 4";
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
    const linguagens = [
        {
            id: "lipihtml",
            extensao: "lhtml",
            inicio: /<\/?[a-zA-ZÀ-ÿ]*/,
            palavras: ["pagina","cabecalho","rodape","conteudo","secao","titulo","subtitulo","texto","botao","caixa","imagem","link","entrada","lista","item"]
        },
        {
            id: "lipicss",
            extensao: "lcss",
            inicio: /[a-zA-ZÀ-ÿ-]+/,
            palavras: ["fundo","cor","largura","altura","espacamento","margem","alinhamento","borda","raio","sombra","tamanho","fonte","exibicao","direcao","justificacao","itens"]
        },
        {
            id: "lipijs",
            extensao: "ljs",
            inicio: /[a-zA-Z_$][\w$]*/,
            palavras: ["mostrar","show","let","const","var","if","else","for","while","function","return","true","false","null"]
        }
    ];

    linguagens.forEach(item => {
        monaco.languages.register({ id: item.id });

        monaco.languages.setMonarchTokensProvider(item.id, {
            tokenizer: {
                root: [
                    [/"([^"\\]|\\.)*"/, "string"],
                    [/'([^'\\]|\\.)*'/, "string"],
                    [/\/\/.*$/, "comment"],
                    [/\b(let|const|var|if|else|for|while|function|return|true|false|null)\b/, "keyword"],
                    [/\b(mostrar|show)\b/, "function"],
                    [/\b[0-9]+\b/, "number"],
                    [/[{}()\[\]]/, "@brackets"],
                    [/[a-zA-ZÀ-ÿ_$][\wÀ-ÿ$]*/, "identifier"]
                ]
            }
        });

        monaco.languages.registerCompletionItemProvider(item.id, {
            provideCompletionItems(model, position) {
                const sugestoes = item.palavras.map((palavra, indice) => ({
                    label: palavra,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: palavra,
                    sortText: String(indice).padStart(3, "0")
                }));

                if (item.id === "lipihtml") {
                    sugestoes.push({
                        label: "estrutura de página",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "<pagina>",
                            "    <cabecalho>",
                            "        <titulo>${1:Meu site}</titulo>",
                            "    </cabecalho>",
                            "    <conteudo>",
                            "        <texto>${2:Olá, mundo!}</texto>",
                            "    </conteudo>",
                            "</pagina>"
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    });
                }

                if (item.id === "lipicss") {
                    sugestoes.push({
                        label: "regra CSS",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "${1:seletor} {",
                            "    fundo: ${2:#ffffff};",
                            "    cor: ${3:#000000};",
                            "    espacamento: ${4:10px};",
                            "}"
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    });
                }

                if (item.id === "lipijs") {
                    sugestoes.push({
                        label: "mostrar",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "mostrar(${1:mensagem});",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    });
                }

                return { suggestions: sugestoes };
            }
        });
    });
}

function criarEditor() {
    if (typeof require === "undefined") {
        saida.textContent = "Não foi possível carregar o editor Monaco. Verifique sua conexão e recarregue a página.";
        return;
    }

    window.MonacoEnvironment = {
        getWorkerUrl: function() {
            const codigo = `
                self.MonacoEnvironment = { baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/" };
                importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js");
            `;
            return "data:text/javascript;charset=utf-8," + encodeURIComponent(codigo);
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
                "editorLineNumber.activeForeground": "#c6c6c6",
                "editorCursor.foreground": "#ffffff",
                "editor.selectionBackground": "#264f78",
                "editor.lineHighlightBackground": "#252526"
            }
        });

        editor = monaco.editor.create(document.getElementById("editor"), {
            value: arquivos[arquivoAtual],
            language: linguagemDoArquivo(arquivoAtual),
            theme: "lipibr-dark",
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "Consolas, 'Courier New', monospace",
            minimap: { enabled: true },
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "off",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true }
        });

        editor.onDidChangeModelContent(() => {
            arquivos[arquivoAtual] = editor.getValue();
            localStorage.setItem("lipibr_projeto", JSON.stringify(arquivos));
            statusTexto.textContent = "Alterações não salvas | UTF-8";
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, salvarDados);

        abrirArquivo("index.html");
        saida.textContent = "Monaco Editor carregado.\nLipiBR Studio pronto.";
    });
}

function iconeArquivo(nome) {
    if (nome.endsWith(".html") || nome.endsWith(".lhtml")) return ["H", "html-icon"];
    if (nome.endsWith(".css") || nome.endsWith(".lcss")) return ["C", "css-icon"];
    if (nome.endsWith(".js") || nome.endsWith(".ljs")) return ["J", "js-icon"];
    return ["F", "lipi-icon"];
}

function desenharArquivos() {
    lista.innerHTML = "";

    Object.keys(arquivos).sort().forEach(nome => {
        const botao = document.createElement("button");
        const [letra, classe] = iconeArquivo(nome);

        botao.className = "file" + (nome === arquivoAtual ? " active" : "");
        botao.innerHTML = `<span class="file-icon ${classe}">${letra}</span>`;
        botao.appendChild(document.createTextNode(nome));

        botao.addEventListener("click", () => abrirArquivo(nome));
        lista.appendChild(botao);
    });
}

function desenharAbas() {
    abas.innerHTML = "";

    arquivosAbertos.forEach(nome => {
        const botao = document.createElement("button");
        botao.className = "tab" + (nome === arquivoAtual ? " active" : "");
        botao.textContent = nome;
        botao.addEventListener("click", () => abrirArquivo(nome));
        abas.appendChild(botao);
    });
}

function abrirArquivo(nome) {
    if (!(nome in arquivos) || !editor) return;

    if (!arquivosAbertos.includes(nome)) arquivosAbertos.push(nome);

    arquivoAtual = nome;
    editor.setValue(arquivos[nome]);

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, linguagemDoArquivo(nome));

    desenharArquivos();
    desenharAbas();
    statusTexto.textContent = nome + " | UTF-8 | Espaços: 4";
}

function novoArquivo() {
    const nome = prompt("Nome do arquivo. Exemplos: teste.html, estilo.css, app.ljs");

    if (!nome) return;

    if (!/^[\wÀ-ÿ.-]+\.(html|css|js|lhtml|lcss|ljs)$/.test(nome)) {
        alert("Extensão não aceita. Use HTML, CSS, JS, LHTML, LCSS ou LJS.");
        return;
    }

    if (arquivos[nome]) {
        alert("Já existe um arquivo com esse nome.");
        return;
    }

    arquivos[nome] = "";
    salvarSilencioso();
    abrirArquivo(nome);
    saida.textContent = "Arquivo criado: " + nome;
}

function salvarSilencioso() {
    if (editor && arquivoAtual) arquivos[arquivoAtual] = editor.getValue();
    localStorage.setItem("lipibr_projeto", JSON.stringify(arquivos));
}

function renomearArquivo() {
    const novoNome = prompt("Novo nome do arquivo:", arquivoAtual);

    if (!novoNome || novoNome === arquivoAtual) return;

    if (arquivos[novoNome] !== undefined) {
        alert("Já existe um arquivo com esse nome.");
        return;
    }

    arquivos[novoNome] = arquivos[arquivoAtual];
    delete arquivos[arquivoAtual];

    arquivosAbertos = arquivosAbertos.map(nome =>
        nome === arquivoAtual ? novoNome : nome
    );

    arquivoAtual = novoNome;
    salvarSilencioso();
    abrirArquivo(novoNome);
}

function excluirArquivo() {
    if (!confirm("Excluir " + arquivoAtual + "?")) return;

    delete arquivos[arquivoAtual];
    arquivosAbertos = arquivosAbertos.filter(nome => nome !== arquivoAtual);

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

function criarPasta() {
    alert("Nesta versão, os arquivos ficam na raiz do projeto. Pastas reais serão adicionadas em uma atualização própria.");
}

function executarProjeto() {
    salvarSilencioso();

    try {
        const resultado = LipiMotor.montarProjeto(arquivos);
        preview.srcdoc = resultado;
        saida.textContent = "Projeto executado na pré-visualização.";
        statusTexto.textContent = "Execução concluída";
    } catch (erro) {
        saida.textContent = "Erro ao executar: " + erro.message;
        statusTexto.textContent = "Erro";
    }
}

document.getElementById("newFile").addEventListener("click", novoArquivo);
document.getElementById("saveFiles").addEventListener("click", salvarDados);
document.getElementById("runProject").addEventListener("click", executarProjeto);
document.getElementById("refreshPreview").addEventListener("click", executarProjeto);
document.getElementById("renameFile").addEventListener("click", renomearArquivo);
document.getElementById("deleteFile").addEventListener("click", excluirArquivo);
document.getElementById("newFolder").addEventListener("click", criarPasta);

carregarDados();
desenharArquivos();
criarEditor();
