import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom'
/** There are many reasons that may cause the useEffect to re-run 
 * When Strict Mode is on, React will run one extra development-only setup+cleanup cycle before the first real setup. This is a stress-test that ensures that your cleanup logic “mirrors” your setup logic and that it stops or undoes whatever the setup is doing. If this causes a problem, implement the cleanup function.
 * If some of your dependencies are objects or functions defined inside the component, there is a risk that they will cause the Effect to re-run more often than needed. To fix this, remove unnecessary object and function dependencies. You can also extract state updates and non-reactive logic outside of your Effect.
*/
/**Explaining the useEffect -- 
 * Its used to perform the sideeffects of anything(generally changes that ouccurs in tht state)
 * dependencies are the things on which the useEffect will be called if they change
 * the optional return function at the last is the clearup func
 * the useeffect is tend to run at least one time 
 * The clearup function will not be called the first time as the its use case is when the next useEffect is being called all the materials that are associated with previous state are cleared
 */



const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]
export default function TextEditor() {
    // const wrapperRef = useRef()
    
    // useEffect(()=>{
    //     const editor = document.createElement('div');
    //     wrapperRef.current.append(editor);
    //     // console.log("Effect started");
    //     new quill(editor,{theme: "snow"})

    //     return ()=>{
    //         // now there is one more  thing taht is if the ref is not defined yet and you started clearingup
    //         // so deal with this we will use callbacks
    //         wrapperRef.current.innerHTML = "";
    //     }
    // },[])
    const {id: documentId} = useParams();
    const [socket,setsocket] = useState(null);
    const [quill,setQuill] = useState(null);
    console.log(documentId)
    useEffect(()=>{ // for recieving the event
      if(socket == null || quill == null){
        return
      }
      socket.on("recieve-changes", (delta,oldDelta,source) =>{
          quill.updateContents(delta);
      })

      return () => {
        socket.off("recieve-changes", (delta,oldDelta,source) =>{
          quill.updateContents(delta);
      })
      }
     },[socket,quill])

     useEffect(()=>{
        if(socket == null || quill == null){ // useEffect will run one time atleast so when the socket or quill is'nt setted they will run in that case we have to return
          return;
        }
        socket.once("load-document", document => {
          quill.setContents(document);
          quill.enable();
        });
        socket.emit('get-document', documentId);
     },[socket,quill, documentId])

     useEffect(()=>{
          if(socket == null || quill == null) return;

          const interval = setInterval(()=>{
              socket.emit("save-document", quill.getContents());
          },2000)

          return () => {
            clearInterval(interval);
          }
     },[socket,quill])
     useEffect(()=>{ // for sending the event // emitting events
      if(socket == null || quill == null){
        return;
      }
      quill.on("text-change", (delta,oldDelta,source) =>{
        if(source !== 'user') return
        socket.emit("send-changes",delta)
      })
      
      return () => {
        quill.off("text-change", (delta,oldDelta,source) =>{
          if(source !== 'user') return
          socket.emit("send-changes",delta)
        })
      }
    },[socket,quill])
    
    useEffect(()=>{
      const s = io("http://localhost:3001");
      setsocket(s);
      console.log(s);
      //optional clearup
    
      return () => {
        console.clear()
        s.disconnect();
      }
    },[])

    const wrapperRef = useCallback((wrapper)=>{ // wrapper is wrapperRef.current
        console.log(typeof(wrapper))
        console.log(wrapper)
        if(wrapper == null)return
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor,{theme: "snow", modules: {toolbar:TOOLBAR_OPTIONS}});
        q.disable(); // until this dont get enabled you wont be able to write in the textfield 
        q.setText("Loading...");
        setQuill(q);
   },[])


  return (
        <div className="container" ref={wrapperRef}></div>
  )
}
