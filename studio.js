const arquivos = {
    "inicio.lhtml": ""
};

let arquivoAtual = "inicio.lhtml";
let editor = null;

const armazenamento = "lipibr_studio_v2";

const lista = document.getElementById("fileList");
const abas = document.getElementById("tabs");
const terminal = document.getElementById("terminal");
const visualizacao = document.getElementById("preview");
const status = document.getElementById("statusText");
const tipoArquivo = document.getElementById("fileType");

function escreverTerminal(mensagem) {
    terminal.textContent = mensagem;
}

function atualizarStatus(mensagem) {
    status.textContent = mensagem;
}

function salvarProjeto() {
    if (editor && arquivoAtual) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    localStorage.setItem(armazenamento, JSON.stringify(arquivos));
    atualizarStatus("Projeto salvo");
}

function carregarProjeto() {
    const salvo = localStorage.getItem(armazenamento);

    if (!salvo) return;

    try {
        const dados = JSON.parse(salvo);

        if (dados && typeof dados === "object" && !Array.isArray(dados)) {
            for (const [nome, conteudo] of Object.entries(dados)) {
                if (
                    typeof nome === "string" &&
                    typeof conteudo === "string" &&
                    /\.(lhtml|lcss|ljs)$/.test(nome)
                ) {
                    arquivos[nome] = conteudo;
                }
            }
        }
    } catch {
        escreverTerminal("Não foi possível carregar o projeto salvo.");
    }
}

function obterLinguagem(nome) {
    if (nome.endsWith(".lhtml")) return "lipihtml";
    if (nome.endsWith(".lcss")) return "lipicss";
    if (nome.endsWith(".ljs")) return "lipijs";
    return "plaintext";
}

function atualizarTipo() {
    if (arquivoAtual.endsWith(".lhtml")) {
        tipoArquivo.textContent = "LipiHTML";
    } else if (arquivoAtual.endsWith(".lcss")) {
        tipoArquivo.textContent = "LipiCSS";
    } else if (arquivoAtual.endsWith(".ljs")) {
        tipoArquivo.textContent = "LipiJS";
    } else {
        tipoArquivo.textContent = "Texto";
    }
}

function atualizarArquivos() {
    lista.innerHTML = "";

    Object.keys(arquivos).forEach(nome => {
        const item = document.createElement("div");

        item.className = "file";
        item.textContent = nome;

        if (nome === arquivoAtual) {
            item.classList.add("active");
        }

        item.addEventListener("click", () => {
            abrirArquivo(nome);
        });

        lista.appendChild(item);
    });
}

function atualizarAbas() {
    abas.innerHTML = "";

    Object.keys(arquivos).forEach(nome => {
        const aba = document.createElement("div");

        aba.className = "tab";
        aba.textContent = nome;

        if (nome === arquivoAtual) {
            aba.classList.add("active");
        }

        aba.addEventListener("click", () => {
            abrirArquivo(nome);
        });

        abas.appendChild(aba);
    });
}

function abrirArquivo(nome) {
    if (!Object.prototype.hasOwnProperty.call(arquivos, nome)) {
        return;
    }

    if (editor && arquivoAtual) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    arquivoAtual = nome;

    editor.setValue(arquivos[nome]);
    monaco.editor.setModelLanguage(
        editor.getModel(),
        obterLinguagem(nome)
    );

    atualizarArquivos();
    atualizarAbas();
    atualizarTipo();
    atualizarStatus("Editando " + nome);
}

function criarArquivo() {
    const nome = prompt(
        "Nome do arquivo:\n\nUse .lhtml, .lcss ou .ljs"
    );

    if (!nome) return;

    const nomeLimpo = nome.trim();

    if (!/^[a-zA-Z0-9_-]+\.(lhtml|lcss|ljs)$/.test(nomeLimpo)) {
        alert("Nome inválido. Use .lhtml, .lcss ou .ljs.");
        return;
    }

    if (Object.prototype.hasOwnProperty.call(arquivos, nomeLimpo)) {
        alert("Esse arquivo já existe.");
        return;
    }

    arquivos[nomeLimpo] = "";

    abrirArquivo(nomeLimpo);
    salvarProjeto();
    escreverTerminal("Arquivo criado: " + nomeLimpo);
}

function executarProjeto() {
    salvarProjeto();

    try {
        const codigo = LipiMotor.montarProjeto(arquivos);

        visualizacao.srcdoc = codigo;

        escreverTerminal(
            "Projeto executado com sucesso.\n" +
            "Arquivos processados: " +
            Object.keys(arquivos).length
        );

        atualizarStatus("Projeto executado");
    } catch (erro) {
        escreverTerminal("Erro ao executar: " + erro.message);
        atualizarStatus("Erro na execução");
    }
}

