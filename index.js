const venom = require("venom-bot");
const mysql = require("mysql2/promise");
const { get } = require("http");

const createConnection = async () => {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "whats",
  });
};
// FROM é a tabela
// select é dentro da tabela
//INSERT INTO `cliente` (`nome`, `endereco`, `status`, `telefone`, `pedido`) VALUES ('a', '', '0', '11', '');
const createUser = async (name, msgfrom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'INSERT INTO cliente (nome, endereco, status, telefone, pedido) VALUES (?, "inserir", "0", ? ,"")', [name, msgfrom]
  );
  if (rows.length > 0) return true;
  return false;
};

const getStatus = async (msgfrom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'SELECT status FROM cliente WHERE telefone = ? ', [msgfrom]
  );
  if (rows.length > 0) return rows[0].status;
  return false;
};

const setStatus = async (msgfrom, status) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'UPDATE cliente SET status = ? WHERE cliente.telefone = ? ', [status, msgfrom]
  );
  if (rows.length > 0) return rows[0].status;
  return false;
};

const getPedido = async (msgfrom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'SELECT pedido FROM cliente WHERE telefone = ? ', [msgfrom]
  );
  if (rows.length > 0) return rows[0].pedido;
  return false;
};

const setPedido = async (msgfrom, pedido) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'UPDATE cliente SET pedido = ? WHERE cliente.telefone = ? ', [pedido, msgfrom]
  );
  if (rows.length > 0) return rows[0].pedido;
  return false;
};

const getEndereco = async (msgfrom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'SELECT endereco FROM cliente WHERE telefone = ? ', [msgfrom]
  );
  if (rows.length > 0) return rows[0].endereco;
  return false;
};

const setEndereco = async (msgfrom, endereco) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    'UPDATE cliente SET endereco = ? WHERE cliente.telefone = ? ', [endereco, msgfrom]
  );
  if (rows.length > 0) return rows[0].endereco;
  return false;
};

///INSERT INTO `pedidos` (`id`, `pedido de`, `pedido`, `status`, `data`) VALUES (NULL, 'Amanda', 'oi', '0', '2022-04-30');
const createPedido = async (pedidode, pedido, status, data) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    "INSERT INTO pedidos (id, pedido de, pedido, status, data) VALUES (NULL, ?, ?, ?, ?)", [pedidode, pedido, status, data]);
  if (rows.length > 0) return rows[0].endereco;
  return false;
};





