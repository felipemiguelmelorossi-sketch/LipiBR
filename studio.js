
(() => {
    const arquivosPadrao = {
        "pagina.lhtml": `<pagina>
    <cabecalho>
        <titulo>Meu primeiro site</titulo>
    </cabecalho>

    <conteudo>
        <texto>Bem-vindo ao LipiBR!</texto>
        <botao id="meuBotao">Clique aqui</botao>
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

document.getElementById("meuBotao").onclick = function() {
    alert("Você executou seu primeiro programa!")
}`
    };

    let arquivos = {};
    let pastas = [];
    let arquivoAtual = "pagina.lhtml";
    let editor = null;
    let modelos = {};
    let modoModal = "arquivo";

    const $ = id => document.getElementById(id);
    const output = $("output");

    function informar(mensagem) {
        output.textContent += "\n" + mensagem;
        output.scrollTop = output.scrollHeight;
    }

    function salvar() {
        if (editor && modelos[arquivoAtual]) {
            arquivos[arquivoAtual] = editor.getValue();
        }

        localStorage.setItem("lipibr_arquivos", JSON.stringify(arquivos));
        localStorage.setItem("lipibr_pastas", JSON.stringify(pastas));

        $("statusMessage").textContent = "Salvo";
        informar("Projeto salvo neste navegador.");
    }

    function carregar() {
        try {
            const salvos = JSON.parse(
                localStorage.getItem("lipibr_arquivos") || "null"
            );

            arquivos = salvos && typeof salvos === "object"
                ? salvos
                : { ...arquivosPadrao };

            pastas = JSON.parse(
                localStorage.getItem("lipibr_pastas") || "[]"
            );
        } catch {
            arquivos = { ...arquivosPadrao };
            pastas = [];
        }

        if (!Object.keys(arquivos).length) {
            arquivos = { ...arquivosPadrao };
        }
    }

    function linguagem(nome) {
        const extensao = nome.split(".").pop().toLowerCase();

        if (extensao === "lhtml") return "html";
        if (extensao === "lcss") return "css";
        if (extensao === "ljs") return "javascript";
        if (extensao === "html") return "html";
        if (extensao === "css") return "css";
        if (extensao === "js") return "javascript";

        return "plaintext";
    }

    function icone(nome) {
        const extensao = nome.split(".").pop().toLowerCase();

        if (extensao === "lhtml" || extensao === "html") {
            return ["◇", "html-icon"];
        }

        if (extensao === "lcss" || extensao === "css") {
            return ["◇", "css-icon"];
        }

        if (extensao === "ljs" || extensao === "js") {
            return ["◇", "js-icon"];
        }

        return ["◇", "lp-icon"];
    }

    function renderizarArquivos() {
        const lista = $("fileList");
        lista.innerHTML = "";

        Object.keys(arquivos).sort().forEach(nome => {
            const botao = document.createElement("button");
            const [simbolo, classe] = icone(nome);

            botao.className = "file" +
                (nome === arquivoAtual ? " active" : "");

            const iconeElemento = document.createElement("span");
            iconeElemento.className = "file-icon " + classe;
            iconeElemento.textContent = simbolo;

            const texto = document.createElement("span");
            texto.textContent = nome;

            botao.append(iconeElemento, texto);

            botao.addEventListener("click", () => abrirArquivo(nome));

            lista.appendChild(botao);
        });

        pastas.forEach(nome => {
            const pasta = document.createElement("div");
            pasta.className = "file";
            pasta.textContent = "▸ " + nome;
            lista.appendChild(pasta);
        });
    }

    function renderizarAbas() {
        const abas = $("tabs");
        abas.innerHTML = "";

        const aba = document.createElement("button");
        aba.className = "tab active";
        aba.textContent = arquivoAtual;

        abas.appendChild(aba);
    }

    function abrirArquivo(nome) {
        if (!(nome in arquivos)) return;

        if (editor && modelos[arquivoAtual]) {
            arquivos[arquivoAtual] = editor.getValue();
        }

        arquivoAtual = nome;

        const modelo = modelos[nome];

        if (modelo) {
            editor.setModel(modelo);
        } else {
            const uri = monaco.Uri.parse("file:///" + nome);
            modelos[nome] = monaco.editor.createModel(
                arquivos[nome],
                linguagem(nome),
                uri
            );
            editor.setModel(modelos[nome]);
        }

        $("statusFile").textContent = nome;
        renderizarArquivos();
        renderizarAbas();
    }

    function configurarSugestoes() {
        const snippetsHTML = [
            {
                label: "pagina",
                insertText: "<pagina>\n\t$0\n</pagina>",
                detail: "Estrutura de página LipiHTML"
            },
            {
                label: "cabecalho",
                insertText: "<cabecalho>\n\t$0\n</cabecalho>",
                detail: "Cabeçalho"
            },
            {
                label: "conteudo",
                insertText: "<conteudo>\n\t$0\n</conteudo>",
                detail: "Conteúdo principal"
            },
            {
                label: "titulo",
                insertText: "<titulo>$1</titulo>",
                detail: "Título"
            },
            {
                label: "texto",
                insertText: "<texto>$1</texto>",
                detail: "Texto"
            },
            {
                label: "botao",
                insertText: '<botao id="$1">$2</botao>',
                detail: "Botão"
            },
            {
                label: "entrada",
                insertText: '<entrada id="$1" tipo="texto">',
                detail: "Campo de entrada"
            }
        ];

        const snippetsCSS = [
            ["fundo", "fundo: ${1:#101010};"],
            ["cor", "cor: ${1:branco};"],
            ["largura", "largura: ${1:100%};"],
            ["altura", "altura: ${1:100px};"],
            ["espacamento", "espacamento: ${1:20px};"],
            ["margem", "margem: ${1:10px};"],
            ["alinhamento", "alinhamento: ${1:centralizado};"],
            ["raio", "raio: ${1:8px};"],
            ["sombra", "sombra: ${1:0 0 10px #000};"],
            ["exibicao", "exibicao: ${1:flex};"],
            ["justificacao", "justificacao: ${1:centralizado};"],
            ["itens", "itens: ${1:centralizado};"]
        ];

        const snippetsJS = [
            {
                label: "show",
                insertText: "show(${1:mensagem})",
                detail: "Exibe uma mensagem no terminal"
            },
            {
                label: "funcao",
                insertText: "function ${1:nome}(${2}) {\n\t$0\n}",
                detail: "Cria uma função"
            },
            {
                label: "if",
                insertText: "if (${1:condicao}) {\n\t$0\n}",
                detail: "Condição"
            },
            {
                label: "for",
                insertText: "for (let i = 0; i < ${1:10}; i++) {\n\t$0\n}",
                detail: "Laço de repetição"
            },
            {
                label: "while",
                insertText: "while (${1:condicao}) {\n\t$0\n}",
                detail: "Repetição while"
            },
            {
                label: "array",
                insertText: "let ${1:itens} = [${2}];",
                detail: "Cria uma lista"
            },
            {
                label: "evento",
                insertText: 'document.getElementById("${1:id}").onclick = function() {\n\t$0\n}',
                detail: "Evento de clique"
            },
            {
                label: "console",
                insertText: "console.log(${1:valor});",
                detail: "Exibe valor no console"
            }
        ];

        monaco.languages.registerCompletionItemProvider("html", {
            provideCompletionItems() {
                return {
                    suggestions: snippetsHTML.map(item => ({
                        label: item.label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: item.insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: item.detail
                    }))
                };
            }
        });

        monaco.languages.registerCompletionItemProvider("css", {
            provideCompletionItems() {
                return {
                    suggestions: snippetsCSS.map(([label, insertText]) => ({
                        label,
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }))
                };
            }
        });

        monaco.languages.registerCompletionItemProvider("javascript", {
            provideCompletionItems() {
                return {
                    suggestions: snippetsJS.map(item => ({
                        label: item.label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: item.insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: item.detail
                    }))
                };
            }
        });
    }

    function configurarEditor() {
        monaco.editor.defineTheme("lipibr-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#1e1e1e",
                "editor.foreground": "#d4d4d4",
                "editorLineNumber.foreground": "#858585",
                "editorLineNumber.activeForeground": "#c6c6c6",
                "editorCursor.foreground": "#aeafad",
                "editor.selectionBackground": "#264f78",
                "editor.lineHighlightBackground": "#252526",
                "editorWidget.background": "#252526",
                "editorSuggestWidget.background": "#252526",
                "editorSuggestWidget.border": "#454545"
            }
        });

        editor = monaco.editor.create($("editor"), {
            value: "",
            language: "html",
            theme: "lipibr-dark",
            automaticLayout: true,
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: 13,
            lineHeight: 22,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingOvertype: "always",
            autoIndent: "full",
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordWrap: "off",
            padding: { top: 10 }
        });

        configurarSugestoes();

        editor.onDidChangeModelContent(() => {
            $("statusMessage").textContent = "Modificado";
            arquivos[arquivoAtual] = editor.getValue();
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            salvar
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS |
            monaco.KeyMod.Shift,
            executar
        );
    }

    function executar() {
        if (!editor) return;

        arquivos[arquivoAtual] = editor.getValue();

        salvarSemMensagem();
        output.textContent = "Executando projeto...";

        try {
            const documento = LipiMotor.montarProjeto(arquivos);
            $("preview").srcdoc = documento;
            informar("Pré-visualização atualizada.");
            $("statusMessage").textContent = "Executado";
        } catch (erro) {
            informar("Erro: " + erro.message);
            $("statusMessage").textContent = "Erro";
        }
    }

    function salvarSemMensagem() {
        if (editor) arquivos[arquivoAtual] = editor.getValue();

        localStorage.setItem("lipibr_arquivos", JSON.stringify(arquivos));
        localStorage.setItem("lipibr_pastas", JSON.stringify(pastas));
    }

    function abrirModal(tipo) {
        modoModal = tipo;
        $("modalTitle").textContent =
            tipo === "arquivo" ? "Novo arquivo" : "Nova pasta";

        $("newName").value = "";
        $("newName").placeholder =
            tipo === "arquivo"
                ? "exemplo.ljs, pagina.lhtml ou estilo.lcss"
                : "Nome da pasta";

        $("fileModal").classList.add("open");
        $("newName").focus();
    }

    function criarItem() {
        const nome = $("newName").value.trim();

        if (!nome) return;

        if (modoModal === "pasta") {
            if (pastas.includes(nome)) {
                alert("Essa pasta já existe.");
                return;
            }

            pastas.push(nome);
        } else {
            if (!/\.(ljs|lhtml|lcss|js|html|css)$/i.test(nome)) {
                alert("Use uma extensão .ljs, .lhtml ou .lcss.");
                return;
            }

            if (Object.hasOwn(arquivos, nome)) {
                alert("Esse arquivo já existe.");
                return;
            }

            arquivos[nome] = "";
        }

        salvarSemMensagem();
        $("fileModal").classList.remove("open");
        renderizarArquivos();

        if (modoModal === "arquivo") {
            abrirArquivo(nome);
        }

        informar(
            (modoModal === "arquivo" ? "Arquivo criado: " : "Pasta criada: ") + nome
        );
    }

    window.addEventListener("message", evento => {
        if (evento.data?.type === "lipibr-console") {
            informar("> " + evento.data.values.join(" "));
        }

        if (evento.data?.type === "lipibr-error") {
            informar("Erro no programa: " + evento.data.message);
        }
    });

    $("save").addEventListener("click", salvar);
    $("run").addEventListener("click", executar);
    $("refresh").addEventListener("click", executar);

    $("newFile").addEventListener("click", () => abrirModal("arquivo"));
    $("newFolder").addEventListener("click", () => abrirModal("pasta"));

    $("cancelModal").addEventListener("click", () => {
        $("fileModal").classList.remove("open");
    });

    $("confirmModal").addEventListener("click", criarItem);

    $("newName").addEventListener("keydown", evento => {
        if (evento.key === "Enter") criarItem();
        if (evento.key === "Escape") {
            $("fileModal").classList.remove("open");
        }
    });

    $("menuArquivo").addEventListener("click", () => abrirModal("arquivo"));
    $("menuEditar").addEventListener("click", () => {
        editor.focus();
        informar("Use Ctrl+Z para desfazer e Ctrl+Shift+Z para refazer.");
    });
    $("menuExibir").addEventListener("click", () => {
        editor.focus();
        informar("Editor focado.");
    });
    $("menuAjuda").addEventListener("click", () => {
        informar("LipiBR Studio: Ctrl+Espaço abre sugestões de código.");
    });

    carregar();

    if (!window.require) {
        output.textContent =
            "Não foi possível carregar o Monaco Editor. Verifique sua conexão e recarregue a página.";
        return;
    }

    window.require.config({
        paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
    });

    window.require(["vs/editor/editor.main"], () => {
        configurarEditor();

        Object.keys(arquivos).forEach(nome => {
            modelos[nome] = monaco.editor.createModel(
                arquivos[nome],
                linguagem(nome),
                monaco.Uri.parse("file:///" + nome)
            );
        });

        abrirArquivo(
            arquivos["pagina.lhtml"] !== undefined
                ? "pagina.lhtml"
                : Object.keys(arquivos)[0]
        );

        informar("Monaco Editor carregado.");
        informar("Autocomplete e fechamento automático ativados.");
        informar("Use Ctrl+Espaço para ver sugestões.");

        executar();
    });
})();
