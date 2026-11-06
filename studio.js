
const CHAVE = "lipibr_projeto_lp_v3";

let arquivos = { "inicio.lp": "" };
let arquivoAtual = "inicio.lp";
let editor = null;
let completandoFechamento = false;

const lista = document.getElementById("fileList");
const abas = document.getElementById("tabs");
const terminal = document.getElementById("terminal");
const preview = document.getElementById("preview");
const status = document.getElementById("statusText");

const tags = [
    "cabecalho", "rodape", "principal", "secao",
    "artigo", "navegacao", "titulo", "subtitulo",
    "titulo3", "titulo4", "texto", "paragrafo",
    "botao", "caixa", "imagem", "link", "entrada",
    "formulario", "rotulo", "lista", "lista_numerada",
    "item", "tabela", "linha_tabela", "coluna",
    "cabecalho_tabela", "quebra", "linha",
    "estilo", "programa", "video", "audio"
];

const atributos = [
    "identificador", "classe", "destino", "tipo",
    "dica", "alternativa", "largura", "altura",
    "valor", "nome", "origem", "controle",
    "marcado", "obrigatorio", "rotulo"
];

const valoresAtributos = {
    tipo: ["texto", "senha", "email", "numero", "botao", "enviar"],
    controle: ["true", "false"],
    marcado: ["true", "false"],
    obrigatorio: ["true", "false"]
};

function escreverSaida(texto) {
    terminal.textContent = texto;
}

/* CARREGAMENTO E SALVAMENTO */

function carregarProjeto() {
    try {
        const salvo = localStorage.getItem(CHAVE);

        if (!salvo) return;

        const dados = JSON.parse(salvo);

        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            return;
        }

        const validos = {};

        for (const [nome, conteudo] of Object.entries(dados)) {
            if (
                /^[a-zA-Z0-9_-]+\.lp$/.test(nome) &&
                typeof conteudo === "string"
            ) {
                validos[nome] = conteudo;
            }
        }

        if (Object.keys(validos).length) {
            arquivos = validos;
        }
    } catch (erro) {
        escreverSaida("Erro ao carregar o projeto.");
    }

    if (!Object.keys(arquivos).length) {
        arquivos = { "inicio.lp": "" };
    }
}

function salvarProjeto() {
    if (editor) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    localStorage.setItem(CHAVE, JSON.stringify(arquivos));

    status.textContent = "Projeto salvo";
    escreverSaida("Projeto salvo com sucesso.");
}

/* ARQUIVOS */

function atualizarExplorador() {
    lista.innerHTML = "";
    abas.innerHTML = "";

    Object.keys(arquivos).forEach(nome => {
        const item = document.createElement("div");

        item.className = "file";
        item.textContent = nome;

        if (nome === arquivoAtual) {
            item.classList.add("active");
        }

        item.addEventListener("click", () => abrirArquivo(nome));
        lista.appendChild(item);

        const aba = document.createElement("div");

        aba.className = "tab";
        aba.textContent = nome;

        if (nome === arquivoAtual) {
            aba.classList.add("active");
        }

        aba.addEventListener("click", () => abrirArquivo(nome));
        abas.appendChild(aba);
    });
}

function abrirArquivo(nome) {
    if (!Object.prototype.hasOwnProperty.call(arquivos, nome)) {
        return;
    }

    if (editor) {
        arquivos[arquivoAtual] = editor.getValue();
    }

    arquivoAtual = nome;

    if (editor) {
        editor.setValue(arquivos[nome]);
    }

    atualizarExplorador();
    status.textContent = "Editando " + nome;
}

function criarArquivo() {
    const nome = prompt("Nome do novo arquivo .lp:");

    if (!nome) return;

    const nomeFinal = nome.trim();

    if (!/^[a-zA-Z0-9_-]+\.lp$/.test(nomeFinal)) {
        alert("O arquivo precisa terminar em .lp");
        return;
    }

    if (Object.prototype.hasOwnProperty.call(arquivos, nomeFinal)) {
        alert("Esse arquivo já existe.");
        return;
    }

    arquivos[nomeFinal] = "";

    abrirArquivo(nomeFinal);
    salvarProjeto();

    escreverSaida("Arquivo criado: " + nomeFinal);
}

