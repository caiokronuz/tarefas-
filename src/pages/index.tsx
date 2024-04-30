import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

import heroImg from '../../public/assets/hero.png';

export default function Home() {
  return (
    <>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma mais fácil</title>
        <meta name="description" content="Organize suas tarefas de forma mais fácil" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.logoContent}>
            <Image
              className={styles.hero}
              alt="Logo tarefas"
              src={heroImg}
              priority
            />
          </div>
          <h1 className={styles.title}>
            Sitema feito para você organizar <br/>
            seus estudos e tarefas
          </h1>
        </main>
      </div>
    </>
  );
}
