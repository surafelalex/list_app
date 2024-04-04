import React, { useState,useEffect} from 'react';
import Header from './Header';
import AddItems from './AddItems';
import Content from './Content';
import Footer from './Footer';
import SearchItem from './SearchItem';
import apiRequest from './apiRequest';
function App() {
  // Initialize items state with an empty array if localStorage is empty or null
  
  const API_URL = "http://localhost:3500/items";
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [search,setSearch] = useState('');
  const [fetchError,setFetchError]= useState(null);
  const [isLoading,setIsLoading] = useState(true);

  
  useEffect(()=>{
       
    const fetchItems = async ()=>{
      try{
       const response = await fetch(API_URL)
       if(!response.ok) throw Error("Did not Recieve Expected data.");
       const listItems = await response.json();
       setItems(listItems);
       setFetchError(null);
      }catch(err){
      setFetchError(err.message)
      }  finally{
        setIsLoading(false);
      }
    }

  (async ()=> await fetchItems())();  
 setTimeout(()=>{
  (async ()=> await fetchItems())();
 },2000)

  },[])
  

  const addItem = async (item) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const myNewItem = { id, checked: false, item };
    const listItems = [...items, myNewItem]; // spread the existing items array and add the new item
    setItems(listItems);

    const postOption ={
      method :"POST",
      headers:{
        'content-Type': 'application/json'
      },
      body:JSON.stringify(myNewItem)
    }
    const result = await apiRequest(API_URL,postOption);
    if(result) setFetchError(result);
  };

  const handleCheck = async (id) => {
    const listItems = items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
    setItems(listItems);
   

  const myItem = listItems.filter(item=>item.id===id);
  const updateOption ={
    method:"PATCH",
    headers :{
      'Content-type':'application/json'
    },
    body:JSON.stringify({checked :myItem[0].checked})
  }
  const reqUrl= `${API_URL}/${id}`;
  const result = await apiRequest(reqUrl,updateOption);
  if(result) setFetchError(result);

  };
  
  const handleDelete = async(id) => {
    const listItems = items.filter((item) => item.id !== id);
    setItems(listItems);
  

    const deleteOption ={ method:"DELETE"};
    const reqUrl= `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl,deleteOption);
    if(result) setFetchError(result);
    

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem('');
  };

  return (
    <div className="App">
      <Header title="Grocery List" />
     
      <AddItems
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
       < SearchItem
      search={search}
      setSearch={setSearch}
      />
      <main>
        {isLoading&& <p>Loading Items ...</p>}
        {fetchError && <p
          style={{color:"red"}}
        >{`Error:${fetchError}`}</p>}
       {!fetchError &&!isLoading&&<  Content
          items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
          handleCheck={handleCheck}
          handleDelete={handleDelete}
        />} 
      </main>
      <Footer length={items.length} />
    </div>
  );
}

export default App;
