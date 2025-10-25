import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Submit from "./pages/Submit";
import History from "./pages/History";
import ProblemHistory from "./pages/ProblemHistory";
import { useActiveUser } from './contexts/ActiveUserContext';
import SubmissionDetail from "./pages/SubmissionDetail";
import NewUser from './pages/NewUser'
import axios from 'axios'

export default function App() {
  return (
    <div className='min-h-screen'>
      <nav className='ios-nav fixed top-0 left-0 right-0 z-20'>
        <div className='container mx-auto py-3 px-4 flex items-center justify-between'>
          <div className='text-lg font-semibold'>
            <Link to='/'>Code Auto Grader</Link>
          </div>
          <div className='flex items-center gap-3'>
              <UserChooser />
            </div>
        </div>
      </nav>
      <main className='container mx-auto p-6'>
        <div style={{ height: 56 }} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/submit/:uuid/:problemId' element={<Submit />} />
          <Route path='/history/:uuid' element={<History />} />
          <Route
            path='/history/:uuid/problem/:problemId'
            element={<ProblemHistory />}
          />
          <Route
            path='/history/:uuid/problem/:problemId/submission/:submissionId'
            element={<SubmissionDetail />}
          />
          <Route path='/new' element={<NewUser/>} />
        </Routes>
      </main>
    </div>
  );
}

function UserChooser() {
  const { uuid, setUuid, createNew } = useActiveUser();
  const [users, setUsers] = React.useState([])

  React.useEffect(()=>{
    axios.get((import.meta.env.VITE_API_BASE || 'http://localhost:8000') + '/api/students')
      .then(r=>setUsers(r.data)).catch(()=>setUsers([]))
  },[])

  React.useEffect(()=>{
    // refresh when active uuid changes
    axios.get((import.meta.env.VITE_API_BASE || 'http://localhost:8000') + '/api/students')
      .then(r=>setUsers(r.data)).catch(()=>{})
  },[uuid])

  return (
    <div className="flex items-center gap-2">
      <select className="ios-pill px-3 py-1 text-sm" value={uuid||''} onChange={e=>setUuid(e.target.value)}>
        <option value="">-- select user --</option>
        {users.map(u=> (<option key={u.uuid} value={u.uuid}>{u.uuid}</option>))}
      </select>
      <Link to="/new" className="ios-pill">New user</Link>
      <Link to={`/history/${uuid||''}`} className="ios-pill">History</Link>
    </div>
  )
}
