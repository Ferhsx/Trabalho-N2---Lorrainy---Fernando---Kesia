// importar fastify
import fastify from "fastify";
// importar DatabaseMemoria
import { DatabaseMemoria } from "./database-memoria.js";
//importar bando de daddos

import dotenv from "dotenv";
dotenv.config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(version);
};

// criando o server
const server = fastify();

// criando a instância do banco de dados
const database = new DatabaseMemoria();

// vendo filme
server.get('/filmes', async (request, reply) => {
    try{
    const { search } = request.query;
    let query = sql`SELECT * FROM filmes`;

    if(search){
        query = sql`${query} WHERE titulo ILIKE ${"%"+search+"%"}`;
    }

    const result = await query;
    return result;
}catch(error){
    console.log(error);
    reply.status(500).send({error: "Erro ao buscar filmes"});
}
    const filmes = database.list(search);
    reply.send(filmes);
});

// criar filme
server.post('/filmes', (request, reply) => {
    const { titulo, diretor, genero, ano, duracao, classificacao } = request.body;
    database.create({
        titulo,
        diretor,
        genero,
        ano,
        duracao,
        classificacao,
    });

    // return 201
    reply.status(201).send();
});

// atualizar filme
server.put('/filmes/:id', (request, reply) => {
    const { id } = request.params;
    const { titulo, diretor, genero, ano, duracao, classificacao } = request.body;
    try {
        database.update(id, {
            titulo,
            diretor,
            genero,
            ano,
            duracao,
            classificacao,
        });
        reply.status(200).send();
    } catch (error) {
        reply.status(404).send({ error: error.message });
    }
});

//metodo patch
server.patch('/filmes/:id', (request, reply) =>{
    const filmeId = request.params.id; //id do filme

    const filmeEx = database.filmes.get(filmeId); //filme a ser atualizado
    if(!filmeEx){
        return reply.status(404).send({error: "Filme não encontrado"});
    }

    const filmeAtu = {
        ...filmeEx,
        ...request.body,
    }
    const filme = database.update(filmeId, filmeAtu);
    reply.status(200).send(filme);

});

// deletar filme
server.delete('/filmes/:id', (request, reply) => {
    const { id } = request.params;
    try {
        database.delete(id);
        reply.status(200).send();
    } catch (error) {
        reply.status(404).send({ error: error.message });
    }
});

// iniciar o servidor
http.createServer(requestHandler).listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });