import React, { useCallback, useEffect, useRef } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"

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
export default function TextEditor() {
    const wrapperRef = useRef()
    
    useEffect(()=>{
        const editor = document.createElement('div');
        wrapperRef.current.append(editor);
        // console.log("Effect started");
        new Quill(editor,{theme: "snow"})

        return ()=>{
            // now there is one more  thing taht is if the ref is not defined yet and you started clearingup
            // so deal with this we will use callbacks
            wrapperRef.current.innerHTML = "";
        }
    },[])

  return (
        <div id="container" ref={wrapperRef}></div>
  )
}