venom.create().then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === true) { return; }

    if (message.type != "chat") {
      client.sendText(message.from,
        `😕 Desculpa, eu ainda não consigo entender algumas palavras.Vou te mostrar novamente os assuntos que já aprendi, fica mais fácil pra mim se você escolher uma das opções:\nDigite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Sobre\n*5-* 🔗 Créditos`
      )
      return;
    }

    var mensagem = message.body.toLowerCase();
    const user = message.from.replace(/\D/g, '');
    let status, endereco, pedido;


    try {
      const getUserStatus = await getStatus(user);
      status = getUserStatus;
      const getlocal = await getEndereco(user);
      endereco = getlocal;
      const getEncomenda = await getPedido(user);
      pedido = getEncomenda;
    } catch {
      console.log("error");
    }

    if ((endereco == false && endereco != "inserir")) {
      createUser(message.sender.pushname, user);
      try {
        const getUserStatus = await getStatus(user);
        status = getUserStatus;
        const getlocal = await getEndereco(user);
        endereco = getlocal;
      } catch {
        console.log("erro");
      }
    }
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
    await sleep(1000);

    if ((status == 3) && (mensagem.includes("sim") || message.body == "1")) {
      client.sendText(message.from, (`Seu pedido foi anotado, obrigado pela preferência ${message.sender.pushname}. ☺️`))
        .then((result) => {
          setStatus(user, "0");
          //createPedido(message.sender.pushname, pedido, 0, "2022 - 04 - 30")
        })
        .catch((erro) => {
          console.error("Erro ao enviar mensagem: ", erro); //return um objeto de erro
        });
    } else if ((status == 3) && (mensagem.includes("não") || message.body == "2")) {
      client.sendText(message.from, (`Pedido Cancelado.`))
        .then((result) => {
          setStatus(user, "0");
        })
      await sleep(1000);
      client.sendText(message.from, (`Digite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Sobre\n*5-* 🔗 Créditos`));
    }
    else if (status == 3) {
      client.sendText(message.from, (`Desculpe, não entendi\n\nDigite:\n*1-* ✅ Sim \n*2-* ❌ Não, voltar ao menu`));
    }
    else if ((status == 2)) {
      console.log(message.body);
      setEndereco(user, message.body);
      const getlocal = getEndereco(user);
      endereco = getlocal;
      client
        .sendText(message.from, (`*Seu pedido:*\n${pedido}\n*Endereço:*\n${message.body}\n*Está correto?*\n\nDigite:\n*1-* ✅ Sim \n*2-* ❌ Não, voltar ao menu`)).then((result) => {
          setStatus(user, "3");
        });
    } else if (status == 1 && endereco == "inserir") {
      client
        .sendText(message.from, ("Qual o local para entrega?"))
        .then((result) => {
          setPedido(user, message.body);
          setStatus(user, "2");

          //console.log("Result: ", result); //retorna um objeto de successo
        });
    } else if (status == 1 && endereco != "inserir") {
      setPedido(user, message.body)
      const getEncomenda = getPedido(user);
      pedido = getEncomenda;
      client
        .sendText(message.from, (`*Seu pedido:*\n${message.body}\n*Endereço:*\n${endereco}\n*Está correto?*\nDigite:\n*1-* ✅ Sim \n*2-* ❌ Não, voltar ao menu`))
        .then((result) => {
          setStatus(user, "3");
        });

    } else if ((mensagem.includes("olá") ||
      mensagem.includes("oi") ||
      mensagem.includes("olá") ||
      mensagem.includes("ola") ||
      mensagem.includes("tarde") ||
      mensagem.includes("noite") ||
      mensagem.includes("dia") ||
      mensagem.includes("boa") == true)) {
      client.sendText(message.from,
        `Olá, ${message.sender.pushname}\nDigite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Sobre\n*5-* 🔗 Créditos`);
    } else if (
      (mensagem.includes("pedido") || message.body == "1") == true) {
      client.sendText(message.from, "Digite seu pedido:").then((result) => {
        setStatus(user, "1");
        //console.log("Result: ", result); //retorna um objeto de successo
      });
    } else if ((mensagem.includes("produto") || message.body == "2") == true) {
      client
        .sendText(
          message.from,
          `Hambúrguer\nHambúrguer com gergilim\nHambúrguer especial\nHambúrguer especial com gergili\nHot dog\nBaguete\nMini foguinho 7*\nBisnaguinha com 60 unidade\nHamburgao com 6 unidade\nHamburgao família com 2 unidades\nPão de metro\nPão para bolo salgado\nMini Frances`)
      await sleep(1000);
      client.sendText(message.from, (`Digite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos\n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Sobre\n*5-* 🔗 Créditos`));
    } else if ((mensagem.includes("endereco") || mensagem.includes("endereço") || message.body == "3") == true && status != 4) {
      client
        .sendText(
          message.from, "Insira seu endereço:\n(ex: Rua Santa Bárbara 670, Vila Aparecida)"
        )
        .then((result) => {
          setStatus(user, 4);
          //console.log("Result: ", result); //retorna um objeto de successo
        })
        .catch((erro) => {
          console.error("Erro ao enviar mensagem: ", erro); //return um objeto de erro
        });
    }
    else if (((mensagem.includes("sobre") || message.body == "4") == true) && status != 4) {
      client
        .sendText(message.from, "Padaria Bragança Pães")
    } else if (((mensagem.includes("creditos") || mensagem.includes("créditos") || message.body == "5") == true) && status != 4) {
      client
        .sendText(
          message.from, "Feito por Giovanni Mori\nTelefone: *11 953200-7250*\nEmail: *giovanni_mori@hotmail.com*")
    } else if ((status) == 4) {
      client
        .sendText(
          message.from, "Seu endereço foi salvo com sucesso!"
        )
        .then((result) => {
          setEndereco(user, message.body);
          setStatus(user, 0);
          //console.log("Result: ", result); //retorna um objeto de successo
        })
        .catch((erro) => {
          console.error("Erro ao enviar mensagem: ", erro); //return um objeto de erro
        });
    }
    else {
      client
        .sendText(
          message.from,
          "😕 Desculpa, eu ainda não consigo entender algumas  palavras.\nVou te mostrar novamente os assuntos que já aprendi, fica mais fácil pra mim se você escolher uma das opções:\n\nDigite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Sobre\n*5-* 🔗 Créditos"
        )
        .then((result) => {
          //console.log("Result: ", result); //retorna um objeto de successo
          //console.log("Quem enviou: ", message.sender.id);
        })
        .catch((erro) => {
          console.error("Erro ao enviar mensagem: ", erro); //return um objeto de erro
        });
    }
  });
}
