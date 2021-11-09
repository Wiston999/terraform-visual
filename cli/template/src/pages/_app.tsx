import '@app/pages/_app.css'

import 'bootstrap/dist/css/bootstrap.min.css';

import { Entities } from '@app/data'
import { useState } from 'react'
import { Navbar } from '@app/components'
import Head from 'next/head'

const App = ({ Component, pageProps }) => {

  const [activeView, setActiveView] = useState<Entities.AppView>(Entities.AppView.List)

  return (
    <>
      <Head>
        <title>Terraform Visual</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script src="./plan.js" />
      </Head>

      <Navbar.C view={activeView} setView={setActiveView} />

      <Component {...pageProps} view={activeView} setView={setActiveView} />
    </>
  )
}

export default App
