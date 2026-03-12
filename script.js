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
    // Dentro do loop forEach...
    let div = document.createElement("div");
    div.className = "item-card";

    // ADICIONE ESTA LINHA ABAIXO:
    // Quando clicar, chama a função comprarItem enviando o ID deste produto
    div.onclick = () => comprarItem(item.id);

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

  let totalVendas = alasql("SELECT COUNT(*) AS qtd FROM vendas")[0].qtd;
  document.getElementById("total-vendas").innerText = totalVendas;

  let caixaTotal = alasql("SELECT SUM(valor) AS total FROM vendas")[0].total;
  if (!caixaTotal) {
    caixaTotal = 0;
  }
  document.getElementById("caixa-loja").innerText = caixaTotal;
}

// FUNÇÃO: Troca de Cliente (Lógica de Fila)
function proximoCliente() {
  heroiAtualId++;
  if (heroiAtualId > 4) heroiAtualId = 1; // Volta para o primeiro se acabar
  atualizarInterface();
  alert("Cliente trocado!");
}
//iniciar o jogo ao carregar a pagina
window.onload = atualizarInterface;
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

  //Buscar se contem estoque do iten
  if (item.estoque <= 0) {
    alert("Estamos sem estoque deste item, volte outra hora.");
    return; // ira retornar somente se nao contiver mais estoque deste item
  }

  // 2. EXECUTAR A COMPRA (UPDATE)
  // Diminui 1 do estoque
  alasql(`UPDATE itens SET estoque = estoque - 1 WHERE id = ${idItem}`);

  // Tira o dinheiro do herói
  alasql(
    `UPDATE herois SET ouro = ouro - ${item.preco} WHERE id = ${heroiAtualId}`
  );
  alasql(
    "INSERT INTO vendas VALUES (" +
      heroiAtualId +
      ", " +
      idItem +
      ", " +
      item.preco +
      ")"
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
// FUNÇÃO: Exporta os dados cruzados para um arquivo .txt
function gerarRelatorio() {
  // 1. O JOIN: Cruza as três tabelas
  let relatorio = alasql(
    "SELECT herois.nome AS cliente, itens.nome AS produto FROM vendas JOIN herois ON vendas.id_heroi = herois.id JOIN itens ON vendas.id_item = itens.id"
  );

  // 2. Monta o texto do arquivo
  let texto = "::: RELATÓRIO OFICIAL DA GUILDA :::\n\n";
  relatorio.forEach((linha) => {
    texto += linha.cliente + " comprou " + linha.produto + "\n";
  });

  // 3. A Mágica do Download (Cria um arquivo na memória e baixa)
  let arquivo = new Blob([texto], { type: "text/plain" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "livro_caixa.txt";
  link.click(); // Simula um clique no link
}
function fecharCaixa() {
  // Zerar o caixa da loja
  alasql("DELETE FROM vendas"); // Limpa todas as vendas
  alert("Caixa fechado! Todas as vendas foram apagadas.");
  atualizarInterface();
}

// FUNÇÃO: Gasta o dinheiro do caixa para subir o estoque
function reabastecerEstoque() {
  // 1. Descobre quanto dinheiro a loja tem (SELECT SUM)
  let caixaAtual = alasql("SELECT SUM(valor) AS total FROM vendas")[0].total;
  if (!caixaAtual) {
    caixaAtual = 0;
  }

  // 2. Validação: Temos 100 moedas para pagar o fornecedor?
  if (caixaAtual < 100) {
    alert("O fornecedor cobra 100 moedas. Você está pobre!");
    return;
  }

  // 3. A Transação de Compra (O Segredo do Fluxo de Caixa)
  // Atualiza TODOS os itens de uma vez só somando 5 no estoque
  alasql("UPDATE itens SET estoque = estoque + 5");

  // Como registramos uma despesa no banco de dados? Usando um valor NEGATIVO!
  // Usamos os IDs 0 e 0 pois não foi um herói nem um item específico
  alasql("INSERT INTO vendas VALUES (0, 0, -100)");

  // 4. Feedback Visual
  logSQL("Despesa: Pagamento de Fornecedor (-100 moedas). Estoque renovado!");
  atualizarInterface();
}

function InflaçãoMagica() {
  // Aumenta o preço de todos os items em 10
  alasql("UPDATE itens SET preco = preco + 10");
  atualizarInterface();
}
