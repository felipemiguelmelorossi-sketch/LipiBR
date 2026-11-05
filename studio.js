
const armazenamento = "lipibr_projeto_lp";

let arquivos = { "inicio.lp": "" };
let arquivoAtual = "inicio.lp";
let editor = null;

const lista = document.getElementById("fileList");
const abas = document.getElementById("tabs");
const terminal = document.getElementById("terminal");
const preview = document.getElementById("preview");
const status = document.getElementById("statusText");

const tags = [
    "documento", "configuracao", "corpo",
    "cabecalho", "rodape", "principal",
    "secao", "artigo", "navegacao",
    "titulo", "subtitulo", "titulo3",
    "texto", "paragrafo", "botao",
    "caixa", "link", "formulario",
    "rotulo", "lista", "lista_numerada",
    "item", "tabela", "linha_tabela",
    "coluna", "cabecalho_tabela",
    "estilo", "programa", "video", "audio"
];

const atributos = [
    "identificador", "classe", "destino",
    "tipo", "dica", "alternativa",
    "largura", "altura", "valor",
    "nome", "origem", "controle",
    "marcado", "obrigatorio"
];

function carregarProjeto() {
    try {
        const salvo = localStorage.getItem(armazenamento);
        if (!salvo) return;

        const dados = JSON.parse(salvo);
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) return;

        const validos = {};

        for (const [nome, conteudo] of Object.entries(dados)) {
            if (nome.endsWith(".lp") && typeof conteudo === "string") {
                validos[nome] = conteudo;
            }
        }

        if (Object.keys(validos).length) arquivos = validos;
    } catch {
        arquivos = { "inicio.lp": "" };
    }
}

function salvarProjeto() {
    if (editor) arquivos[arquivoAtual] = editor.getValue();

    localStorage.setItem(armazenamento, JSON.stringify(arquivos));
    status.textContent = "Projeto salvo";
    terminal.textContent = "Projeto salvo com sucesso.";
}

function atualizarExplorador() {
    lista.innerHTML = "";
    abas.innerHTML = "";

    Object.keys(arquivos).forEach(nome => {
        const item = document.createElement("div");
        item.className = "file" + (nome === arquivoAtual ? " active" : "");
        item.textContent = nome;
        item.onclick = () => abrirArquivo(nome);
        lista.appendChild(item);

        const aba = document.createElement("div");
        aba.className = "tab" + (nome === arquivoAtual ? " active" : "");
        aba.textContent = nome;
        aba.onclick = () => abrirArquivo(nome);
        abas.appendChild(aba);
    });
}

function abrirArquivo(nome) {
    if (!Object.prototype.hasOwnProperty.call(arquivos, nome)) return;

    if (editor) arquivos[arquivoAtual] = editor.getValue();

    arquivoAtual = nome;
    editor.setValue(arquivos[nome]);

    atualizarExplorador();
    status.textContent = "Editando " + nome;
}

function criarArquivo() {
    const nome = prompt("Nome do arquivo .lp:");

    if (!nome) return;

    const arquivo = nome.trim();

    if (!/^[a-zA-Z0-9_-]+\.lp$/.test(arquivo)) {
        alert("O arquivo precisa terminar em .lp");
        return;
    }

    if (Object.prototype.hasOwnProperty.call(arquivos, arquivo)) {
        alert("Esse arquivo já existe.");
        return;
    }

    arquivos[arquivo] = "";
    abrirArquivo(arquivo);
    salvarProjeto();
    terminal.textContent = "Arquivo criado: " + arquivo;
}

function executarProjeto() {
    salvarProjeto();

    try {
        preview.srcdoc = LipiMotor.montarProjeto(editor.getValue());
        terminal.textContent = "Arquivo " + arquivoAtual + " executado.";
        status.textContent = "Execução concluída";
    } catch (erro) {
        terminal.textContent = "Erro: " + erro.message;
        status.textContent = "Erro";
    }
}

