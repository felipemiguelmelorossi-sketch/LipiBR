
window.LipiMotor = (() => {
    const tags = {
        pagina: "div",
        cabecalho: "header",
        rodape: "footer",
        conteudo: "main",
        secao: "section",
        titulo: "h1",
        subtitulo: "h2",
        texto: "p",
        botao: "button",
        caixa: "div",
        imagem: "img",
        link: "a",
        entrada: "input",
        lista: "ul",
        item: "li"
    };

    const propriedades = {
        fundo: "background",
        cor: "color",
        largura: "width",
        altura: "height",
        espacamento: "padding",
        margem: "margin",
        alinhamento: "text-align",
        borda: "border",
        raio: "border-radius",
        sombra: "box-shadow",
        tamanho: "font-size",
        fonte: "font-family",
        exibicao: "display",
        direcao: "flex-direction",
        justificacao: "justify-content",
        itens: "align-items"
    };

    const valores = {
        centralizado: "center",
        negrito: "bold",
        branco: "white",
        preto: "black",
        azul: "blue",
        vermelho: "red",
        verde: "green",
        transparente: "transparent"
    };

    function traduzirHTML(codigo) {
        return codigo.replace(
            /<\/?([a-zA-ZÀ-ÿ][\wÀ-ÿ-]*)\b/g,
            (original, nome) => {
                const traduzida = tags[nome.toLowerCase()];
                return traduzida
                    ? original.replace(nome, traduzida)
                    : original;
            }
        );
    }

    function traduzirCSS(codigo) {
        let resultado = codigo;

        for (const [pt, css] of Object.entries(propriedades)) {
            resultado = resultado.replace(
                new RegExp("\\b" + pt + "\\s*:", "gi"),
                css + ":"
            );
        }

        for (const [pt, css] of Object.entries(valores)) {
            resultado = resultado.replace(
                new RegExp("\\b" + pt + "\\b", "gi"),
                css
            );
        }

        return resultado;
    }

    function traduzirJS(codigo) {
        return codigo.replace(/\bshow\s*\(/g, "console.log(");
    }

    function montarProjeto(arquivos) {
        const html = traduzirHTML(arquivos["pagina.lhtml"] || "");
        const css = traduzirCSS(arquivos["estilo.lcss"] || "");
        const js = traduzirJS(arquivos["codigo.ljs"] || "");

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${css}</style>
</head>
<body>
${html}
<script>
(function() {
    const originalLog = console.log;
    console.log = function(...args) {
        parent.postMessage({
            type: "lipibr-console",
            values: args.map(value => {
                try {
                    return typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value);
                } catch {
                    return String(value);
                }
            })
        }, "*");
        originalLog.apply(console, args);
    };

    window.onerror = function(message, source, line) {
        parent.postMessage({
            type: "lipibr-error",
            message: String(message),
            line
        }, "*");
    };

    try {
        ${js}
    } catch (error) {
        console.error(error);
        parent.postMessage({
            type: "lipibr-error",
            message: error.message
        }, "*");
    }
})();
<\/script>
</body>
</html>`;
    }

    return {
        traduzirHTML,
        traduzirCSS,
        traduzirJS,
        montarProjeto
    };
})();
