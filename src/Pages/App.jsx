//import logo from './logo.svg';
//import './App.css';
import React, {useEffect} from "react";
import { useContextFire } from "../firebase/fireContext";

function App() {
  const {loading, fecha, subirConfesion, comentarConfesion, confesionesD} = useContextFire();

  useEffect(()=>{   
},[confesionesD])

  const confesar = async(e)=>{
    e.preventDefault();
    const confesion = {
      edad: 23,
      genero: 1,
      confesion: "Esto es un"
    };
    await subirConfesion(confesion);
  }

  const comentar = async(e)=>{
    e.preventDefault();
    const comentario = {
      id: 0,
      edad: 2,
      genero: 1,
      comentario: "Te estoy uuuh"
    };
    await comentarConfesion(comentario);
  }

  if(loading) return (
    <div className="container-fluid text-center" style={{width: "100%", height:"10%"}}>
        <div id="loader-content"><div id="loader">loading...</div> </div>
    </div>
    )
  return (
    <>
    <h1>My app</h1>
    <p> {fecha} </p>
    {confesionesD.map((item, key)=><ul key={key} id={item.id}><b>
      {item.edad}
      {item.genero===0?"mujer":"hombre "}
      {item.confesion}
      </b>
      {
      Object.getPrototypeOf(item.comentarios).toString()===""?
      [...Object.create(item.comentarios)].map((comentario, key) => 
        <li key={key}>
        {comentario.edad}
        {comentario.genero===0?"mujer":"hombre "}
        {comentario.comentario}
        </li>
      ):null
      }
      </ul>)}
    <button onClick={confesar}>Subir Confesion</button>
    <button onClick={comentar}>comentar</button>
    </>
  );
}

export default App;
