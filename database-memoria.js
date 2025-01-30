import { randomUUID } from "node:crypto"; //cria id aleatorio

export class DatabaseMemoria {  //classe para manipular os dados
    constructor() {
        this.filmes = new Map(); //cria um map para armazenar os filmes
    }

    // listar filmes
    list(search) {
        const filmesArray = Array.from(this.filmes.entries()).map(([id, data]) => ({ //converte o map para array para facilitar a leitura
            id,
            ...data
        }));
        if (search) {
            return filmesArray.filter(filme => filme.titulo.includes(search)); //
        }

        return filmesArray;
    }

    // criar filme
    create(data) {
        const id = randomUUID();
        this.filmes.set(id, data);
    }

    // atualizar filme
    update(id, data) {
        if (this.filmes.has(id)) {
            this.filmes.set(id, { ...this.filmes.get(id), ...data });
        } else {
            throw new Error('Filme não encontrado');
        }
    }

    // deletar filme
    delete(id) {
        if (this.filmes.has(id)) {
            this.filmes.delete(id);
        } else {
            throw new Error('Filme não encontrado');
        }
    }
}