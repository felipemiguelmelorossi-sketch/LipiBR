window.LipiMotor = (() => {

    const tags = {
        site: "div",
        pagina: "div",
        cabecalho: "header",
        rodape: "footer",
        principal: "main",
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

    const atributos = {
        identificador: "id",
        classe: "class",
        destino: "href",
        tipo: "type",
        dica: "placeholder",
        alternativa: "alt",
        largura: "width",
        altura: "height",
        valor: "value",
        nome: "name"
    };

    const propriedades = {
        fundo: "background",
        cor: "color",
        largura: "width",
        altura: "height",
        margem: "margin",
        espacamento: "padding",
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
        preenchimento: "padding",
        contorno: "outline",
        estouro: "overflow",
        transicao: "transition",
        linhas: "line-height",
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
        ).replace(
            /\b(identificador|classe|destino|tipo|dica|alternativa|largura|altura|valor|nome)\s*=/gi,
            (trecho, nome) => atributos[nome.toLowerCase()] + "="
        );
    }

    function traduzirCSS(codigo) {
        let resultado = codigo;

        for (const [portugues, css] of Object.entries(propriedades)) {
            const regra = new RegExp("\\b" + portugues + "\\s*:", "gi");
            resultado = resultado.replace(regra, css + ":");
        }

        for (const [portugues, css] of Object.entries(valores)) {
            const regra = new RegExp("\\b" + portugues + "\\b", "gi");
            resultado = resultado.replace(regra, css);
        }

        return resultado;
    }

    function traduzirJS(codigo) {
        return codigo
            .replace(/\bmostrar\s*\(/g, "console.log(")
            .replace(/\balertar\s*\(/g, "alert(")
            .replace(/\bperguntar\s*\(/g, "prompt(")
            .replace(/\bobterElemento\s*\(/g, "document.getElementById(");
    }

    function montarProjeto(arquivos) {
        const html = traduzirHTML(arquivos["inicio.lhtml"] || "");
        const css = traduzirCSS(arquivos["estilo.lcss"] || "");
        const js = traduzirJS(arquivos["codigo.ljs"] || "");

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${css}
</style>
</head>
<body>
${html}
<script>
try {
${js}
} catch (erro) {
    document.body.innerHTML +=
        '<pre style="color:red">Erro: ' + erro.message + '</pre>';
}
<\/script>
</body>
</html>`;
    }

    return {
        tags,
        atributos,
        propriedades,
        valores,
        traduzirHTML,
        traduzirCSS,
        traduzirJS,
        montarProjeto
    };

})();
