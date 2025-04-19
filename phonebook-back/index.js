require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

let persons = []

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(express.json())

app.use(express.static('dist'))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>Welcome!</h1>')
  })

app.get('/info', (request, response) => {
    response.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    `)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        persons = result
        response.json(persons)
    })
    .catch(error => {
        console.log(error)
        response.status(500).end()
    })
  })


const generateId = () => {
    return (Math.floor(Math.random() * 1000000))
}


app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    if(persons.some(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'name already exists'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== Number(id))

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})