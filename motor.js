const LipiMotor = {

    html(codigo) {
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

        return codigo.replace(
            /<\/?([a-zA-ZÀ-ÿ][\wÀ-ÿ-]*)\b/g,
            (completo, nome) => {
                const original = nome.toLowerCase();
                const tag = tags[original];

                if (!tag) return completo;

                return completo.replace(nome, tag);
            }
        );
    },

    css(codigo) {
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
            posicao: "position",
            topo: "top",
            esquerda: "left",
            direita: "right",
            inferior: "bottom",
            flexibilidade: "flex",
            direcao: "flex-direction",
            justificacao: "justify-content",
            itens: "align-items",
            cursor: "cursor"
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

        let resultado = codigo;

        for (const [portugues, css] of Object.entries(propriedades)) {
            const regex = new RegExp("\\b" + portugues + "\\s*:", "gi");
            resultado = resultado.replace(regex, css + ":");
        }

        for (const [portugues, css] of Object.entries(valores)) {
            const regex = new RegExp("\\b" + portugues + "\\b", "gi");
            resultado = resultado.replace(regex, css);
        }

        return resultado;
    },

    js(codigo) {
        return codigo.replace(/\bshow\s*\(/g, "console.log(");
    },

    executar(html, css, js) {
        const pagina = this.html(html);
        const estilo = this.css(css);
        const programa = this.js(js);

        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <style>${estilo}</style>
            </head>
            <body>
                ${pagina}
                <script>
                    try {
                        ${programa}
                    } catch (erro) {
                        console.error(erro);
                    }
                <\/script>
            </body>
            </html>
        `;
    }
};
