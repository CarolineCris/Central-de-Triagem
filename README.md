# Central de Solicitações com IA

Protótipo de atendimento que utiliza inteligência artificial para classificar solicitações, registrar informações em uma planilha e preparar sugestões de resposta para revisão humana.

O projeto foi inspirado na minha experiência no atendimento do Instituto de Previdência Municipal de São Paulo (IPREM) e desenvolvido para explorar como automação e IA podem apoiar serviços públicos.

> Projeto independente e demonstrativo, sem vínculo institucional com o IPREM. Utilize apenas dados fictícios.

## O problema

Solicitações de atendimento chegam com diferentes assuntos e formas de escrita. Identificar o serviço solicitado, organizar o registro e localizar orientações são etapas que exigem trabalho da equipe.

Este projeto explora a automação dessas etapas, mantendo a revisão humana das respostas.

## Funcionalidades

- Recebimento de solicitações por uma interface web.
- Classificação de mensagens com inteligência artificial.
- Registro das solicitações no Google Sheets.
- Consulta a uma base de orientações por um agente de IA.
- Geração de rascunhos de resposta para revisão humana.
- Exibição da categoria, do status e da sugestão de resposta na interface.
- Encaminhamento de assuntos não reconhecidos para triagem manual.

## Categorias

| Categoria | Exemplos de solicitações |
|---|---|
| Acesso ao portal | Dificuldades de acesso e pedidos relacionados a senhas |
| Documentos e certidões | Certidão de dependentes e certidão negativa |
| Empréstimo consignado | Dúvidas sobre margem consignável e consignado |
| Processos administrativos | Isenção de Imposto de Renda e reestruturação de carreiras |
| A classificar | Assuntos que precisam de triagem manual |

## Tecnologias utilizadas

- **n8n:** construção e execução dos fluxos de automação.
- **Google Gemini:** classificação de mensagens e geração de rascunhos.
- **Google Sheets:** registro das solicitações e armazenamento da base de orientações.
- **Replit:** desenvolvimento da aplicação com apoio de IA.
- **API HTTP e Webhook:** comunicação entre a aplicação e o n8n.
- **JSON:** formato de troca de dados entre os componentes.

## Como funciona

1. A pessoa informa um nome fictício e uma mensagem na aplicação.
2. O servidor envia a solicitação ao Webhook autenticado do n8n.
3. O classificador identifica a categoria da mensagem.
4. O fluxo define a categoria e o status e registra a solicitação no Google Sheets.
5. O agente de IA consulta a base de orientações e prepara um rascunho.
6. O n8n devolve o resultado para exibição na aplicação.

## Configuração da integração

Para reproduzir a solução, é necessário configurar a aplicação, o workflow do n8n, as credenciais do modelo de IA e as planilhas.

A integração da aplicação com o n8n utiliza estas variáveis no servidor:

| Variável | Finalidade |
|---|---|
| N8N_WEBHOOK_URL | URL do Webhook do n8n |
| N8N_API_KEY | Chave enviada no cabeçalho x-api-key |

Para execução automática, o workflow deve estar publicado e a aplicação deve utilizar a URL de produção do Webhook.

As credenciais devem ser configuradas no ambiente de execução e não devem ser incluídas no repositório.

## Testes e aprendizados

Foram realizados testes manuais com mensagens fictícias nas cinco categorias.

Durante o desenvolvimento, trabalhei na configuração de conexões entre nós, no mapeamento de campos e na investigação de falhas na comunicação entre a aplicação e o n8n.

Um dos problemas encontrados foi um espaço adicional no final do nome de uma categoria, que impedia a validação da resposta na aplicação. A correção reforçou a importância da padronização dos dados entre sistemas.

## Limitações

- As respostas geradas são rascunhos e precisam de revisão humana.
- A qualidade das orientações depende da atualização da base consultada.

## Próximas melhorias

- Ampliar os testes com mensagens ambíguas.
- Medir a precisão da classificação e o tempo de resposta.
- Melhorar o tratamento de falhas e a prevenção de registros duplicados.
- Criar indicadores para acompanhar as solicitações.

## Autora

**Caroline Cristielle Gomes Lourenço**

Estudante de Gestão de Políticas Públicas na Universidade de São Paulo (USP), com interesse em análise de dados, inteligência artificial aplicada e melhoria de serviços.

Projeto desenvolvido com apoio de ferramentas de IA para programação e aprendizagem, com configuração das integrações e testes manuais realizados pela autora.
