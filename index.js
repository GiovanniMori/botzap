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
        'INSERT INTO cliente (nome, endereco, status, telefone, pedido) VALUES (?, "inserir", "0", ? ,"")', [name, msgfrom]);
	connection.end();
    if (rows.length > 0) return true;
    return false;
};

const getUser = async (msgfrom) => {
  const connection = await createConnection();
  const [rows] = await connection.execute(
      'SELECT nome FROM cliente WHERE telefone = ? ', [msgfrom]
  );
connection.end();
  if (rows.length > 0) return rows[0].nome;
  return false;
};

const getStatus = async (msgfrom) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'SELECT status FROM cliente WHERE telefone = ? ', [msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].status;
    return false;
};

const setStatus = async (msgfrom, status) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'UPDATE cliente SET status = ? WHERE cliente.telefone = ? ', [status, msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].status;
    return false;
};

const getPedido = async (msgfrom) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'SELECT pedido FROM cliente WHERE telefone = ? ', [msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].pedido;
    return false;
};

const setPedido = async (msgfrom, pedido) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'UPDATE cliente SET pedido = ? WHERE cliente.telefone = ? ', [pedido, msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].pedido;
    return false;
};

const getEndereco = async (msgfrom) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'SELECT endereco FROM cliente WHERE telefone = ? ', [msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].endereco;
    return false;
};

const setEndereco = async (msgfrom, endereco) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'UPDATE cliente SET endereco = ? WHERE cliente.telefone = ? ', [endereco, msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].endereco;
    return false;
};

const getDate = async (msgfrom) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'SELECT date FROM cliente WHERE telefone = ? ', [msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].date;
    return false;
};

const setDate = async (msgfrom, endereco) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        'UPDATE cliente SET date = ? WHERE cliente.telefone = ? ', [endereco, msgfrom]
    );
	connection.end();
    if (rows.length > 0) return rows[0].date;
    return false;
};

///INSERT INTO `pedidos` (`id`, `pedido de`, `pedido`, `status`, `data`) VALUES (NULL, 'Amanda', 'oi', '0', '2022-04-30');
const createPedido = async (pedidode, pedido, status, data) => {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        "INSERT INTO pedidos (id, pedido de, pedido, status, data) VALUES (NULL, ?, ?, ?, ?)", [pedidode, pedido, status, data]);
		connection.end();
    if (rows.length > 0) return rows[0].endereco;
    return false;
};


venom.create().then((client) => start(client));

function start(client) {
    client.onMessage(async (message) => {
        if (message.isGroupMsg === true) { return; }

        if (message.type != "chat") {
            client.sendText(message.from, `😕 Desculpa, eu ainda não consigo entender este tipo de mensagem. Vou te mostrar novamente os assuntos que já aprendi, fica mais fácil pra mim se você escolher uma das opções:\nDigite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Pix\n*5-* 🔗 Créditos`)
                .then((result) => {
                }).catch((erro) => {	
                    //console.error("Erro ao ler !=texto "); //return um objeto de erro
                });
            return;
        }

        var mensagem = message.body.toLowerCase();
        const user = message.from.replace(/\D/g, '');
        let status, endereco, pedido, nome;


        try {
            const getUserStatus = await getStatus(user);
            status = getUserStatus;
            const getlocal = await getEndereco(user);
            endereco = getlocal;
            const getEncomenda = await getPedido(user);
            pedido = getEncomenda;
            const getDia = await getData(user);
            dia = getDia;
            const getNome = await getUser(user);
            nome = getNome;
        } catch {
            //console.log();
        }

        if(status == -1){
          return;
        }

        if ((endereco == false && endereco != "inserir")) {
            createUser(message.sender.pushname, user);
			client.sendText(message.from,
			`Oi, estamos implementando um novo sistema para facilitar os pedidos, digite o Número "1" para fazer seu pedido, em seguida, digite o que deseja e depois o local para entrega, em seguida é só digitar 1 para confirmar pedido ou 2 para cancelar. De qualquer maneira, uma pessoa física estará lendo/atendendo o telefone caso não consiga pelo atendimento virtual.`)
                .then((result) => {
                }).catch((erro) => {
                    console.error("Erro ao fazer pedido(1): ", erro); //return um objeto de erro
                });
            try {
                const getUserStatus = await getStatus(user);
                status = getUserStatus;
                const getlocal = await getEndereco(user);
                endereco = getlocal;
            } catch {
                console.log("Erro ao pegar informações do usuário");
            }
			return;
        }
        const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
        await sleep(100);


        if (message.body == "1" == true && status == "0") {
            client.sendText(message.from, "Digite seu pedido:")
                .then((result) => {
                    setStatus(user, "1");
                }).catch((erro) => {
                    console.error("Erro ao fazer pedido(1): ", erro); //return um objeto de erro
                });
        } else if (status == 1 && endereco == "inserir") {
            client
                .sendText(message.from, ("Qual o local para entrega?\n(ex: Rua Santa Bárbara 670, Vila Aparecida)"))
                .then((result) => {
                    setPedido(user, message.body);
                    setStatus(user, "2");
                }).catch((erro) => {
                    console.error("Erro ao setar pedido: ", erro); //return um objeto de erro
                });
        } else if (status == 1 && endereco != "inserir") {
            setPedido(user, message.body)
            client.sendText(message.from, (`*Seu pedido:*\n${message.body}\n*Endereço:*\n${endereco}\n*Está correto?*\nDigite:\n*1-* ✅ Sim, confirmar pedido\n*2-* ❌ Não, voltar ao menu`))
                .then((result) => {
                    setStatus(user, "3");
                }).catch((erro) => {
                    console.error("Erro ao setar pedido: ", erro); //return um objeto de erro
                });
        } else if ((status == 2)) {
            setEndereco(user, message.body);
            client
                .sendText(message.from, (`*Seu pedido:*\n${pedido}\n*Endereço:*\n${message.body}\n*Está correto?*\n\nDigite:\n*1-* ✅ Sim, confirmar pedido\n*2-* ❌ Não, voltar ao menu`))
                .then((result) => {
                    setStatus(user, "3");
                }).catch((erro) => {
                    console.error("Erro ao enviar confirmação pedido: ", erro); //return um objeto de erro
                });
        } else if ((status == 3) && (mensagem.includes("sim") || message.body == "1")) {
            console.log("Pedido anotado com sucesso");
            client.sendText(message.from, (`Seu pedido foi anotado, obrigado pela preferência ${message.sender.pushname} ☺️`))
                .then((result) => {
                    setStatus(user, "0");
                    client.sendText("5511960575067@c.us", `Novo Pedido de *${message.sender.pushname}*\n\n*Pedido*: ${pedido}\n*Local*: ${endereco}`)
                        .then((result) => {
                        })
                        .catch((erro) => {
                            console.error("Erro ao salvar pedido: ", erro); //return um objeto de erro
                        });
                    //createPedido(message.sender.pushname, pedido, 0, "2022 - 04 - 30")
                })
                .catch((erro) => {
                    console.error("Erro ao anotar pedido: ", erro); //return um objeto de erro
                });
        } else if ((status == 3) && (mensagem.includes("não") || message.body == "2")) {
            client.sendText(message.from, (`Pedido Cancelado.`))
                .then((result) => {
                    setStatus(user, "0");
                })
                .catch((erro) => {
                    console.error("Erro ao cancelar pedido: ", erro); //return um objeto de erro
                });
            await sleep(500);
            client.sendText(message.from, (`Digite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Pix\n*5-* 🔗 Créditos`)).then((result) => {
                setStatus(user, "0");
            })
                .catch((erro) => {
                    console.error("Erro ao cancelar pedidoMenu: ", erro); //return um objeto de erro
                });
        }
        else if (status == 3) {
            client.sendText(message.from, (`Desculpe, não entendi\nSe digitou o pedido errado, digite "2"\n\nDigite:\n*1-* ✅ Sim, confirmar pedido \n*2-* ❌ Não, voltar ao menu`));
        } else if ( message.body == "2" == true) {
            client
                .sendText(message.from,
                    `Hambúrguer\nHambúrguer com Gergilim\nHambúrguer Especial\nHambúrguer Especial com Gergilim\nHot Dog\nBaguete\nMini Doguinho 7x7(49 Unid)\nBisnaguinha com 60 Unidades\nHamburgão com 6 Unidades\nHamburgão com 2 Unidades\nPão de Metro\nPão para Bolo Salgado\nMini Francês\nPão de Lanche\nPão de Banha`)
                .then((result) => {
                    //console.log("Result: ", result); //retorna um objeto de successo
                })
                .catch((erro) => {
                    console.error("Erro ao enviar Produtos: ", erro); //return um objeto de erro
                });
            await sleep(500);
            client.sendText(message.from, (`Digite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos\n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Pix\n*5-* 🔗 Créditos`))
                .then((result) => {
                    //console.log("Result: ", result); //retorna um objeto de successo
                })
                .catch((erro) => {
                    console.error("Erro ao enviar menu produtos dnv: ", erro); //return um objeto de erro
                });
        } else if (message.body == "3" == true && status !=4) {
            client
                .sendText(
                    message.from, "Insira seu endereço:\n(ex: Rua Santa Bárbara 670, Vila Aparecida)"
                )
                .then((result) => {
                    setStatus(user, 4);
                    //console.log("Result: ", result); //retorna um objeto de successo
                })
                .catch((erro) => {
                    console.error("Erro ao atualizar endereço: ", erro); //return um objeto de erro
                });
        } else if ((status) == 4) {
          client
              .sendText(message.from, "Seu endereço foi salvo com sucesso!")
              .then((result) => {
        setStatus(user, 0);		
        setEndereco(user, message.body);					
              })
              .catch((erro) => {
                  console.error("Erro ao atualizar endereço: ", erro); //return um objeto de erro
              });
      } else if (((mensagem.includes("pix") || message.body == "4") == true) ) {
            client
                .sendText("5511999547461@c.us", `Pix feito por ${nome}`)
                .then((result) => {
                  setStatus(user, 5);
                })
                .catch((erro) => {
                    console.error("Erro Pix: ", erro); //return um objeto de erro
                });
              
        } else if ((status) == 5) {
          client
              .sendText(message.from, "Seu pagamento foi armazenado em nosso sistema!")
              .then((result) => {
        setStatus(user, 0);		
        setEndereco(user, message.body);					
              })
              .catch((erro) => {
                  console.error("Erro ao atualizar endereço: ", erro); //return um objeto de erro
              });
      }  else if (((mensagem.includes("ajuda") || message.body == "10") == true)) {
          client
              .sendText(message.from, "Caso não tenha entendido como o bot funciona, basta digitar o número da opção que deseja, ou o texto digitado, se ainda precisar de ajuda com algum produto, basta nos ligar 😊.")
              .then((result) => {
              })
              .catch((erro) => {
                  console.error("Erro Ajuda: ", erro); //return um objeto de erro
              });
      } else if (((mensagem.includes("creditos") || mensagem.includes("créditos") || message.body == "11") == true)) {
            client
                .sendText(
                    message.from, "Feito por Giovanni Mori\nTelefone: *1195320-7250*\nEmail: *giovanni_mori@hotmail.com*")
                .then((result) => {
                    //console.log("Result: ", result); //retorna um objeto de successo
                })
                .catch((erro) => {
                    console.error("Erro Ajuda: ", erro); //return um objeto de erro
                });
        }   else if ((mensagem.includes("olá") ||
            mensagem.includes("oi") ||
            mensagem.includes("olá") ||
            mensagem.includes("ola") ||
            mensagem.includes("tarde") ||
            mensagem.includes("noite") ||
            mensagem.includes("dia") ||
            mensagem.includes("boa") == true)) {
            client.sendText(message.from,
                `Olá, ${message.sender.pushname}\nDigite:\n*1-* 🛒 Fazer Pedido\n*2-* 🍞 Ver Produtos\n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Pix\n*5-* 🔗 Créditos`).then((result) => {
                    //setStatus(user, "0");
                })
                .catch((erro) => {
                    console.error("Erro Welcome msg ", erro); //return um objeto de erro
                });
        } else if ((mensagem.includes("ok") ||
            mensagem.includes("obrigado") ||
            mensagem.includes("obrigada") ||
            mensagem.includes("ola") ||
            mensagem.includes("dnd") ||
            mensagem.includes("obg") ||
            mensagem.includes("obgd") ||
            mensagem.includes("okk") == true)) {client
                .sendText(message.from, ";)")
                .then((result) => {
                    //console.log("Result: ", result); //retorna um objeto de successo
                    //console.log("Quem enviou: ", message.sender.id);
                })
                .catch((erro) => {
                    console.error("Erro ao enviar mensagem: ", erro); //return um objeto de erro
                });
        }else {
            client
                .sendText(message.from, "😕 Desculpa, eu ainda não consigo entender algumas  palavras.\nVou te mostrar novamente os assuntos que já aprendi, fica mais fácil pra mim se você escolher uma das opções:\n\nDigite:\n*1-* 🛒 Fazer Pedido  \n*2-* 🍞 Ver Produtos \n*3-* 📍 Atualizar Endereço\n*4-* ℹ️ Pix\n*5-* 🔗 Créditos")
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