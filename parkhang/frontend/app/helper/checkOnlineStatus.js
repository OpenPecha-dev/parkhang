import axios from 'axios'

async function isOnline(){
    let isit = 'no';
  
const data=await axios.get('https://jsonplaceholder.typicode.com/todos/1')
if(data){
    return isit='yes';
}    
return isit
}   



export default isOnline;