
import sys
import re
import ast

COMANDOS = {
    "Verdadeiro": "True",
    "Falso": "False",
    "Nulo": "None",
    "senaose": "elif",
    "senao": "else",
    "se": "if",
    "enquanto": "while",
    "para": "for",
    "em": "in",
    "definir": "def",
    "retornar": "return",
    "importar": "import",
    "de": "from",
    "como": "as",
    "classe": "class",
    "tentar": "try",
    "exceto": "except",
    "finalmente": "finally",
    "levantar": "raise",
    "passar": "pass",
    "continuar": "continue",
    "parar": "break",
    "com": "with",
    "global": "global",
    "nao_local": "nonlocal",
    "apagar": "del",
    "afirmar": "assert",
    "asincrono": "async",
    "aguardar": "await",
    "mostrar": "print",
    "perguntar": "input",
    "intervalo": "range",
    "comprimento": "len",
    "tipo": "type",
    "texto": "str",
    "numero": "int",
    "decimal": "float",
    "lista": "list",
    "dicionario": "dict",
    "conjunto": "set",
    "tupla": "tuple",
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
    "ajuda": "help",
    "id": "id",
    "representar": "repr",
    "arredondar": "round",
    "potencia": "pow",
    "aberto": "open",
}

def traduzir_linha(linha):
    resultado = []
    palavra = ""
    aspas = None
    escapar = False

    def converter(p):
        return COMANDOS.get(p, p)

    for caractere in linha:
        if aspas:
            palavra += caractere

            if escapar:
                escapar = False
            elif caractere == "\\":
                escapar = True
            elif caractere == aspas:
                aspas = None
                resultado.append(palavra)
                palavra = ""

        elif caractere in ("'", '"'):
            if palavra:
                resultado.append(converter(palavra))
                palavra = ""
            aspas = caractere
            palavra = caractere

        elif caractere.isalnum() or caractere == "_":
            palavra += caractere

        else:
            if palavra:
                resultado.append(converter(palavra))
                palavra = ""
            resultado.append(caractere)

    if palavra:
        resultado.append(converter(palavra))

    return "".join(resultado)


def executar(codigo):
    linhas = codigo.splitlines()
    codigo_python = []

    for linha in linhas:
        if linha.strip().startswith("#"):
            codigo_python.append(linha)
        else:
            codigo_python.append(traduzir_linha(linha))

    programa = "\n".join(codigo_python)

    try:
        arvore = ast.parse(programa, filename="<programa.lp>")
        exec(compile(arvore, "<programa.lp>", "exec"), {"__name__": "__main__"})
    except Exception as erro:
        print("Erro na Lipi:", erro)


def executar_arquivo(caminho):
    if not caminho.endswith(".lp"):
        print("Erro: os programas Lipi devem terminar em .lp")
        return

    try:
        with open(caminho, "r", encoding="utf-8") as arquivo:
            executar(arquivo.read())
    except FileNotFoundError:
        print("Erro: arquivo não encontrado:", caminho)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        executar_arquivo(sys.argv[1])
    else:
        print("LipiBR 1.0")
        print("Digite sair para encerrar.")

        while True:
            try:
                linha = input("Lipi > ")

                if linha.strip().lower() == "sair":
                    break

                executar(linha)
            except KeyboardInterrupt:
                break
