
window.LipiMotor = (() => {
    const tags = {
        pagina:"div", cabecalho:"header", rodape:"footer",
        conteudo:"main", secao:"section", titulo:"h1",
        subtitulo:"h2", texto:"p", botao:"button",
        caixa:"div", imagem:"img", link:"a",
        entrada:"input", lista:"ul", item:"li"
    };

    const propriedades = {
        fundo:"background",
        cor:"color",
        largura:"width",
        altura:"height",
        espacamento:"padding",
        margem:"margin",
        alinhamento:"text-align",
        borda:"border",
        raio:"border-radius",
        sombra:"box-shadow",
        tamanho:"font-size",
        fonte:"font-family",
        exibicao:"display",
        direcao:"flex-direction",
        justificacao:"justify-content",
        itens:"align-items",
        cursor:"cursor"
    };

    const valores = {
        centralizado:"center",
        negrito:"bold",
        branco:"white",
        preto:"black",
        azul:"blue",
        vermelho:"red",
        verde:"green",
        transparente:"transparent"
    };

    function traduzirHTML(codigo) {
        return codigo.replace(
            /<\/?([a-zA-ZÀ-ÿ][\wÀ-ÿ-]*)\b/g,
            (trecho, nome) => {
                const tag = tags[nome.toLowerCase()];
                return tag ? trecho.replace(nome, tag) : trecho;
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
        return codigo.replace(/\bmostrar\s*\(/g, "console.log(")
                     .replace(/\bshow\s*\(/g, "console.log(");
    }

    function montarProjeto(arquivos) {
        const html = arquivos["index.html"] || arquivos["pagina.lhtml"] || "";
        const css = arquivos["style.css"] || arquivos["estilo.lcss"] || "";
        const js = arquivos["script.js"] || arquivos["codigo.ljs"] || "";

        const pagina = html.includes("<!DOCTYPE")
            ? html
            : `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${traduzirHTML(html)}</body></html>`;

        const estilo = html.includes("<!DOCTYPE")
            ? traduzirCSS(css)
            : traduzirCSS(css);

        const programa = traduzirJS(js);

        const documento = new DOMParser().parseFromString(pagina, "text/html");
        const style = documento.createElement("style");
        style.textContent = estilo;
        documento.head.appendChild(style);

        const script = documento.createElement("script");
        script.textContent = programa;
        documento.body.appendChild(script);

        return "<!DOCTYPE html>\n" + documento.documentElement.outerHTML;
    }

    return {
        traduzirHTML,
        traduzirCSS,
        traduzirJS,
        montarProjeto
    };
})();
