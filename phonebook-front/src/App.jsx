import { useState, useEffect } from 'react'
import axios from 'axios'
import personService from './services/persons'
import './index.css'

const Notification = ({ message, state }) => {
  if (message === null) {
    return null
  }
  if (state) {
    const messageStyle = { color: 'red', background: 'lightgrey', fontSize: 20, borderStyle: 'solid', borderRadius: 5, padding: 10, marginBottom: 10 }
    return (
      <div style={messageStyle} className="error">
        {message}
      </div>
    )
  }
  else {
    const messageStyle = { color: 'green', background: 'lightgrey', fontSize: 20, borderStyle: 'solid', borderRadius: 5, padding: 10, marginBottom: 10 }
    return (
      <div style={messageStyle} className="success">
        {message}
      </div>
    )
  }
}

const Filter = ({ filter, handleFilterChange }) => {

  return (
    <div>
      filter shown with <input value={filter} onChange={handleFilterChange} />
    </div>
  )
}

const Form = ({ addName, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
    <form onSubmit={addName}>
      <div>
        name: <input 
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <div>number: <input 
          value={newNumber}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, filter, handleDelete }) => {
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )
  
  return (
    <ul>
        {filteredPersons.map((person, index) => (
          <li key={person.id}>{person.name} {person.number}
          <Button onClick={() => handleDelete(person)} text="delete" />
          </li>
        ))}
      </ul>
  )
}

const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>

const App = () => {
  // State variables
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const baseMessage = {text : null, state : false}
  const [updateMessage, setUpdateMessage] = useState(baseMessage)

  // Fetch data from server
  useEffect( () => {
    personService
      .getAll()
      .then((initialPersons) => {
        setPersons(initialPersons)
      })
  }, [])

  // Event handlers
  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  const handleDelete = (person) => {
    const name = person.name
    const id = person.id
    if (window.confirm(`Delete ${name} ?`)) {
      personService.remove(id)
        .then((removedPerson) => {
          const updatedPersons = persons.filter(p => p.id !== id)
          setPersons(updatedPersons)
        })
    } else {     
    }
  }


  const addName = (event) => {
    event.preventDefault()
    const nameObject = {
      name: newName,
      number: newNumber,
    }
    const nameExists = persons.some(person => person.name === newName)
    if (nameExists) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(p => p.name === newName)
        personService
        .update(person.id, { ...person, number: newNumber })
        .then((returnedPerson) => {
          setPersons(persons.map(p => (p.id !== person.id ? p : returnedPerson)))
          
          setNewName('')
          setNewNumber('')

          const newMessage = {
            text: `Updated ${returnedPerson.name}'s number`,
            state: false
          }
          setUpdateMessage(newMessage)
          setTimeout(() => {
            setUpdateMessage(baseMessage)
          }, 5000)

        })
        .catch(error => {
          const errorMessage = {
            text: `Information of ${person.name} has already been removed from server`,
            state: true
          }
          setUpdateMessage(errorMessage)
          setTimeout(() => {
            setUpdateMessage(baseMessage)
          }, 5000)
        })
      } else {
      }
      return
    }

    personService
      .create(nameObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')

        const newMessage = {
          text: `Added ${returnedPerson.name}`,
          state: false
        }
        setUpdateMessage(newMessage)
        setTimeout(() => {
          setUpdateMessage(baseMessage)
        }, 5000)
      })
      .catch(error => {
        const errorMessage = {
          text: error.response.data.error,
          state: true
        }
        setUpdateMessage(errorMessage)
        setTimeout(() => {
          setUpdateMessage(baseMessage)
        }, 5000)
      })
  }




  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={updateMessage.text} state={updateMessage.state} />
      <h3>Search</h3>
      <p>Search for a name</p>
      <Filter filter = {filter} handleFilterChange={handleFilterChange}/>
      <h3>Add a new</h3>
      <Form addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
        />
      <h3>Numbers</h3>
      <Persons persons={persons} filter={filter} handleDelete={handleDelete} />
    </div>
  )
}

export default App