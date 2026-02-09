import { useEffect, useState } from 'react'

function Settings() {
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('app_settings') as any)
    if (saved) {
      setName(saved.name || '')
      setServerUrl(saved.serverUrl || '')
    }
  }, [])

  const handleSave = () => {
    const data = { name, serverUrl }
  }
  return (
    
  )
}
