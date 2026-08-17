import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import db from '../db'
import './App.css'

function ContactList({ contacts }) {
  const [search, setSearch] = useState('')

  const filteredContacts = contacts.filter(contact => {
    const name = `${contact.firstName} ${contact.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div>
      <h1>Contact Book</h1>
      <Link to="/new">Add Contact</Link>
      <br /><br />
      <input
        placeholder="Search contacts"
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      <ul>
        {filteredContacts.map(contact => (
          <li key={contact.id}>
            <Link to={`/contact/${contact.id}`}>
              {contact.lastName}, {contact.firstName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactDetails({ contacts, setContacts }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'contacts', id)).then(snapshot => {
      setContact(snapshot.data())
    })
  }, [id])

  async function removeContact() {
    await deleteDoc(doc(db, 'contacts', id))
    setContacts(contacts => contacts.filter(contact => contact.id !== id))
    navigate('/')
  }

  if (!contact) return <p>Loading...</p>

  const contactIndex = contacts.findIndex(item => item.id === id)
  const emailColour = contactIndex % 2 === 0 ? 'pink-pill' : 'cream-pill'

  return (
    <div>
      <h1>{contact.firstName} {contact.lastName}</h1>
      <p className={`email-pill ${emailColour}`}>Email: {contact.email}</p>
      <Link to={`/edit/${id}`}>Edit Contact</Link>
      <br /><br />
      <button onClick={removeContact}>Delete Contact</button>
      <br /><br />
      <Link to="/">Back to Contacts</Link>
    </div>
  )
}

function ContactForm({ edit, setContacts }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (edit) {
      getDoc(doc(db, 'contacts', id)).then(snapshot => {
        const contact = snapshot.data()
        setFirstName(contact.firstName)
        setLastName(contact.lastName)
        setEmail(contact.email)
      })
    }
  }, [edit, id])

  async function saveContact(event) {
    event.preventDefault()
    const contact = { firstName, lastName, email }

    if (edit) {
      await updateDoc(doc(db, 'contacts', id), contact)
      setContacts(contacts => {
        const list = contacts.map(item => item.id === id ? { id, ...contact } : item)
        list.sort((a, b) => a.lastName.localeCompare(b.lastName))
        return list
      })
      navigate(`/contact/${id}`)
    } else {
      const newContact = await addDoc(collection(db, 'contacts'), contact)
      setContacts(contacts => {
        const list = [...contacts, { id: newContact.id, ...contact }]
        list.sort((a, b) => a.lastName.localeCompare(b.lastName))
        return list
      })
      navigate(`/contact/${newContact.id}`)
    }
  }

  return (
    <div>
      <h1>{edit ? 'Edit Contact' : 'New Contact'}</h1>
      <form onSubmit={saveContact}>
        <label>First Name</label><br />
        <input value={firstName} onChange={event => setFirstName(event.target.value)} required /><br /><br />
        <label>Last Name</label><br />
        <input value={lastName} onChange={event => setLastName(event.target.value)} required /><br /><br />
        <label>Email</label><br />
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} required /><br /><br />
        <button type="submit">Save Contact</button>
      </form>
      <br />
      <Link to="/">Cancel</Link>
    </div>
  )
}

function App() {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    getDocs(collection(db, 'contacts')).then(snapshot => {
      const list = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
      list.sort((a, b) => a.lastName.localeCompare(b.lastName))
      setContacts(list)
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContactList contacts={contacts} />} />
        <Route path="/contact/:id" element={<ContactDetails contacts={contacts} setContacts={setContacts} />} />
        <Route path="/new" element={<ContactForm setContacts={setContacts} />} />
        <Route path="/edit/:id" element={<ContactForm edit setContacts={setContacts} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
