import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

import { db } from "@/services/firebaseConnection";
import {collection, getDocs} from "firebase/firestore"

import heroImg from '../../public/assets/hero.png';
import { GetStaticProps } from "next";

interface HomeProps{
  posts: number,
  comments: number,
}

export default function Home({posts, comments}:HomeProps) {
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
          <div className={styles.infoContent}>
            <section className={styles.box}>
              <span>+{posts} posts</span>
            </section>
            <section className={styles.box}>
              <span>+{comments} comentários</span>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db, "comments")
  const commentSnapshot = await getDocs(commentRef)

  const postRef = collection(db, "tasks")
  const postSnapshot = await getDocs(postRef);

  return{
    props:{
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 86400 //1 dia
  }
}
