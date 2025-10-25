import React, { createContext, useContext, useEffect, useState } from 'react'

const ActiveUserContext = createContext()

export function ActiveUserProvider({ children }){
  const [uuid, setUuid] = useState(()=>{
    try{ return localStorage.getItem('active_uuid') || '' }catch(e){ return '' }
  })

  useEffect(()=>{
    try{ if(uuid) localStorage.setItem('active_uuid', uuid) }catch(e){}
  },[uuid])

  function createNew(){
    // prefer crypto.randomUUID when available
    let id = ''
    if(typeof crypto !== 'undefined' && crypto.randomUUID) id = crypto.randomUUID()
    else id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
    setUuid(id)
    return id
  }

  return (
    <ActiveUserContext.Provider value={{ uuid, setUuid, createNew }}>
      {children}
    </ActiveUserContext.Provider>
  )
}

export function useActiveUser(){
  return useContext(ActiveUserContext)
}

export default ActiveUserContext
