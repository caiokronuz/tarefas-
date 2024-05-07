import Head from "next/head";
import Link from "next/link"
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from 'next-auth/react'

import { TextArea } from "@/components/textArea";
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'

import { db } from "@/services/firebaseConnection";
import {
    addDoc,
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc
} from 'firebase/firestore'

import styles from './style.module.css';

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, "tasks")

            const q = query(
                tarefasRef,
                orderBy('created', 'desc'),
                where('user', '==', user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TaskProps[];
                snapshot.forEach(doc => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    })
                })

                setTasks(lista)
            })
        }

        loadTarefas();
    }, [user?.email])

    async function handleRegisterTask(e: FormEvent) {
        e.preventDefault();

        if (input === "") {
            alert("Você precisa registrar uma tarefa.")
        }

        try {
            await addDoc(collection(db, "tasks"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            })

            alert("Tarefa criada com sucesso!")
            setInput("")
            setPublicTask(false);

        } catch (err) {
            alert("olha o console")
            console.log(err);
        }
    }

    async function handleShareTask(id: string){
        await navigator.clipboard.writeText(`http://localhost:3000/task/${id}`)
        alert("URL COPIADA COM SUCESSO!")
    }

    async function handleDeleteTask(id: string){
        const docRef = doc(db, "tasks", id)
        await deleteDoc(docRef)
        alert("Tarefa deletada com sucesso!")
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder="Digite qual sua tarefa"
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            />
                            <div className={styles.checkBoxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPublicTask(e.target.checked)}
                                />
                                <label>Deixar tarefa pública?</label>
                            </div>
                            <button type="submit" className={styles.button}>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {tasks.map(item => (
                        <article className={styles.task} key={item.id}>
                            {item.public &&
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PÚBLICO</label>
                                    <button className={styles.shareButton} onClick={() => handleShareTask(item.id)}>
                                        <FiShare2
                                            size={22}
                                            color="#3183ff"
                                        />
                                    </button>
                                </div>
                            }
                            <div className={styles.taskContent}>
                                {item.public ? 
                                    <Link href={`task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link> 
                                    : 
                                    <p>{item.tarefa}</p>
                                }
                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash
                                        size={24}
                                        color="#ea3140"
                                    />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

    const session = await getSession({ req })
    console.log(session);

    if (!session?.user) {
        return {
            redirect: { destination: "/", permanent: false }
        }
    }

    return {
        props: {
            user: {
                email: session?.user.email,
            }
        },
    }
}