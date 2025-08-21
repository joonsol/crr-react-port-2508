import React from 'react'
import { useSmoothScroll } from "../hooks/useSmoothScroll";

const Header = () => {
  const { scrollToId } = useSmoothScroll(64);
  return (
  <header className="header fixed top-0 left-0 right-0">
    <nav className="nav">
      <button onClick={() => scrollToId("hero")}>Home</button>
      <button onClick={() => scrollToId("about")}>About</button>
      <button onClick={() => scrollToId("work")}>Work</button>
      <button onClick={() => scrollToId("contact")}>Contact</button>
    </nav>
  </header>
  )
}

export default Header