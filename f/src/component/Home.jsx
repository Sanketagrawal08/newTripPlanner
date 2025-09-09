import React from 'react'
import useAuthStore from '../store/authStore'

const Home = () => {

  const {logout} = useAuthStore()

  return (
    <div>

      home

      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Home