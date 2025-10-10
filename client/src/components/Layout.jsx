import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-50 p-10">
          <div className=" mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout