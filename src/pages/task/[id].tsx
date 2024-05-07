import Head from 'next/head'
import { ChangeEvent, FormEvent, useState } from 'react';
import {GetServerSideProps} from 'next'
import { useSession } from 'next-auth/react';
import {FaTrash} from 'react-icons/fa'

import { db } from '@/services/firebaseConnection';
import {doc, collection, query, where, getDoc, getDocs, addDoc, deleteDoc} from 'firebase/firestore'

import { TextArea } from '@/components/textArea';

import styles from './style.module.css';

interface TaskProps{
    task:{
        tarefa: string;
        public: boolean;
        created: Date;
        user: string;
        taskId: string;
    };
    allComments: CommentProps[]
}

interface CommentProps{
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
    //created: Date;
}

export default function Task({task, allComments}: TaskProps){

    const {data: session} = useSession();

    const [input, setInput] = useState('')
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    async function handleCommit(e: FormEvent){
        e.preventDefault();
        
        if(input === ""){
            alert("Você não pode enviar um comentário vazio");
            return;
        }

        if(!session?.user?.email || !session?.user?.name){
            return;
        }

        try{
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: task?.taskId,
            })

            setInput("")
            //alert("Comentário feito com sucesso!")

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: task?.taskId
            }

            setComments((oldItems) => [...oldItems, data])
        }catch(err){
            alert(err)
        }
    }

    async function handleDeleteComment(id: string){
        try{
            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);
            //alert("Comentário deletado com sucesso!")

            const deleteComment = comments.filter((comment) => comment.id != id)
            setComments(deleteComment);

        }catch(err){
            alert(err)
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Tarefas+ - Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{task?.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentários</h2>
                <form onSubmit={handleCommit}>
                    <TextArea 
                        placeholder='Digite seu comentário...'
                        value={input}
                        onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    /> 
                    <button 
                        className={styles.button}
                        disabled={!session?.user}
                        type='submit'
                    >
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentários</h2>
                {comments.length === 0 && <span>Nenhum comentário foi encontrado.</span>}

                {comments.map(comment => (
                    <article key={comment.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentLabel}>{comment.name}</label>
                            {comment.user === session?.user?.email &&
                                <button className={styles.trashButton} onClick={() => handleDeleteComment(comment.id)}>
                                    <FaTrash size={18} color='#ea3140'/>
                                </button>
                            } 
                        </div>
                        <p>{comment.comment}</p>
                    </article>
                ))}

            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req, params}) => {

    const id = params?.id as string;

    const docRef = doc(db, "tasks", id);
    const q = query(collection(db, "comments"), where("taskId", "==", id))

    const snapshot = await getDoc(docRef);
    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = [];
    snapshotComments.forEach(doc => allComments.push({
        id: doc.id,
        comment: doc.data().comment,
        user: doc.data().user,
        name: doc.data().name,
        taskId: doc.data().taskId,
    }))

    if(snapshot.data() === undefined){
        return {
            redirect: {
                destination: "/dashboard",
                permanent: false,
            }
        }
    }

    if(!snapshot.data()?.public){
        return {
            redirect: {
                destination: "/dashboard",
                permanent: false,
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    //console.log(task)

    return{
        props:{
            task,
            allComments,
        }
    }
}
