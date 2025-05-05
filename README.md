# Filmes e Séries App

Uma aplicação web moderna para descobrir e explorar filmes, séries e personalidades do cinema, utilizando a API TMDB (The Movie Database). Os usuários podem buscar conteúdo por nome, visualizar informações detalhadas e alternar facilmente entre modo claro e escuro.

## Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica da aplicação
- **CSS3** - Estilização avançada e animações
- **JavaScript** - Lógica de interface e interatividade
- **Tailwind CSS** - Framework CSS utilitário para design responsivo
- **Font Awesome** - Biblioteca de ícones vetoriais

### APIs e Bibliotecas
- **TMDB API** - API completa do The Movie Database para informações de filmes, séries e pessoas
- **Axios** - Cliente HTTP baseado em Promises para requisições à API
- **LocalStorage** - Para persistência de preferências do usuário (modo escuro/claro)

### Funcionalidades
- **Página Inicial Dinâmica**
  - Banner destacado com filmes populares que mudam a cada visita
  - Exibição de conteúdo em tendência: filmes, séries e pessoas
  - Sistema de busca integrado por nome
- **Detalhes Completos**
  - Informações detalhadas sobre filmes e séries (sinopse, elenco, gêneros)
  - Trailers e vídeos incorporados quando disponíveis
  - Avaliações e datas de lançamento
- **Perfis de Personalidades**
  - Biografias de atores, diretores e outras pessoas da indústria
  - Filmografia organizada e filtrada
  - Fotos e dados pessoais
- **Experiência de Usuário**
  - Design responsivo para todos os dispositivos
  - Modo escuro/claro com persistência de preferência
  - Cards com efeitos visuais e feedback de interação
  - Lazy loading para otimização de performance

## Estrutura do Projeto
- index.html - Página principal com busca e listagem de conteúdo em destaque
- detalhes.html - Exibição detalhada de filmes e séries
- pessoa.html - Página de perfil para atores, diretores e outras personalidades
- script.js - Lógica principal da aplicação e gerenciamento da API
- detalhes.js - JavaScript específico para a página de detalhes
- pessoa.js - JavaScript específico para a página de perfil de pessoas
- styles.css - Estilos personalizados e extensões do Tailwind

## Funcionamento

A aplicação se comunica com a API TMDB para obter dados atualizados sobre filmes, séries e pessoas da indústria do entretenimento. O sistema de busca permite encontrar conteúdo por nome, enquanto o design moderno e responsivo garante uma experiência agradável em qualquer dispositivo.

Os dados são exibidos em formato de cards interativos, que levam às páginas de detalhes quando clicados. A preferência do usuário pelo modo claro ou escuro é armazenada localmente para persistir entre visitas ao site.

## Screenshots

- Página inicial com destaque e busca
- Detalhes de filme/série com informações completas
- Perfil de personalidade com filmografia

## Próximos Passos

- Implementação de sistema de recomendações personalizadas
- Opção para criar listas de favoritos
- Integração com redes sociais para compartilhamento

---

Desenvolvido como projeto de demonstração utilizando as tecnologias mais modernas de desenvolvimento web.