// importar fastify
import fastify from "fastify";
//importar bando de daddos
import dotenv from "dotenv";
dotenv.config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");
// criando o server
const server = fastify();

const sql = neon(process.env.DATABASE_URL);


// criar tabela
await sql`
    CREATE TABLE IF NOT EXISTS filmes(
    id UUId PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    diretor TEXT NOT NULL,
    genero TEXT NOT NULL,
    ano INTEGER NOT NULL,
    duracao INTEGER NOT NULL,
    classificacao INTEGER NOT NULL,
    create_at TIMESTAMP DEFAULT NOW()
    )
`;


// rotas filme
server.get('/filmes', async (request, reply) => {
    try {
        const { search } = request.query;
        let query = sql`SELECT * FROM filmes`;

        if (search) {
            query = sql`${query} WHERE titulo ILIKE ${"%" + search + "%"}`;
        }

        const result = await query;
        return result;
    } catch (error) {
        console.log("Erro no get /filmes",error);
        reply.status(500).send({ error: "Erro ao buscar filmes" });
    }
    reply.send(filmes);
});

// criar filme
server.post('/filmes', async (request, reply) => {
    try {
        const { titulo, diretor, genero, ano, duracao, classificacao } = request.body;
        
        await sql`
        INSERT INTO filmes (titulo, diretor, genero, ano, duracao, classificacao)
        VALUES (${titulo}, ${diretor}, ${genero}, ${ano}, ${duracao}, ${classificacao})
        `;
        
        return reply.status(201).send();

    } catch (error) {
        console.log("Erro no post /songs:", error);
    return reply.status(500).send({ error: "Erro ao criar filme" });
    }
    });

// atualizar filme
server.put('/filmes/:id', async (request, reply) => {
    try{
        const { id } = request.params;
        const { titulo, diretor, genero, ano, duracao, classificacao } = request.body;
        
        await sql`
        UPDATE filmes 
        SET
            titulo = ${titulo},
            diretor = ${diretor},
            genero = ${genero},
            ano = ${ano},
            duracao = ${duracao},
            classificacao = ${classificacao}
        WHERE id = ${id}
        `;
        return reply.status(204).send();
    }catch (error) {
        console.log("Erro no put /filmes/:id:", error);
        return reply.status(500).send({ error: "Erro ao atualizar filme" });
    }
});
//metodo patch
server.patch('/filmes/:id', async(request, reply) => {
    try{
    const filmeId = request.params.id; //id do filme
    const filmeAtu =request.body //campos a serem atualizados
    if (!filmeAtu || Object.keys(filmeAtu).length === 0) {
        return reply.status(404).send({ error: "Filme não encontrado" });
    }

    const podeAtu = [titulo, diretor, genero, ano, duracao, classificacao];
    const Atu = {};

    for (const [key, value ]of Object.entries(filmeAtu)){
        if (podeAtu.includes(key)){
            Atu[key] = value;
        }
    };
    if (Object.keys(Atu).length === 0){
        return reply.status(400).send({ error: "Campos invalidos" });
    }

    const filmeEx = await sql`
    UPDATE filmes
    SET ${sql(Atu)}
    WHERE id = ${filmeId}
    RETURNING *
    `;
    if (filmeEx.length === 0) {
        return reply.status(404).send({ error: "Filme não encontrado" });
    }
    reply.status(200).send(filmeEx[0]);

    }catch (error){
        console.log("Erro no patch /filmes/:id:", error);
        return reply.status(500).send({ error: "Erro ao atualizar filme" });
    }
   
});

// deletar filme
server.delete('/filmes/:id', async (request, reply) => {
    const { id } = request.params;
    try {
        await sql`
        DELETE FROM filmes
        WHERE id = ${id}
        RETURNING *
        `;

        if (result.length === 0){
            return reply.status(404).send({ error: "Filme não encontrado" });
        }
        reply.status(200).send("Filme deletado com sucesso");

    } catch (error) {
        reply.status(404).send({ error: error.message });
    }
});

// iniciar o servidor
http.createServer(requestHandler).listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});