function registrarLinguagens() {
    const linguagens = [
        {
            id: "lipihtml",
            extensao: ".lhtml",
            palavras: [
                "site", "pagina", "cabecalho", "rodape",
                "principal", "secao", "artigo", "navegacao",
                "titulo", "subtitulo", "titulo3", "texto",
                "paragrafo", "botao", "caixa", "imagem",
                "link", "entrada", "formulario", "rotulo",
                "lista", "item", "video"
            ]
        },
        {
            id: "lipicss",
            extensao: ".lcss",
            palavras: [
                "fundo", "cor", "largura", "altura", "margem",
                "espacamento", "alinhamento", "borda", "raio",
                "sombra", "tamanho", "fonte", "exibicao",
                "direcao", "justificacao", "itens", "cursor",
                "opacidade", "posicao", "transicao"
            ]
        },
        {
            id: "lipijs",
            extensao: ".ljs",
            palavras: [
                "mostrar", "alertar", "perguntar",
                "obterElemento", "let", "const", "if",
                "else", "for", "while", "function", "return"
            ]
        }
    ];

    linguagens.forEach(linguagem => {
        monaco.languages.register({
            id: linguagem.id,
            extensions: [linguagem.extensao]
        });
    });

    monaco.languages.setMonarchTokensProvider("lipihtml", {
        tokenizer: {
            root: [
                [/<!--/, "comment", "@comment"],
                [/<\/?[a-zA-ZÀ-ÿ][\wÀ-ÿ-]*/, "tag"],
                [/[a-zA-ZÀ-ÿ-]+(?=\s*=)/, "attribute.name"],
                [/="[^"]*"/, "attribute.value"],
                [/'[^']*'/, "attribute.value"],
                [/>/, "delimiter"],
                [/</, "delimiter"]
            ],
            comment: [
                [/-->/, "comment", "@pop"],
                [/./, "comment"]
            ]
        }
    });

    monaco.languages.setMonarchTokensProvider("lipicss", {
        tokenizer: {
            root: [
                [/\/\*/, "comment", "@comment"],
                [/[a-zA-ZÀ-ÿ-]+(?=\s*:)/, "attribute.name"],
                [/#([0-9a-fA-F]{3,8})\b/, "number.hex"],
                [/\d+(px|rem|em|%|vh|vw)?/, "number"],
                [/[{}]/, "delimiter"],
                [/:|;/, "delimiter"]
            ],
            comment: [
                [/\*\//, "comment", "@pop"],
                [/./, "comment"]
            ]
        }
    });

    monaco.languages.setMonarchTokensProvider("lipijs", {
        tokenizer: {
            root: [
                [/\b(let|const|var|if|else|for|while|function|return|true|false|null)\b/, "keyword"],
                [/\b(mostrar|alertar|perguntar|obterElemento)\b/, "function"],
                [/"[^"]*"/, "string"],
                [/'[^']*'/, "string"],
                [/\d+/, "number"],
                [/\/\/.*/, "comment"],
                [/[{}()[\]]/, "delimiter"]
            ]
        }
    });

    linguagens.forEach(linguagem => {
        monaco.languages.registerCompletionItemProvider(linguagem.id, {
            provideCompletionItems: () => {
                const sugestoes = linguagem.palavras.map(palavra => ({
                    label: palavra,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: palavra,
                    detail: "Comando LipiBR"
                }));

                if (linguagem.id === "lipihtml") {
                    sugestoes.push(
                        {
                            label: "titulo",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "<titulo>${1:Meu título}</titulo>",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            detail: "Criar título"
                        },
                        {
                            label: "botao",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<botao identificador="${1:botao}">${2:Clique aqui}</botao>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            detail: "Criar botão"
                        },
                        {
                            label: "entrada",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<entrada tipo="text" dica="${1:Digite aqui}">',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            detail: "Criar campo de entrada"
                        }
                    );
                }

                if (linguagem.id === "lipicss") {
                    sugestoes.push({
                        label: "estilo",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "${1:seletor} {\n\tcor: ${2:white};\n\tfundo: ${3:#222222};\n}",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: "Criar regra de estilo"
                    });
                }

                if (linguagem.id === "lipijs") {
                    sugestoes.push({
                        label: "mostrar",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'mostrar("${1:Olá}");',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: "Mostrar mensagem no console"
                    });
                }

                return { suggestions: sugestoes };
            }
        });
    });
}

function iniciarEditor() {
    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    window.MonacoEnvironment = {
        getWorkerUrl: function () {
            return URL.createObjectURL(
                new Blob(
                    [
                        'self.MonacoEnvironment = { baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/" };',
                        'importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js");'
                    ],
                    { type: "text/javascript" }
                )
            );
        }
    };

    require(["vs/editor/editor.main"], function () {
        registrarLinguagens();

        editor = monaco.editor.create(
            document.getElementById("editor"),
            {
                value: "",
                language: "lipihtml",
                theme: "vs-dark",
                automaticLayout: true,
                fontSize: 14,
                fontFamily: "Consolas, 'Courier New', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoIndent: "full",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                wordBasedSuggestions: "off",
                formatOnPaste: true
            }
        );

        editor.onDidChangeModelContent(() => {
            arquivos[arquivoAtual] = editor.getValue();
            atualizarStatus("Alterações não salvas");
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            salvarProjeto
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            executarProjeto
        );

        carregarProjeto();

        if (!Object.prototype.hasOwnProperty.call(arquivos, "inicio.lhtml")) {
            arquivos["inicio.lhtml"] = "";
        }

        abrirArquivo("inicio.lhtml");

        escreverTerminal(
            "LipiBR Studio pronto.\n" +
            "Crie seu código em português no arquivo inicio.lhtml."
        );
    });
}

document.getElementById("newFile").addEventListener("click", criarArquivo);
document.getElementById("saveFiles").addEventListener("click", salvarProjeto);
document.getElementById("runProject").addEventListener("click", executarProjeto);

iniciarEditor();
