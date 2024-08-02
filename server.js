import "dotenv/config"
import express, { request, response } from "express"
import mysql from "mysql2"
import { v4 as uuidv4 } from "uuid"

const PORT = process.env.PORT

const app = express()

//receber dados no formato JSON
app.use(express.json())

//CRIAR conexão com o banco de dados
const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
})

//CONECTAR ao Banco
conn.connect((err) => {
    if (err) {
        console.error(err)
    }
    console.log("MYSQL conectado!");
    app.listen(PORT, () => {
        console.log("servidor on PORT " + PORT)
    })
})

app.get('/livros', (request, response) => {

    const sql = /* sql */ `SELECT * FROM livros`
    conn.query(sql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar livros" })
            return
        }
        const livros = data
        response.status(200).json(livros)
    })
})

app.post("/livros", (request, response) => {
    const { titulo, autor, ano_publicacao, genero, preco } = request.body

    //validações
    if (!titulo) {
        response.status(400).json({ err: "O livro é obrigatório" })
        return
    }
    if (!autor) {
        response.status(400).json({ err: "O autor é obrigatório" })
        return
    }
    if (!ano_publicacao) {
        response.status(400).json({ err: "O ano publicação é obrigatório" })
        return
    }
    if (!genero) {
        response.status(400).json({ err: "O genêro é obrigatório" })
        return
    }
    if (!preco) {
        response.status(400).json({ err: "O preço é obrigatório" })
        return
    }

    //verificar se o livro não foi cadastrado
    const checkSql = /*sql*/ `SELECT * FROM livros WHERE titulo = "${titulo}" AND autor = "${autor}" AND ano_publicacao = "${ano_publicacao}"  `
    conn.query(checkSql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar livros" })
            return
        }

        if (data.length > 0) {
            response.status(409).json({ err: "Livro já foi cadastrado" })
        }

        //Cadastrar o livro
        const id = uuidv4()
        const disponibilidade = 1
        const insertSql = /*sql*/ `INSERT INTO livros
        (livro_id, titulo, autor, ano_publicacao, genero, preco, disponibilidade)
        VALUES
        ("${id}","${titulo}","${autor}","${ano_publicacao}","${genero}","${preco}","${disponibilidade}")`
        conn.query(insertSql, (err) => {
            if (err) {
                console.error(err)
                response.status(500).json({ err: "Erro ao cadastrar" })
                return
            }
            response.status(201).json({ message: "Livro Cadastrado" })
        })

    })
})

//listar 1
app.get("/livros/:id", (request, response) => {
    const { id } = request.params

    const sql =/*sql*/ `SELECT * FROM livros WHERE
    livro_id = "${id}"`
    conn.query(sql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar" })
            return
        }

        if (data.length === 0) {
            response.status(404).json({ err: "Livro não encontrado" })
            return
        }

        const livro = data[0]
        response.status(200).json(livro)
    })
})

//atualizar
app.put("/livros/:id", (request, response) => {
    const { id } = request.params
    const { titulo, autor, ano_publicacao, genero, preco, disponibilidade } = request.body

    //validações
    if (!titulo) {
        response.status(400).json({ err: "O livro é obrigatório" })
        return
    }
    if (!autor) {
        response.status(400).json({ err: "O autor é obrigatório" })
        return
    }
    if (!ano_publicacao) {
        response.status(400).json({ err: "O ano publicação é obrigatório" })
        return
    }
    if (!genero) {
        response.status(400).json({ err: "O genêro é obrigatório" })
        return
    }
    if (!preco) {
        response.status(400).json({ err: "O preço é obrigatório" })
        return
    }
    if (disponibilidade === undefined) {
        response.status(400).json({ err: "A disponibilidade é obrigatório" })
    }



    const sql =/*sql*/ `SELECT * FROM livros WHERE
    livro_id = "${id}"`
    conn.query(sql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao buscar" })
            return
        }

        if (data.length === 0) {
            response.status(404).json({ err: "Livro não encontrado" })
            return
        }

        const updateSql = /*sql*/ `UPDATE livros SET
            titulo = "${titulo}", autor = "${autor}", ano_publicacao = "${ano_publicacao}", genero = "${genero}", preco = "${preco}", disponibilidade ="${disponibilidade}"
            WHERE livro_id = "${id}"
        `

        conn.query(updateSql, (err, fields) => {
            if (err) {
                console.error(err)
                response.status(500).json({ err: "Erro ao atualizar livro" })
            }

            console.log(result);
            console.log(fields);
            response.status(200).json({ message: "Livro atualizado" })
        })
    })
})

//Delete
app.delete("/livros/:id", (request, response) => {
    const { id } = request.params

    const deleteSql =/*sql*/ `DELETE FROM livros WHERE livro_id = "${id}"`

    conn.query(deleteSql, (err, info) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao deletar livro" })
            return
        }

        if (info.affectedRows === 0) {
            console.error(err)
            response.status(500).json({ err: "Erro ao deletar livro" })
            return
        }
        response.status(200).json("Livro Deletado")
    })
})

/************ ROTAS DE FUNCIONARIOS ******************/
/** tabela (id, nome, cargo, data_contratacao, salario, email, created_at, updated_at)
 * 1ª listar todos os funcionarios
 * 2ª cadastrar um funcionarios (email é único)
 * 3ª Listar um funcionário
 * 4ª Atualizar um funcionario (não poder ter o email de outro func.)
 * 5ª Deletar um funcionario
 */