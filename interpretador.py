
import io
import tokenize

COMANDOS = {
    # Estrutura e condições
    "se": "if",
    "senao": "else",
    "senão": "else",
    "senaose": "elif",
    "senãose": "elif",
    "enquanto": "while",
    "para": "for",
    "em": "in",
    "e": "and",
    "ou": "or",
    "nao": "not",
    "não": "not",
    "eh": "is",

    # Funções e classes
    "definir": "def",
    "retornar": "return",
    "classe": "class",
    "passar": "pass",
    "continuar": "continue",
    "parar": "break",
    "apagar": "del",
    "global": "global",
    "nao_local": "nonlocal",
    "afirmar": "assert",
    "levantar": "raise",

    # Tratamento de erros
    "tentar": "try",
    "exceto": "except",
    "finalmente": "finally",

    # Importações
    "importar": "import",
    "de": "from",
    "como": "as",

    # Contexto e assincronia
    "com": "with",
    "asincrono": "async",
    "aguardar": "await",

    # Valores
    "verdadeiro": "True",
    "falso": "False",
    "nulo": "None",

    # Entrada e saída
    "mostrar": "print",
    "imprimir": "print",
    "perguntar": "input",

    # Tipos
    "texto": "str",
    "numero": "int",
    "decimal": "float",
    "complexo": "complex",
    "lista": "list",
    "tupla": "tuple",
    "dicionario": "dict",
    "conjunto": "set",

    # Funções internas
    "comprimento": "len",
    "intervalo": "range",
    "tipo": "type",
    "ajuda": "help",
    "identidade": "id",
    "absoluto": "abs",
    "soma": "sum",
    "minimo": "min",
    "maximo": "max",
    "ordenar": "sorted",
    "enumerar": "enumerate",
    "zipar": "zip",
    "mapear": "map",
    "filtrar": "filter",
    "qualquer": "any",
    "todos": "all",
    "reverter": "reversed",
    "arredondar": "round",
    "potencia": "pow",
    "aberto": "open",
}


def traduzir(codigo):
    resultado = []

    tokens = tokenize.generate_tokens(
        io.StringIO(codigo).readline
    )

    for token in tokens:
        if token.type == tokenize.NAME:
            palavra = token.string

            if palavra in COMANDOS:
                token = token._replace(
                    string=COMANDOS[palavra]
                )

        resultado.append(token)

    return tokenize.untokenize(resultado)


def executar(codigo, ambiente=None):
    codigo_python = traduzir(codigo)

    if ambiente is None:
        ambiente = {"__name__": "__main__"}

    exec(
        compile(codigo_python, "<LipiBR>", "exec"),
        ambiente
    )

    return ambiente
