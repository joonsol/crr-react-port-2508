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
      <Header />
      <main>
        <section id="hero"><Hero /></section>
        <section id="about"><Aboutme /></section>
        <section id="work"><Work /></section>
        <section id="contact"><Contact /></section>
      </main>

      <Footer />
    </div>
  )
}

export default Home