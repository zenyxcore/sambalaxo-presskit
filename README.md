# Sambalaxo · Press Kit Digital

Apresentação online em uma única página, feita em HTML, CSS e JavaScript sem dependências de build.

## Rodar localmente

Sirva esta pasta com qualquer servidor estático. Por exemplo:

```bash
python3 -m http.server 4173
```

Depois, abra `http://localhost:4173`.

## Conteúdo

- Abertura com a marca completa, retrato de Reinaldinho e o nome do show
- Release do show, repertório e 12 anos de carreira conforme o press kit oficial
- Destaque para o símbolo SX usado nos LEDs dos shows e para as cores da identidade
- Rider de camarim informado no press kit oficial
- Acesso ao WhatsApp de shows, Instagram, Spotify e YouTube
- Espaço de download para fotos, logo, áudios e takes, marcado como em breve

## Materiais de divulgação

Os cards de fotos, logotipos, áudios e vídeos são independentes. Enquanto os URLs não forem fornecidos, aparecem como “Link em breve” e não são clicáveis. Quando os links chegarem, substitua cada `div.material-item` em `index.html` por um `a.material-item` com o `href` correspondente, mantendo o conteúdo e adicionando `target="_blank" rel="noopener noreferrer"`.

O conteúdo textual do press kit de referência não foi reaproveitado.