/* EXECUÇÃO */

function executarProjeto() {
    salvarProjeto();

    try {
        const codigo = LipiMotor.montarProjeto(editor.getValue());

        preview.srcdoc = codigo;

        escreverSaida("Arquivo " + arquivoAtual + " executado.");
        status.textContent = "Execução concluída";
    } catch (erro) {
        escreverSaida("Erro: " + erro.message);
        status.textContent = "Erro na execução";
    }
}

/* APARÊNCIA DAS SUGESTÕES */

function corrigirVisualSugestoes() {
    const estilo = document.createElement("style");

    estilo.id = "lipibr-suggest-fix";

    estilo.textContent = `
        .monaco-editor .suggest-widget {
            min-width: 400px !important;
            width: 400px !important;
        }

        .monaco-editor .suggest-widget .monaco-list-row {
            height: 25px !important;
            line-height: 25px !important;
        }

        .monaco-editor .suggest-widget .monaco-list-row .contents {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
        }

        .monaco-editor .suggest-widget .monaco-list-row .main {
            display: flex !important;
            align-items: center !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
        }

        .monaco-editor .suggest-widget .monaco-icon-label {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: auto !important;
            overflow: visible !important;
        }

        .monaco-editor .suggest-widget .label-name,
        .monaco-editor .suggest-widget .monaco-icon-name-container,
        .monaco-editor .suggest-widget .monaco-icon-label-container {
            display: inline !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: #ffffff !important;
            font-size: 13px !important;
        }

        .monaco-editor .suggest-widget .details {
            color: #bbbbbb !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        .monaco-editor .suggest-widget .monaco-list-row .right {
            color: #aaaaaa !important;
        }
    `;

    document.head.appendChild(estilo);
}

/* LINGUAGEM LIPIBR */

