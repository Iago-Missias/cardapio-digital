'use client'
import { useState } from 'react'
export default function Client() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>Clique {n}</button>
}
