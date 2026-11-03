'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null
export default function Home(){
  const [songs, setSongs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)
  useEffect(()=>{ if(supabase) listSongs() },[])
  async function listSongs(){
    const { data } = await supabase.storage.from('music').list('', { limit: 100, sortBy:{column:'created_at', order:'desc'} })
    if(data){
      const withUrls = data.filter(f=>f.name!='.emptyFolderPlaceholder').map(f=>{
        const { data: urlData } = supabase.storage.from('music').getPublicUrl(f.name)
        return { name: f.name, url: urlData.publicUrl, id: f.name }
      })
      setSongs(withUrls)
    }
  }
  async function handleUpload(e){
    const file = e.target.files[0]
    if(!file || !supabase) return
    setUploading(true)
    const fileName = Date.now()+'-'+file.name
    await supabase.storage.from('music').upload(fileName, file)
    await listSongs()
    setUploading(false)
  }
  function playSong(s){
    setPlaying(s)
    setTimeout(()=>{ audioRef.current?.play() }, 100)
  }
  return (
    <div style={{maxWidth:480, margin:'0 auto', padding:20}}>
      <h1 style={{fontSize:32, fontWeight:900}}>BÓVEDA 777</h1>
      <p style={{opacity:0.6}}>Tu música en la nube - BOX MU</p>
      <label style={{display:'block', background:'white', color:'black', padding:18, borderRadius:16, textAlign:'center', fontWeight:700, margin:'25px 0', cursor:'pointer'}}>
        {uploading ? 'SUBIENDO...' : '+ SUBIR MÚSICA MP3'}
        <input type="file" accept="audio/*" onChange={handleUpload} style={{display:'none'}} />
      </label>
      {songs.map(s=>(
        <div key={s.id} onClick={()=>playSong(s)} style={{background:'#1a1a1a', padding:14, borderRadius:14, marginBottom:12}}>
          🎵 {s.name.replace(/^[0-9]+-/, '')}
        </div>
      ))}
      {songs.length===0 && <p style={{opacity:0.5}}>Todavía no hay música. Subí una!</p>}
      {playing && <div style={{height:80}}></div>}
      {playing && <audio ref={audioRef} src={playing.url} controls style={{width:'100%', position:'fixed', bottom:0, left:0, background:'#000', padding:10}} />}
    </div>
  )
}
