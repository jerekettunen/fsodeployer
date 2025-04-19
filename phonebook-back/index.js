require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person.js')

const app = express()

const opts = { runValidators: true }

let persons = []

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Welcome!</h1>')
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `)
  }
  ).catch(error => {
    console.log(error)
    response.status(500).end()
  })
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


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id, opts).then(person => {
    response.json(person)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  Person.findById(request.params.id, opts)
    .then(person => {
      if(!person) {
        return response.status(404).end()
      }

      person.name = body.name
      person.number = body.number
      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})