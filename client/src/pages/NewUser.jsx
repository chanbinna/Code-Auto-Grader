import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useActiveUser } from '../contexts/ActiveUserContext'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function NewUser(){
  const { setUuid } = useActiveUser()
  const [users, setUsers] = useState([])
  const [newId, setNewId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{ fetchUsers() },[])

  function fetchUsers(){
    axios.get(`${API}/api/students`).then(r=>setUsers(r.data)).catch(()=>setUsers([]))
  }

  function createUser(){
    setLoading(true); setError('')
    axios.post(`${API}/api/students`, {uuid: newId || undefined}).then(r=>{
      setUuid(r.data.uuid)
      setNewId('')
      fetchUsers()
    }).catch(e=> setError(e.response?.data?.detail || 'Could not create'))
    .finally(()=>setLoading(false))
  }

  function deleteUser(u){
    if(!confirm(`Delete user ${u.uuid} and all submissions?`)) return
    axios.delete(`${API}/api/students/${u.uuid}`).then(()=>{
      // if active user was deleted, clear
      const active = localStorage.getItem('active_uuid')
      if(active === u.uuid) setUuid('')
      fetchUsers()
    }).catch(()=> alert('Could not delete'))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage users</h1>
        <Link to="/" className="ios-pill">Home</Link>
      </div>

      <div className="ios-card p-4 rounded-xl mb-4">
        <h3 className="font-medium">Create new user</h3>
        <div className="mt-3 flex items-center gap-2">
          <input className="ios-pill px-3 py-1" placeholder="custom uuid (optional)" value={newId} onChange={e=>setNewId(e.target.value)} />
          <button className="ios-button" onClick={createUser} disabled={loading}>{loading? 'Creating...':'Create'}</button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>

      <div>
        <h4 className="font-medium mb-2">Existing users</h4>
        {users.length===0 ? <div className="muted">No users yet.</div> : (
          <div className="space-y-2">
            {users.map(u=> (
              <div key={u.uuid} className="ios-card p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.uuid}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="ios-pill" onClick={()=>{ setUuid(u.uuid); alert('Set active user to '+u.uuid) }}>Use</button>
                  <button className="ios-button" onClick={()=>deleteUser(u)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
