/*
import React, { createContext, useContext, useEffect, useState } from "react";
//importaciones auth
import { fireauth, firedb, firestorage } from "./config";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    //listAll,
} from 'firebase/storage';

import {
    collection,
    getDoc,
    setDoc,
    doc,
    getDocs,
    query,
    where,
    GeoPoint,
  } from 'firebase/firestore';


//context contiene los valores del contexto para ser utilizados desde cualquier componente
export const fireContext = createContext()

//hook personalizado para simplicar el código de importación del context y useContext en otros componentes
export const useContextFire = () =>{
    const context = useContext(fireContext)
    return context 
}

//FireProvider nos permitirá acceder a los datos del contexto colocándose como padre de todos los componentes
export const FireProvider = ({children}) =>{
    //datos del contexto:
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(null);
    const [prod, setProd] = useState(null);
    //const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [loading, SetLoading] = useState(true)
    
    //funciones de contexto
    const singup = (email, password) =>
        createUserWithEmailAndPassword(fireauth, email, password)

    const login = (email, password) => 
        signInWithEmailAndPassword(fireauth, email, password)

    const logout = () => signOut(fireauth)

    const loginWithGoogle = () => {
        const googleProvider = new GoogleAuthProvider();
        return  signInWithPopup(fireauth, googleProvider);
    }

    const loginWithFacebook = () => {
        const facebookProvider = new FacebookAuthProvider();
        return signInWithPopup(fireauth, facebookProvider);
    }

    const recoverPassword = (email) =>  sendPasswordResetEmail(fireauth, email)

    //storage
    const setProfilePic = async(archivo) =>{
        try {
            const archivoRef= ref(firestorage, user.uid+'/photoURL');
            await uploadBytes(archivoRef, archivo)
            const urlArchivo = await getDownloadURL(archivoRef);
            //const tempUser = {...user}
            //tempUser[`${tipo}`] = urlArchivo;
            //setUser(tempUser);
            return urlArchivo;            
        } catch (error) {
            return error;
        }        
    }

    const setPortada = async(archivo) =>{
        try {
            const archivoRef= ref(firestorage, user.uid+'/portada');
            await uploadBytes(archivoRef, archivo)
            const urlArchivo = await getDownloadURL(archivoRef);
            //const tempUser = {...user}
            //tempUser[`${tipo}`] = urlArchivo;
            //setUser(tempUser);
            return urlArchivo;            
        } catch (error) {
            return error;
        }        
    }

    const subirPhotoProducto = async(archivo, name) =>{
        try {
            const archivoRef= ref(firestorage, user.uid+`/productos/${name}`);
            await uploadBytes(archivoRef, archivo)
            const urlArchivo = await getDownloadURL(archivoRef);
            return urlArchivo;            
        } catch (error) {
            return error;
        }        
    }

    const subirFoto = async(archivo, name) =>{
        try {
            const archivoRef= ref(firestorage, user.uid+`/fotos/${name}`);
            await uploadBytes(archivoRef, archivo)
            const urlArchivo = await getDownloadURL(archivoRef);
            return urlArchivo;            
        } catch (error) {
            return error;
        }        
    }

    //db
    const userExist = async(userid) => {
        if(userid===null)return false;
        const docRef = doc(firedb, "usuarios", userid);
        const res = await getDoc(docRef);
        return res.exists();
    }

    const existQUERY = async(collec, clave, valor) => {
        const collectionables = []
        const docsRef = collection(firedb, collec);
        const q = query(docsRef, where(clave, "==", valor));
        const querySnap = await getDocs(q);
        querySnap.forEach(doc=>{
            collectionables.push(doc.data());
        });
        return collectionables.length>0? true : null;
    }

    const registrarUser = async(thisuser) => {
        try {
            const newUser = {
                uid: thisuser.uid,
                email: thisuser.email,
                displayName: thisuser.displayName||"",
                photoURL: thisuser.photoURL||"",
                portada: thisuser.portada||"",
                bio: thisuser.bio||"",
                nivel: thisuser.nivel||1,
                empresa: thisuser.empresa||false,
                contacto: thisuser.contacto||[],
                tags: thisuser.tags||[],
                map: thisuser.map||new GeoPoint(0, 0),
            }
            await setDoc(doc(firedb, "usuarios", newUser.uid), newUser);
            setUser({...newUser})
        } catch (error) { console.log('no se puedo registrar el usuario: '+error) }
    }

    const setUserInfo = async(userId) => {
        const docRef = doc(firedb, "usuarios", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            //console.log("recuperado:", docSnap.data());
            setUser( {...user,...docSnap.data()} );
        }
    }

    const getUserInfo = async(userId) => {
        const docRef = doc(firedb, "usuarios", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return{...docSnap.data()}            
        }
    }
    const updateUser = async(newuser) => {
        try {
            await setDoc(doc(firedb, "usuarios", newuser.uid), newuser);
            setUser({...newuser})
            //console.log('perfil actualizado')
        } catch (error) { console.log(error)}
    }

    const addProduct = async(userId, producto) => {
        try {
            const LosProductos = [...await getProd(userId)||[], producto]
            setProd(LosProductos);
            await setDoc(doc(firedb, "productos", userId), {productos:LosProductos});
            
        } catch (error) { console.log('no se puedo registrar el producto: '+error) }
    }

    const getProd = async(userId) =>{
        const docRef = doc(firedb, "productos", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const prodOBJ = {...docSnap.data()}
            return prodOBJ.productos;       
        }
    }

    const addCalif = async(empresaid, calif, myuser) => {
        try {
            const antiguasCalif = await getCalif(empresaid)||{};
            const calificaciones = [...antiguasCalif, calif];
  
            let ArregloStars = myuser.stars;
            ArregloStars[calif.estrellas - 1] = ArregloStars[calif.estrellas - 1]+1;
            const newuser = {...myuser, stars: ArregloStars};
            await updateUser(newuser);

            await setDoc(doc(firedb, "calificaciones", empresaid), {opiniones: calificaciones});
            
        } catch (error) { console.log('no se pudo registrar la calificacion: '+error) }
    }

    const getCalif = async(empresaId) =>{
        const docRef = doc(firedb, "calificaciones", empresaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const prodOBJ = {...docSnap.data()}
            //console.log('encontrado: '+JSON.stringify(prodOBJ.opiniones))
            return prodOBJ.opiniones;    
        } else return [];
    }

    const isCalif = async(empresaId, userid) =>{
        let comentario = null;
        const docRef = doc(firedb, "calificaciones", empresaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const prodOBJ = {...docSnap.data()}
            const arreglo = prodOBJ.opiniones;
            for (var i = 0; i < arreglo.length; i++) {
                if(arreglo[i]["autor"]===userid)comentario=arreglo[i];
            }
        }
        return comentario;
    }

    const empresaMarks = async() => {
        const q = query(collection(firedb, "usuarios"), where("empresa", "==", true));

        const querySnapshot = await getDocs(q);
        let marcas =[]
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            if(data.contacto.length>0){
                const anchor = [doc.id, data.contacto[4].latitude, data.contacto[4].longitude]
                marcas.push(anchor)
            }
        })
        return marcas;
    }

    const setFotos = async(file,tit,des) =>{
        //try {
            const url = await subirFoto(file, file.name)
            let lfotos = await getFotos(user.uid)||[];
            const newfoto = {url: url,title: tit,desc: des}
            const data = [...lfotos, newfoto];
            await setDoc(doc(firedb, "fotos", user.uid), {fotos: data});
           
            
        //} catch (error) { console.log('no se pudo subir la foto: '+error) }
    }

    const getFotos = async(uid) =>{
        const docRef = doc(firedb, "fotos", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().fotos
        }
        return [];

        //trae las fotos directamente de la fire storage
        //const archivosRef= ref(firestorage, user.uid+`/fotos`);
        //listAll(archivosRef)
        //.then((res) => {
        //    console.log(res);
        //    res.prefixes.forEach((folderRef) => {
        //    // All the prefixes under listRef.
        //   // You may call listAll() recursively on them.
        //    });
        //    res.items.forEach((itemRef) => {
        //    // All the items under listRef.
        //    });
        //}).catch((error) => {
        //    // Uh-oh, an error occurred!
        //});
    }

    //cambio estado del auth
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(fireauth, async currentUser =>{
            setAuth(currentUser);
            if(currentUser) {
                const register = await userExist(currentUser.uid)
                if(register){
                    //console.log("usuario autorizado y registrado: "/*+JSON.stringify(currentUser))
                    if(!user){
                        setUserInfo(currentUser.uid)
                        setProd(await getProd(currentUser.uid))
                    }
                    //else{
                    //    console.log('ya en chache: '+JSON.stringify(user));
                    //    SetLoading(false);
                    //}
                }
                else
                {
                    //console.log("usuario autorizado y no registrado")
                    await registrarUser(currentUser)
                }
            }else{
                //console.log('se cerro sesion')
                //localStorage.removeItem('user');
                SetLoading(false);
            }
            
        })
        return () => unsubscribe();
    },[])

    useEffect(()=>{
        if(user){
            //localStorage.setItem('user', JSON.stringify(user))  
            SetLoading(false);
        }        
    },[user])

    return <fireContext.Provider value={{
        //vars
        auth, user, prod, loading,
        //auth
        singup, login, loginWithGoogle, loginWithFacebook, logout, recoverPassword,
        //storage
        setProfilePic,
        setPortada,
        subirPhotoProducto,
        subirFoto,
        getFotos,
        //bd
        userExist,
        setUserInfo,
        getUserInfo,
        existQUERY,
        updateUser,
        addProduct,
        getProd,
        setFotos,
        addCalif,
        getCalif,
        isCalif,
        empresaMarks,
    }}>{children}</fireContext.Provider>
}*/


import React, { createContext, useContext, useEffect, useState } from "react";
import { firedb } from "./config";
import {
    collection,
    getDoc,
    setDoc,
    doc,
    getDocs,
    query,
    where,
    GeoPoint, } from "firebase/firestore";

export const fireContext = createContext();
export const useContextFire = () =>{
    const context = useContext(fireContext)
    return context;
}
export const FireProvider = ({children}) =>{

    const [loading, SetLoading] = useState(true)

    const registrarUser = async(thisuser) => {
        try {
            const newUser = {
                uid: thisuser.uid,
            }
            await setDoc(doc(firedb, "usuarios", newUser.uid), newUser);
            //setUser({...newUser})
        } catch (error) { console.log('no se puedo registrar el usuario: '+error) }
    }

    const setUserInfo = async(userId) => {
        const docRef = doc(firedb, "usuarios", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            //console.log("recuperado:", docSnap.data());
            //setUser( {...user,...docSnap.data()} );
        }
    }

    const getUserInfo = async(userId) => {
        const docRef = doc(firedb, "usuarios", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return{...docSnap.data()}            
        }
    }


return <fireContext.Provider value={{
    loading,
    registrarUser,
    setUserInfo,
    getUserInfo,
}}>{children}</fireContext.Provider>
}