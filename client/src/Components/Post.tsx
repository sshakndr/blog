import { IPost } from "../models";
import React, { useState } from "react";
import axios from "axios";

interface PostProps {
    post: IPost
    ismine: boolean
    onDelete: (id: number) => void
    onEdit: (post: IPost) => void
}

export function Post({ post, ismine, onDelete, onEdit }: PostProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');
    const [currentMedia,setCurrentMedia] = useState(0);
    const [changedMedia,setChangedMedia] = useState(post.content);

    function nextMedia(){
        if(currentMedia<post.content.length-1) setCurrentMedia(currentMedia+1);
    }
    function prevMedia(){
        if(currentMedia>0) setCurrentMedia(currentMedia-1);
    }

    async function deletePost() {
        const response = await axios.delete(`http://localhost:5000/api/post/${post.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (response.status === 200) onDelete(post.id);
    }
    async function editPost(event: React.FormEvent) {
        event.preventDefault();
        if (value.trim().length !== 0) {
            const response = await axios.put(`http://localhost:5000/api/post`, { text: value, id: post.id , content: changedMedia}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            if (response.status === 200) {
                setEditing(false);
                setValue('');
                onEdit(response.data);
                post.content = changedMedia;
            }
        }
    }
    function deleteMediaHandler(index:number){
        setChangedMedia([...changedMedia.slice(0,index),...changedMedia.slice(index+1)]);
    }
    let text = post.text.split('\n');
    return (
        <div
            className="border py-2 px4 rounded flex-col mb-2"
        >
            <div className="flex ml-5 mr-2">
                <b className="mr-auto">{post.username}</b>
                <p>{post.date}</p>
            </div>
            {!editing && <div className="flex-col mx-5">
                {
                    text.map((text,index) => {
                        return <p key={index}>{text}</p>
                    })
                }
                {post.content[0] &&
                    <div className="container flex-col mr-5 mt-2">
                        {post.content[currentMedia].split('.')[post.content[currentMedia].split('.').length-1] === 'mp4'?
                            <video controls className="h-96 mx-auto object-cover" src={"http://localhost:5000/api/image/"+post.content[currentMedia]}></video>
                            :
                            <img className="h-96 mx-auto object-cover" src={"http://localhost:5000/api/image/"+post.content[currentMedia]}></img>
                        }
                        {post.content.length>1 && <div className="flex m-1">
                            <button onClick={prevMedia} className="grow border rounded mr-1">{currentMedia==0?'':'<'}</button>
                            <button onClick={nextMedia} className="grow border rounded">{currentMedia==post.content.length-1?'':'>'}</button>
                        </div>}
                    </div>
                }
            </div>
            }
            {editing &&
                <form onSubmit={editPost} className="flex-col w-full">
                    <div className="flex mx-1">
                        <textarea
                            className="border py-1 px-4 w-full outline-0"
                            placeholder="Enter post..."
                            value={value}
                            wrap="soft"
                            onChange={event => setValue(event.target.value)}
                            rows={text.length + 3}
                        />
                    </div>
                    {
                            changedMedia.map((file,index) => {
                                return(
                                    <div className='flex' key={index}>
                                        <b className='grow text-xs'>{file}</b>
                                        
                                        <button type="button" key={index} className='mx-1 border px-1' onClick={() => deleteMediaHandler(index)}>x</button>
                                    </div>
                                )
                            })
                        }
                    <div className="flex mt-1">
                        <button
                            className="py-1 px-1 mr-1 ml-auto rounded border-2 border-slate-100"
                            type="submit"
                        >
                            save
                        </button>
                        <button
                            className="py-1 px-1 mr-2 rounded bg-red-300"
                            onClick={() => { setEditing(false) ; setChangedMedia(post.content)}}
                        >
                            cancel
                        </button>
                    </div>
                </form>
            }
            {ismine && <div className="container flex ml-auto mt-1">
                {!editing && <button
                    className="py-1 px-1 ml-auto mr-1 rounded border-2 border-slate-100"
                    onClick={() => { setEditing(true); setValue(post.text) }}
                >
                    edit
                </button>}
                {!editing && <button
                    className="py-1 px-1 mr-2 rounded bg-red-300"
                    onClick={deletePost}
                >
                    delete
                </button>}
            </div>}
        </div>
    )
}