function registrarLipi() {
    monaco.languages.register({
        id: "lipi",
        extensions: [".lp"]
    });

    monaco.languages.setMonarchTokensProvider("lipi", {
        tokenizer: {
            root: [
                [/<!--/, "comment", "@comment"],
                [/<\/?[\wÀ-ÿ_-]+/, "tag"],
                [/[a-zA-ZÀ-ÿ_]+(?=\s*=)/, "attribute.name"],
                [/="[^"]*"/, "attribute.value"],
                [/'[^']*'/, "attribute.value"],
                [/>/, "delimiter"],
                [/=/, "delimiter"]
            ],

            comment: [
                [/-->/, "comment", "@pop"],
                [/./, "comment"]
            ]
        }
    });

    monaco.languages.setLanguageConfiguration("lipi", {
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
}

/* AUTOCOMPLETE */

function registrarSugestoes() {
    monaco.languages.registerCompletionItemProvider("lipi", {

        triggerCharacters: ["<", " ", "="],

        provideCompletionItems(modelo, posicao) {
            const linha = modelo.getLineContent(posicao.lineNumber);
            const antes = linha.substring(0, posicao.column - 1);

            const palavra = modelo.getWordUntilPosition(posicao);

            const intervalo = new monaco.Range(
                posicao.lineNumber,
                palavra.startColumn,
                posicao.lineNumber,
                palavra.endColumn
            );

            let itens = [];

            const depoisDoIgual = antes.match(
                /([\wÀ-ÿ_-]+)\s*=\s*["']?([\wÀ-ÿ_-]*)$/
            );

            const dentroDaTag = antes.match(
                /<([\wÀ-ÿ_-]+)\s+([\wÀ-ÿ_-]*)$/
            );

            const digitandoTag = antes.match(
                /<([\wÀ-ÿ_-]*)$/
            );

            if (depoisDoIgual) {
                const atributo = depoisDoIgual[1];

                itens = (valoresAtributos[atributo] || []).map(valor => ({
                    label: valor,
                    filterText: valor,
                    insertText: valor,
                    detail: "Valor do atributo " + atributo,
                    kind: monaco.languages.CompletionItemKind.Value,
                    range: intervalo
                }));

            } else if (dentroDaTag) {
                itens = atributos.map((atributo, indice) => ({
                    label: atributo,
                    filterText: atributo,
                    insertText: atributo + '="$1"',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: "Atributo da linguagem LipiBR",
                    documentation: "Atributo escrito em português.",
                    kind: monaco.languages.CompletionItemKind.Property,
                    sortText: String(indice).padStart(3, "0"),
                    range: intervalo
                }));

            } else if (digitandoTag) {
                itens = tags.map((tag, indice) => ({
                    label: tag,
                    filterText: tag,
                    insertText: tag,
                    detail: "Tag LipiBR",
                    documentation: "Elemento da linguagem LipiBR.",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    sortText: String(indice).padStart(3, "0"),
                    range: intervalo
                }));

            } else {
                itens = tags.map((tag, indice) => ({
                    label: tag,
                    filterText: tag,
                    insertText: tag,
                    detail: "Tag LipiBR",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    sortText: String(indice).padStart(3, "0"),
                    range: intervalo
                }));
            }

            return {
                suggestions: itens
            };
        }
    });
}

/* FECHAMENTO AUTOMÁTICO */

function registrarFechamentoAutomatico() {
    editor.onDidType((caractere) => {
        if (caractere !== ">" || completandoFechamento) {
            return;
        }

        const modelo = editor.getModel();
        const posicao = editor.getPosition();

        const linha = modelo.getLineContent(posicao.lineNumber);
        const antes = linha.substring(0, posicao.column - 1);

        const encontrado = antes.match(
            /<([\wÀ-ÿ_-]+)(?:\s[^<>]*)?$/
        );

        if (!encontrado) return;

        const nomeTag = encontrado[1];

        if (LipiMotor.tagsSemFechamento.includes(nomeTag)) {
            return;
        }

        const depois = linha.substring(posicao.column - 1);

        if (depois.startsWith("</")) return;

        completandoFechamento = true;

        editor.executeEdits("lipi-auto-close", [{
            range: new monaco.Range(
                posicao.lineNumber,
                posicao.column,
                posicao.lineNumber,
                posicao.column
            ),
            text: "</" + nomeTag + ">"
        }]);

        editor.setPosition(posicao);

        completandoFechamento = false;
    });
}

/* INICIALIZAÇÃO */

function iniciarStudio() {
    if (typeof require === "undefined") {
        escreverSaida("Não foi possível carregar o Monaco Editor.");
        return;
    }

    window.MonacoEnvironment = {
        getWorkerUrl: function () {
            const codigo = `
                self.MonacoEnvironment = {
                    baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/"
                };

                importScripts(
                    "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js"
                );
            `;

            return URL.createObjectURL(
                new Blob([codigo], {
                    type: "text/javascript"
                })
            );
        }
    };

    require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    require(["vs/editor/editor.main"], function () {

        carregarProjeto();
        registrarLipi();

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

                quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true
                },

                suggestOnTriggerCharacters: true,

                suggest: {
                    showIcons: true,
                    showWords: true,
                    preview: false,
                    filterGraceful: true,
                    localityBonus: false
                }
            }
        );

        corrigirVisualSugestoes();
        registrarSugestoes();
        registrarFechamentoAutomatico();

        editor.onDidChangeModelContent(() => {
            arquivos[arquivoAtual] = editor.getValue();
            status.textContent = "Alterações não salvas";
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            salvarProjeto
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space,
            () => editor.trigger(
                "teclado",
                "editor.action.triggerSuggest",
                {}
            )
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            executarProjeto
        );

        atualizarExplorador();
        abrirArquivo(arquivoAtual);

        escreverSaida(
            "LipiBR Studio iniciado.\n" +
            "Digite < para ver as tags.\n" +
            "Ctrl + Espaço abre as sugestões."
        );

    }, function () {
        escreverSaida("Erro ao carregar o Monaco Editor.");
    });
}

document.getElementById("newFile").addEventListener("click", criarArquivo);
document.getElementById("saveFiles").addEventListener("click", salvarProjeto);
document.getElementById("runProject").addEventListener("click", executarProjeto);

iniciarStudio();
