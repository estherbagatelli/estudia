// Roda sozinho antes do `npm run dev` (script "predev" do package.json).
// O Estudia precisa do Node 22.12 ou mais novo: no Node 20 toda página dá
// erro 500 ("native WebSocket not found") e no 22.11 o Vite nem abre
// (ERR_REQUIRE_ESM). Sem esta checagem, o erro aparece em inglês e longe da causa.
const [maior, menor] = process.versions.node.split(".").map(Number);

if (maior < 22 || (maior === 22 && menor < 12)) {
  console.error(`
  O Estudia precisa do Node 22.12 ou mais novo. O seu é o ${process.version}.

  1. Baixe a versão LTS em https://nodejs.org e instale.
  2. Feche e abra o terminal de novo (e o VS Code, se estiver usando o terminal dele).
  3. Confira com: node -v
  4. Rode de novo: npm install  e depois  npm run dev
`);
  process.exit(1);
}
