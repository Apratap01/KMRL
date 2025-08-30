import React from 'react'
import { useSelector } from 'react-redux'

function Test() {
  const { user } = useSelector((state) => state.auth)
  console.log("Test page rendered")
  console.log(user)
  return (
    <div className="text-white flex text-center flex-col items-center justify-center min-h-screen font-poppins gap-4">
      <div>Test page for user login</div>
      <div>
        {user
          ? <div>Logged in as: {user?.name || user?.data?.name} ({user?.email || user?.data?.email})</div>
          : <div>No user logged in</div>
        }
      </div>
    </div>
   

  )
}

export default Test