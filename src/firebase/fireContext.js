import React, { createContext, useContext, useEffect, useState } from "react";
import { firedb } from "./config";
import {
    getCountFromServer,
    collection,
    getDoc,
    setDoc,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";

export const fireContext = createContext();
export const useContextFire = () =>{
    const context = useContext(fireContext)
    return context;
}
export const FireProvider = ({children}) =>{

    const [loading, SetLoading] = useState(true);
    const [fecha, SetFecha] = useState( ()=>{let fecha = new Date(); return fecha.getFullYear()+"."+fecha.getMonth()+"."+fecha.getDate()})
    const [confesionesD, SetconfesionesD] = useState(null);


    const iniciar = async()=> {
        const data = await getConfesionesDiarias()
        SetconfesionesD(data);
    }

    const contarConfesiones= async() => {
        const coll = collection(firedb, fecha);
        const snapshot = await getCountFromServer(coll);
        console.log('count: ', snapshot.data().count);
        return snapshot.data().count;
    }

    const subirConfesion = async(laConfesion) => {
        try {          
            const count = await contarConfesiones();  
            const nuevaConfesion = {
                id: count,
                edad: laConfesion.edad,
                genero: laConfesion.genero,
                confesion: laConfesion.confesion,
                comentarios: {},
            }
            await setDoc(doc(firedb, fecha, count.toString()),nuevaConfesion)
            
        } catch (error) { console.log('no se pudo subir la confesión a la BBDD: '+error) }
    }

    const comentarConfesion = async(comentario) =>{
        try {
            console.log(comentario.id)
            const docref = doc(firedb, fecha, comentario.id.toString());
            await updateDoc(docref, {
                comentarios: arrayUnion(comentario)
            }).then(docref =>{
                console.log("comentario subido correctamente: "+JSON.stringify(comentario))
                iniciar();
            }).catch(error =>{ 
                //la confesión fue borrada
                console.log("ups, ya no existe esta confesión "+error)
            })
            
        } catch (error) { console.log('no se pudo comentar: '+error) }
    }

    const getConfesionesDiarias = async() => {
        const ref = collection(firedb, fecha);
        const snapshot = await getDocs(ref);
        const data = snapshot.docs.map((item)=>item.data());
        return data;
    }

    useEffect(()=>{
        iniciar();        
    },[])

    useEffect(()=>{
        if(confesionesD){SetLoading(false)}    
    },[confesionesD])






return <fireContext.Provider value={{
    loading,
    fecha,
    subirConfesion,
    comentarConfesion,
    confesionesD,
}}>{children}</fireContext.Provider>
}