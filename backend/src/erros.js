// Erro de validação: a mensagem pode ser mostrada ao utilizador (resposta 400).
// Qualquer outro erro é tratado como falha interna (500) sem expor detalhes.
class ErroValidacao extends Error {}
module.exports = { ErroValidacao };
