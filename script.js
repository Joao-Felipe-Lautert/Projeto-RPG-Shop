// 1. CRIAÇÃO DAS TABELAS (SCHEMA)
alasql(
  "CREATE TABLE itens (id INT, nome STRING, preco INT, icone STRING, estoque INT)"
);
alasql(
  "CREATE TABLE herois (id INT, nome STRING, ouro INT, avatar STRING, fala STRING)"
);

// 2. INSERÇÃO DE DADOS (POPULANDO O BANCO)
alasql("INSERT INTO itens VALUES (1, 'Poção de Vida', 25, '🧪', 15)");
alasql("INSERT INTO itens VALUES (2, 'Espada Longa', 100, '⚔️', 5)");
alasql("INSERT INTO itens VALUES (3, 'Anél Mágico', 250, '💍', 1)");
alasql("INSERT INTO itens VALUES (4, 'Arco Flamejante', 150, '🏹', 3)");
// ... Adicione mais itens aqui depois ...

alasql(
  "INSERT INTO herois VALUES (1, 'Aragorn', 200, '🧝‍♂️', 'Preciso de equipamentos.')"
);
alasql(
  "INSERT INTO herois VALUES (2, 'Gandalf', 1000, '🧙‍♂️', 'Tenho pressa, mercador.')"
);
alasql(
  "INSERT INTO herois VALUES (3, 'Sauron', 5000, '🦹🏿', 'Me de o que você tem de melhor.')"
);
alasql(
  "INSERT INTO herois VALUES (4, 'Ogro da floresta', 50, '🧌', 'Silêncio...')"
);

// Variável para controlar quem está na loja
let heroiAtualId = 1;

// FUNÇÃO: Desenha a tela baseada no Banco de Dados
function atualizarInterface() {
  // Busca itens no banco
  let itens = alasql("SELECT * FROM itens");
  let container = document.getElementById("shop-items");
  container.innerHTML = "";

  // Cria o HTML de cada item (Loop)
  itens.forEach((item) => {
    let div = document.createElement("div");
    div.className = "item-card";

    // ADICIONE ESTA LINHA ABAIXO:
    // Quando clicar, chama a função comprarItem enviando o ID deste produto
    div.onclick = () => comprarItem(item.id);

    div.className = "item-card";

    if (item.estoque === 0) {
      div.style.opacity = "0.3"; // Deixa transparente
      div.style.cursor = "not-allowed"; // Mouse com sinal de proibido
    }
    div.innerHTML = `
            <span class="item-icon">${item.icone}</span>
            <div class="item-name">${item.nome}</div>
            <div class="item-price">💰 ${item.preco}</div>
            <div class="item-stock">Estoque: ${item.estoque}</div>
        `;
    container.appendChild(div);
  });

  // Busca o herói atual
  let heroi = alasql(`SELECT * FROM herois WHERE id = ${heroiAtualId}`)[0];
  document.getElementById("hero-name").innerText = heroi.nome;
  document.getElementById("hero-gold").innerText = heroi.ouro;
  document.querySelector(".hero-avatar").innerText = heroi.avatar;
  document.getElementById("hero-msg").innerText = heroi.fala;
}

// FUNÇÃO: Troca de Cliente (Lógica de Fila)
function proximoCliente() {
  heroiAtualId++;
  if (heroiAtualId > 4) heroiAtualId = 1; // Volta para o primeiro se acabar
  atualizarInterface();
  alert("Cliente trocado!");
}

// Inicializa o jogo ao carregar a página
window.onload = atualizarInterface;

let div = document.createElement("div");
div.className = "item-card";

// ADICIONE ESTA LINHA ABAIXO:
// Quando clicar, chama a função comprarItem enviando o ID deste produto
div.onclick = () => comprarItem(item.id);

// =========================================
// LÓGICA DE VENDAS
// =========================================

function comprarItem(idItem) {
  // 1. BUSCAR DADOS (SELECT)
  // Descobre qual item foi clicado e quem é o herói atual
  let item = alasql(`SELECT * FROM itens WHERE id = ${idItem}`)[0];
  let heroi = alasql(`SELECT * FROM herois WHERE id = ${heroiAtualId}`)[0];

  if (heroi.ouro < item.preco) {
    alert("Você não tem dinheiro!");
    return; // O 'return' para a função aqui e impede a compra
  }
  if (item.estoque <= 0) {
    alert("O estoque acabou, volte mais tarde");
    return;
  }
  // 2. EXECUTAR A COMPRA (UPDATE)
  // Diminui 1 do estoque
  alasql(`UPDATE itens SET estoque = estoque - 1 WHERE id = ${idItem}`);

  // Tira o dinheiro do herói
  alasql(
    `UPDATE herois SET ouro = ouro - ${item.preco} WHERE id = ${heroiAtualId}`
  );

  // 3. FEEDBACK
  atualizarInterface(); // Redesenha a tela com os novos números
  logSQL(`Venda realizada: ${item.nome} por ${item.preco} moedas.`);
}

// Função auxiliar para escrever no quadrado preto lá embaixo
function logSQL(texto) {
  let logDiv = document.getElementById("sql-logs");
  let linha = document.createElement("div");
  linha.innerText = `> ${texto}`;
  logDiv.prepend(linha);
}
