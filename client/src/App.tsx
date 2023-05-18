import React, { useEffect, useState } from 'react';
import { Post } from "./Components/Post";
import { LoginForm } from "./Components/LoginForm";
import { IPost, IUserInfo } from "./models";
import axios from "axios";

function App() {
    const [auth, setAuth] = useState(false);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [value, setValue] = useState('');
    const [myId, setMyId] = useState<number>(-1);
    const [drag, setDrag] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [pages, setPages] = useState(0);
    const [currentPageValue, setCurrentPageValue] = useState('1');
    let date = new Date();
    let currentPage = parseInt(currentPageValue);

    function deletePost(id: number) {
        let tsk = posts;
        let index: number = -1;
        for (let i = 0; i < tsk.length; i++) if (tsk[i].id === id) {
            index = i;
            break;
        }
        return index;
    }

    async function fetchPosts() {
        postsCount();
        setLoading(true);
        const response = await axios.get<IPost[]>('http://localhost:5000/api/post/'+currentPage,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setPosts(response.data);
        setLoading(false);
        setCurrentPageValue(currentPage+'');
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
    }

    const deleteHandler = (id: number) => {
        let index = deletePost(id);
        setPosts([...posts.slice(0, index), ...posts.slice(index + 1)])
    }
    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        if (value.trim().length !== 0) {
            let formData = new FormData();
            formData.append('text', value);
            formData.append('date', `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`);
            files.forEach(file => formData.append('file', file));
            const response = await axios.post('http://localhost:5000/api/post', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            if (response.status === 200) setPosts(prev => [response.data, ...prev]);
            setValue('');
            setFiles([]);
            setCreating(false);
        }
    }
    const editHandler = async (post: IPost) => {
        let index = -1;
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].id === post.id) index = i;
        }
        setPosts([...posts.slice(0, index), post, ...posts.slice(index + 1)]);
    }
    const loginHandler = (userInfo: IUserInfo) => {
        setAuth(true);
        currentPage=1;
        const token = userInfo.token;
        localStorage.setItem('token', token);
        setMyId(userInfo.user.id);
        fetchPosts();
    }

    const authHandler = async (token: string) => {
        const response = await axios.get<IUserInfo>('http://localhost:5000/api/auth',
            { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            setAuth(true);
            setMyId(response.data.user.id);
            fetchPosts();
        }
    }

    function logout() {
        localStorage.removeItem('token');
        setAuth(false);
        setPosts([]);
        setMyId(-1);
    }

    function dragStartHandler(event: React.FormEvent) {
        event.preventDefault();
        setDrag(true);
    }
    function dragLeaveHandler(event: React.FormEvent) {
        event.preventDefault();
        setDrag(false);
    }
    function onDropHandler(event: React.DragEvent) {
        event.preventDefault();
        if (files == null || files.length == 0) {
            setFiles(Array.from(event.dataTransfer.files));
        }
        else setFiles(prev => [...prev,...Array.from(event.dataTransfer.files)]);
        setDrag(false);
    }
    function handlerChange(event:any){
        event.preventDefault();
        if (files == null || files.length == 0) {
            setFiles(Array.from(event.target.files));
        }
        else setFiles(prev => [...prev,...event.target.files]);
    }
    function deleteMediaHandler(index:number){
        setFiles([...files.slice(0,index),...files.slice(index+1)]);
    }
    async function postsCount(){
        const response = await axios.get('http://localhost:5000/api/postcount');
        setPages(Math.ceil(response.data/20));
    }
    const pageHandler =async (e:React.FormEvent) => {
        e.preventDefault();
        if(parseInt(currentPageValue)<=pages){
            currentPage=parseInt(currentPageValue);
            fetchPosts();
        }
        else setCurrentPageValue(currentPage+'');
    }
    function nextPageHandler(){
        if(currentPage<pages){
            currentPage++;
            fetchPosts();
        }
    }
    function prevPageHandler(){
        if(currentPage>1){
            currentPage--;
            fetchPosts();
        }
    }

    useEffect(() => {
        postsCount();
        const token = localStorage.token;
        if (token !== undefined) authHandler(token);
    }, [])
    return (
        <div className="static">
            <div className="container mx-auto max-w-2xl pt-5">
                <h1 className="text-center text-2xl font-bold mb-5">_BLOG</h1>
                {auth && !creating && <button
                    className="rounded border-2 border-slate-100 py-1 px-3 mx-auto my-1"
                    onClick={() => { setCreating(prev => !prev) }}
                >
                    create new post
                </button>}
                {auth && creating && <div
                    className="border py-2 px4 rounded flex justify-start mb-2"
                >

                    <form onSubmit={submitHandler} className="flex-col w-full">
                        <div className="flex mx-1">
                            <textarea
                                className="border py-1 px-4 w-full outline-0"
                                placeholder="Enter post..."
                                value={value}
                                wrap="soft"
                                onChange={event => setValue(event.target.value)}
                                rows={3}
                            />
                        </div>
                        {
                            files.map((file,index) => {
                                return(
                                    <div className='flex' key={index}>
                                        <b className='grow text-xs'>{file.name}</b>
                                        
                                        <button key={index} className='mx-1 border px-1' onClick={() => deleteMediaHandler(index)}>x</button>
                                    </div>
                                )
                            })
                        }
                        <div className='flex'>
                            {drag ? <div
                                className='m-1 text-center border-2 border-dashed p-4 grow'
                                onDragStart={e => dragStartHandler(e)}
                                onDragLeave={e => dragLeaveHandler(e)}
                                onDragOver={e => dragStartHandler(e)}
                                onDrop={e => onDropHandler(e)}
                            >
                                Drop image to upload
                            </div> :
                                <div
                                    className='m-1 text-center border-2 border-dashed p-4 grow'
                                    onDragStart={e => dragStartHandler(e)}
                                    onDragLeave={e => dragLeaveHandler(e)}
                                    onDragOver={e => dragStartHandler(e)}
                                >
                                    Drag images here to upload
                                </div>
                            }
                            <label className='border rounded h-auto my-1 py-4' htmlFor='inputfile'>Browse...</label>
                            <input 
                                type='file' 
                                className='-z-1 absolute opacity-0' 
                                id='inputfile' 
                                onChange={handlerChange} 
                                multiple
                                accept='image/*,.mp4'
                            ></input>
                        </div>
                        <div className="flex mt-1">
                            <button
                                className="py-1 px-1 mr-1 ml-auto rounded border-2 border-slate-100"
                                type="submit"
                            >
                                save
                            </button>
                            <button
                                className="py-1 px-1 mr-2 rounded bg-red-300"
                                onClick={() => { setCreating(false) }}
                            >
                                cancel
                            </button>
                        </div>
                    </form>
                </div>}
                {loading && <p>Loading...</p>}
                {!auth && <LoginForm onLogin={loginHandler} />}
                {auth && posts.map(posts => {
                    return <Post post={posts} ismine={posts.user_id == myId} onDelete={deleteHandler} onEdit={editHandler} key={posts.id} />
                })}
                {auth && <div className='flex my-2'>
                    <div className='flex mx-auto'>
                    {currentPage>1 && <button className='border rounded px-1' onClick={prevPageHandler} >{'<'}</button>}
                    <p className='mx-2'>Page {currentPageValue} of {pages}</p>
                    {currentPage<pages && <button className='border rounded px-1' onClick={nextPageHandler} >{'>'}</button>}
                    </div>
                </div>}
            </div>
            {auth && <button
                className="absolute right-2 top-2 border rounded px-1"
                onClick={logout}
            >exit</button>}
        </div>
    );
}

export default App;