function registrarLinguagem() {
    monaco.languages.register({ id: "lipi" });

    monaco.languages.setMonarchTokensProvider("lipi", {
        tokenizer: {
            root: [
                [/<!--/, "comment", "@comment"],
                [/<\/?[\wÀ-ÿ_-]+/, "tag"],
                [/[a-zA-ZÀ-ÿ_]+(?=\s*=)/, "attribute.name"],
                [/="[^"]*"/, "attribute.value"],
                [/'[^']*'/, "attribute.value"],
                [/>/, "delimiter"],
                [/[{}]/, "delimiter"]
            ],
            comment: [
                [/-->/, "comment", "@pop"],
                [/./, "comment"]
            ]
        }
    });

    monaco.languages.setLanguageConfiguration("lipi", {
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
            ["<", ">"]
        ],
        autoClosingPairs: [
            { open: "(", close: ")" },
            { open: "[", close: "]" },
            { open: "{", close: "}" },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        surroundingPairs: [
            { open: "(", close: ")" },
            { open: "[", close: "]" },
            { open: "{", close: "}" },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        indentationRules: {
            increaseIndentPattern: /<(?!(?:\/|!))[\wÀ-ÿ_-]+[^>]*>$/,
            decreaseIndentPattern: /^\s*<\/[\wÀ-ÿ_-]+>/
        }
    });

    monaco.languages.registerCompletionItemProvider("lipi", {
        triggerCharacters: ["<", " ", "="],
        provideCompletionItems: function (modelo, posicao) {
            const linha = modelo.getLineContent(posicao.lineNumber);
            const antes = linha.slice(0, posicao.column - 1);

            let sugestoes = [];

            if (antes.endsWith("<")) {
                sugestoes = tags.map(tag => ({
                    label: tag,
                    kind: monaco.languages.CompletionItemKind.Class,
                    insertText: tag + ">\n\t$0\n</" + tag + ">",
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: "Tag LipiBR"
                }));
            } else if (/<[\wÀ-ÿ_-]+\s+[\wÀ-ÿ_-]*$/.test(antes)) {
                sugestoes = atributos.map(atributo => ({
                    label: atributo,
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: atributo + '="$1"',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: "Atributo LipiBR"
                }));
            } else {
                sugestoes = tags.map(tag => ({
                    label: tag,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: tag,
                    detail: "Tag LipiBR"
                }));
            }

            return { suggestions: sugestoes };
        }
    });

    monaco.languages.registerCompletionItemProvider("lipi", {
        triggerCharacters: [">"],
        provideCompletionItems: function (modelo, posicao) {
            const linha = modelo.getLineContent(posicao.lineNumber);
            const encontrado = linha.match(/<([\wÀ-ÿ_-]+)[^>]*>$/);

            if (!encontrado) return { suggestions: [] };

            const tag = encontrado[1];

            if ([
                "imagem", "entrada", "quebra", "linha"
            ].includes(tag)) {
                return { suggestions: [] };
            }

            return {
                suggestions: [{
                    label: "Fechar " + tag,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: "</" + tag + ">",
                    detail: "Fechamento de tag"
                }]
            };
        }
    });
}

function iniciarMonaco() {
    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    window.MonacoEnvironment = {
        getWorkerUrl: function () {
            const codigo = `
                self.MonacoEnvironment = {
                    baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/"
                };
                importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js");
            `;

            return URL.createObjectURL(
                new Blob([codigo], { type: "text/javascript" })
            );
        }
    };

    require(["vs/editor/editor.main"], function () {
        registrarLinguagem();
        carregarProjeto();

        editor = monaco.editor.create(
            document.getElementById("editor"),
            {
                value: "",
                language: "lipi",
                theme: "vs-dark",
                automaticLayout: true,
                fontSize: 14,
                fontFamily: "Consolas, monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoIndent: "full",
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                suggest: {
                    showWords: true,
                    preview: true,
                    snippetsPreventQuickSuggestions: false
                }
            }
        );

        editor.onDidChangeModelContent(() => {
            arquivos[arquivoAtual] = editor.getValue();
            status.textContent = "Alterações não salvas";
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            salvarProjeto
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            executarProjeto
        );

        abrirArquivo("inicio.lp");
        terminal.textContent = "LipiBR pronto. Digite < para ver as opções de tags.";
    });
}

document.getElementById("newFile").addEventListener("click", criarArquivo);
document.getElementById("saveFiles").addEventListener("click", salvarProjeto);
document.getElementById("runProject").addEventListener("click", executarProjeto);

iniciarMonaco();
