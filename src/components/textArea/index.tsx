import { HTMLProps } from 'react';
import styles from './style.module.css';

export function TextArea({...rest}: HTMLProps<HTMLTextAreaElement>){
    return(
        <textarea className={styles.textArea} {...rest}></textarea>
    )
}