import { Timestamp } from "firebase/firestore";
import {database, ref, push, onValue} from "../firebase"
import { useEffect, useState } from "react"

export const useChat=(roomId)=>{
    const [messages, setMessages]=useState([]);

    useEffect(()=>{
        const messagesRef=ref(database,`rooms/${roomId}/messages`);
        onValue(messagesRef, (snapshot)=>{
            const data= snapshot.val();
            const formattedMessages= data ? Object.entries(data).map(([key,value])=>({id:key, ...value})):[];
            setMessages(formattedMessages);

        })
    },[roomId]);

    const sendMessage=(user,text)=>{
        const messagesRef = ref(database,`rooms/${roomId}/messages`);
        push(messagesRef,{
            user,
            text,
            Timestamp:new Date().toISOString(),
        })
    }
    return {
        messages,
        sendMessage,
    }

}