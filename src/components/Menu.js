// components/Menu.js

import Link from "next/link";

export default function Menu() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>

        <li>
          <Link href="/change-log">Registro de Cambios</Link>
        </li>
      </ul>
      <style jsx>{`
        nav {
          background: #333;
          color: white;
          padding: 1rem;
        }
        ul {
          display: flex;
          list-style: none;
        }
        li {
          margin-right: 1rem;
        }
        a {
          color: white;
          text-decoration: none;
        }
      `}</style>
    </nav>
  );
}
