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

        if (Object.keys(validos).length > 0) {
            arquivos = validos;
        }
    } catch (erro) {
        escreverSaida("Não foi possível carregar o projeto salvo.");
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

function atualizarExplorador() {
    lista.innerHTML = "";
    abas.innerHTML = "";

    Object.keys(arquivos).forEach(nome => {
        const item = document.createElement("div");
        item.className = "file";

        if (nome === arquivoAtual) {
            item.classList.add("active");
        }

        item.textContent = nome;
        item.addEventListener("click", () => abrirArquivo(nome));
        lista.appendChild(item);

        const aba = document.createElement("div");
        aba.className = "tab";

        if (nome === arquivoAtual) {
            aba.classList.add("active");
        }

        aba.textContent = nome;
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
    editor.setValue(arquivos[nome]);

    atualizarExplorador();
    status.textContent = "Editando " + nome;
}

function criarArquivo() {
    const nome = prompt("Nome do novo arquivo .lp:");

    if (!nome) return;

    const nomeFinal = nome.trim();

    if (!/^[a-zA-Z0-9_-]+\.lp$/.test(nomeFinal)) {
        alert("O nome precisa terminar em .lp");
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

/* REGISTRO DA LINGUAGEM */

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
                [/=/, "delimiter"],
                [/[{}]/, "delimiter"]
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
            const antes = linha.slice(0, posicao.column - 1);

            let sugestoes = [];

            const dentroDeTag = antes.match(/<([\wÀ-ÿ_-]+)\s+([\wÀ-ÿ_-]*)$/);
            const depoisDoIgual = antes.match(/([\wÀ-ÿ_-]+)\s*=\s*["']?([\wÀ-ÿ_-]*)$/);

            if (depoisDoIgual) {
                const atributo = depoisDoIgual[1];

                const valores = valoresAtributos[atributo] || [];

                sugestoes = valores.map((valor, indice) => ({
                    label: valor,
                    filterText: valor,
                    insertText: valor,
                    detail: "Valor de " + atributo,
                    documentation: "Valor disponível na linguagem LipiBR.",
                    kind: monaco.languages.CompletionItemKind.Value,
                    sortText: String(indice).padStart(3, "0")
                }));

            } else if (dentroDeTag) {
                sugestoes = atributos.map((atributo, indice) => ({
                    label: atributo,
                    filterText: atributo,
                    insertText: atributo + '="$1"',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: "Atributo LipiBR",
                    documentation: "Atributo escrito em português.",
                    kind: monaco.languages.CompletionItemKind.Property,
                    sortText: String(indice).padStart(3, "0")
                }));

            } else if (antes.endsWith("<")) {
                sugestoes = tags.map((tag, indice) => ({
                    label: tag,
                    filterText: tag,
                    insertText: tag,
                    detail: "Tag LipiBR",
                    documentation: "Elemento da linguagem LipiBR.",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    sortText: String(indice).padStart(3, "0")
                }));

            } else {
                sugestoes = tags.map((tag, indice) => ({
                    label: tag,
                    filterText: tag,
                    insertText: tag,
                    detail: "Tag LipiBR",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    sortText: String(indice).padStart(3, "0")
                }));
            }

            return { suggestions: sugestoes };
        }
    });
}

/* FECHAMENTO AUTOMÁTICO DE TAGS */

function registrarFechamentoAutomatico() {
    editor.onDidType((caractere) => {
        if (caractere !== ">" || completandoFechamento) {
            return;
        }

        const modelo = editor.getModel();
        const posicao = editor.getPosition();
        const linha = modelo.getLineContent(posicao.lineNumber);
        const antes = linha.slice(0, posicao.column - 1);

        const encontrado = antes.match(/<([\wÀ-ÿ_-]+)(?:\s[^<>]*)?$/);

        if (!encontrado) return;

        const nomeTag = encontrado[1];

        if (LipiMotor.tagsSemFechamento.includes(nomeTag)) {
            return;
        }

        const depois = linha.slice(posicao.column - 1);

        if (depois.startsWith("</")) {
            return;
        }

        const fechamento = "</" + nomeTag + ">";

        completandoFechamento = true;

        editor.executeEdits("lipi-auto-close", [{
            range: new monaco.Range(
                posicao.lineNumber,
                posicao.column,
                posicao.lineNumber,
                posicao.column
            ),
            text: fechamento
        }]);

        editor.setPosition(posicao);
        completandoFechamento = false;
    });
}

/* INICIALIZAÇÃO */

function iniciarStudio() {
    if (typeof require === "undefined") {
        escreverSaida("Não foi possível carregar o Monaco Editor. Verifique sua conexão.");
        return;
    }

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
                importScripts(
                    "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/base/worker/workerMain.js"
                );
            `;

            return URL.createObjectURL(
                new Blob([codigo], { type: "text/javascript" })
            );
        }
    };

    require(["vs/editor/editor.main"], function () {
        registrarLipi();
        registrarSugestoes();
        carregarProjeto();

        if (!arquivos["inicio.lp"] && Object.keys(arquivos).length === 0) {
            arquivos["inicio.lp"] = "";
        }

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
                    preview: true,
                    insertMode: "insert",
                    filterGraceful: true,
                    localityBonus: false
                }
            }
        );

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
            () => editor.trigger("teclado", "editor.action.triggerSuggest", {})
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            executarProjeto
        );

        abrirArquivo("inicio.lp");

        escreverSaida(
            "LipiBR Studio pronto.\n" +
            "Digite < para ver as tags disponíveis.\n" +
            "Use Ctrl + Espaço para abrir as sugestões."
        );
    }, function () {
        escreverSaida("Falha ao carregar o Monaco Editor. Verifique sua conexão.");
    });
}

document.getElementById("newFile").addEventListener("click", criarArquivo);
document.getElementById("saveFiles").addEventListener("click", salvarProjeto);
document.getElementById("runProject").addEventListener("click", executarProjeto);

iniciarStudio();
