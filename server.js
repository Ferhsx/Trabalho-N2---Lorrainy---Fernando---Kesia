// importar fastify
import fastify from "fastify";
// importar DatabaseMemoria
import { DatabaseMemoria } from "./database-memoria.js";

// criando o server
const server = fastify();

// criando a instância do banco de dados
const database = new DatabaseMemoria();

// vendo filme
server.get('/filmes', (request, reply) => {
    const { search } = request.query;
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
server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});