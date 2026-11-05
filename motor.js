window.LipiMotor = (() => {

    const tags = {
        documento: "html",
        configuracao: "head",
        corpo: "body",
        titulo_pagina: "title",
        cabecalho: "header",
        rodape: "footer",
        principal: "main",
        secao: "section",
        artigo: "article",
        navegacao: "nav",
        titulo: "h1",
        subtitulo: "h2",
        titulo3: "h3",
        titulo4: "h4",
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
        lista_numerada: "ol",
        item: "li",
        tabela: "table",
        linha_tabela: "tr",
        coluna: "td",
        cabecalho_tabela: "th",
        quebra: "br",
        linha: "hr",
        estilo: "style",
        programa: "script",
        video: "video",
        audio: "audio"
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
        nome: "name",
        origem: "src",
        controle: "controls",
        marcado: "checked",
        obrigatorio: "required",
        rotulo: "for"
    };

    function traduzir(codigo) {
        let resultado = codigo;

        resultado = resultado.replace(
            /(<\/?)([a-zA-ZÀ-ÿ_][\wÀ-ÿ-]*)/g,
            (trecho, abertura, nome) => {
                const nomeOriginal = nome.toLowerCase();
                return abertura + (tags[nomeOriginal] || nome);
            }
        );

        resultado = resultado.replace(
            /\b(identificador|classe|destino|tipo|dica|alternativa|largura|altura|valor|nome|origem|controle|marcado|obrigatorio|rotulo)\s*=/gi,
            (trecho, nome) => atributos[nome.toLowerCase()] + "="
        );

        return resultado;
    }

    function montarProjeto(codigo) {
        const html = traduzir(codigo);

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${html}
</body>
</html>`;
    }

    return {
        traduzir,
        montarProjeto
    };

})();
