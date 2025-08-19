import React from 'react'
import Aboutme from '../components/Aboutme'
import Contact from '../components/Contact'
import Hero from '../components/Hero'
import Work from '../components/Work'
import Header from '../components/Header'
import Footer from '../components/Footer'
const Home = () => {
  return (
    <div>
        <Header/>
        <Aboutme/>
        <Hero/>
        <Work/>
        <Contact/>
        <Footer/>
    </div>
  )
}

export default Home