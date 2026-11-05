
window.LipiMotor = (() => {
    const tags = {
        pagina: "div",
        cabecalho: "header",
        rodape: "footer",
        conteudo: "main",
        secao: "section",
        artigo: "article",
        navegacao: "nav",
        titulo: "h1",
        subtitulo: "h2",
        titulo3: "h3",
        texto: "p",
        paragrafo: "p",
        botao: "button",
        caixa: "div",
        imagem: "img",
        link: "a",
        entrada: "input",
        formulario: "form",
        rotulo: "label",
        lista: "ul",
        item: "li",
        quebra: "br",
        linha: "hr",
        video: "video"
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
        itens: "align-items",
        cursor: "cursor",
        opacidade: "opacity",
        posicao: "position",
        grade: "display",
        coluna: "grid-column",
        linhas: "line-height",
        transicao: "transition",
        preenchimento: "padding",
        contorno: "outline",
        estouro: "overflow",
        minimo: "min-width",
        maximo: "max-width"
    };

    const valores = {
        centralizado: "center",
        esquerda: "left",
        direita: "right",
        negrito: "bold",
        branco: "white",
        preto: "black",
        azul: "blue",
        vermelho: "red",
        verde: "green",
        transparente: "transparent",
        flexivel: "flex",
        grade: "grid",
        nenhum: "none",
        relativo: "relative",
        absoluto: "absolute",
        fixo: "fixed"
    };

    function traduzirHTML(codigo) {
        return codigo.replace(
            /(<\/?)([a-zA-ZÀ-ÿ][\wÀ-ÿ-]*)/g,
            (trecho, abertura, nome) => {
                const traducao = tags[nome.toLowerCase()];
                return traducao ? abertura + traducao : trecho;
            }
        );
    }

    function traduzirCSS(codigo) {
        let resultado = codigo;

        for (const [portugues, css] of Object.entries(propriedades)) {
            resultado = resultado.replace(
                new RegExp("\\b" + portugues + "\\s*:", "gi"),
                css + ":"
            );
        }

        for (const [portugues, css] of Object.entries(valores)) {
            resultado = resultado.replace(
                new RegExp("\\b" + portugues + "\\b", "gi"),
                css
            );
        }

        return resultado;
    }

    function traduzirJS(codigo) {
        return codigo
            .replace(/\bmostrar\s*\(/g, "console.log(")
            .replace(/\bperguntar\s*\(/g, "prompt(")
            .replace(/\balertar\s*\(/g, "alert(");
    }

    function montarProjeto(arquivos) {
        const html =
            arquivos["pagina.lhtml"] ||
            arquivos["index.html"] ||
            "";

        const css =
            arquivos["estilo.lcss"] ||
            arquivos["style.css"] ||
            "";

        const js =
            arquivos["codigo.ljs"] ||
            arquivos["script.js"] ||
            "";

        const pagina = traduzirHTML(html);
        const estilo = traduzirCSS(css);
        const programa = traduzirJS(js);

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${estilo}
</style>
</head>
<body>
${pagina}
<script>
try {
${programa}
} catch (erro) {
    document.body.insertAdjacentHTML(
        "beforeend",
        "<pre style='color:red'>Erro: " + String(erro.message) + "</pre>"
    );
}
<\/script>
</body>
</html>`;
    }

    return {
        tags,
        propriedades,
        traduzirHTML,
        traduzirCSS,
        traduzirJS,
        montarProjeto
    };
})();
