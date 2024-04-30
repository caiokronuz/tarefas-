import Head from "next/head";
import { GetServerSideProps } from "next";

import {getSession} from 'next-auth/react'

import styles from './style.module.css';

export default function Dashboard(){
    return(
        <>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>      

            <div>
                <h1>Página Painel</h1>
            </div> 
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {

    const session = await getSession({ req })
    console.log(session);

    if(!session?.user){
        return{
            redirect: {destination: "/", permanent: false}
        }
    }

    return{
        props: {session},
    }
}