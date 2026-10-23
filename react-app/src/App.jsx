import { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import './style.css';

const CameraIcon = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="4"/></svg>;

export default function App() {
  const [photo, setPhoto] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: 'info', text: 'Sua próxima lembrança está esperando.' });
  const input = useRef(null);
  const native = Capacitor.isNativePlatform();

  async function choosePhoto() {
    if (busy) return;
    if (!native) { input.current?.click(); return; }
    setBusy(true);
    setStatus({ type: 'info', text: 'Abrindo as opções de imagem…' });
    try {
      const result = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });
      if (!result?.webPath) {
        setStatus({ type: 'info', text: 'Nenhuma imagem retornada. Você pode tentar novamente.' });
        return;
      }
      setPhoto(result.webPath);
      setStatus({ type: 'success', text: 'Sua imagem foi carregada com sucesso!' });
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      const cancelled = /cancel|canceled|cancelled|user denied/.test(msg);
      setStatus({ type: cancelled ? 'info' : 'error', text: cancelled ? 'Operação cancelada. Você pode tentar novamente.' : 'Não foi possível abrir a câmera ou galeria. Verifique as permissões e tente novamente.' });
      if (!cancelled) console.error(error);
    } finally { setBusy(false); }
  }

  function onFile(event) {
    const file = event.target.files?.[0];
    if (!file) { setStatus({ type: 'info', text: 'Operação cancelada. Você pode tentar novamente.' }); return; }
    if (!file.type.startsWith('image/')) { setStatus({ type: 'error', text: 'Escolha um arquivo de imagem válido.' }); return; }
    const url = URL.createObjectURL(file);
    setPhoto(old => { if (old.startsWith('blob:')) URL.revokeObjectURL(old); return url; });
    setStatus({ type: 'success', text: 'Sua imagem foi carregada com sucesso!' });
    event.target.value = '';
  }
  function clearPhoto() {
    setPhoto(old => { if (old.startsWith('blob:')) URL.revokeObjectURL(old); return ''; });
    setStatus({ type: 'info', text: 'Prontinho! Você pode escolher uma nova lembrança.' });
  }

  return <main className="shell">
    <nav><div className="brand"><span className="logo"><CameraIcon/></span>Jardim de Memórias</div><span className="nav-note">✿ um lugar para guardar momentos</span></nav>
    <section className="hero"><div><div className="eyebrow"><i/> DIÁRIO VISUAL · EDIÇÃO BOTÂNICA</div><h1>Pequenos instantes,<br/><em>grandes lembranças.</em></h1><p className="intro">Uma câmera para guardar o que faz o dia florescer. Tire uma foto ou escolha uma imagem da sua galeria e veja sua lembrança ganhar vida aqui.</p><div className="tags"><span>✿ Simples e delicado</span><span>⌁ Suas fotos ficam com você</span></div></div>
    <div className="art"><div className="sun"/><div className="leaf"/><div className="leaf leaf2"/><div className="camera-art"><div className="lens"/><span>MEMORIES</span></div><b>✳</b><strong>✦</strong></div></section>
    <section className="panel"><div className="panel-head"><div><p className="kicker">SEU CANTINHO ESPECIAL</p><h2>Uma nova lembrança</h2></div><span className="privacy">● Só neste dispositivo</span></div>
    <div className={'stage '+(photo?'has-photo':'')}>{photo?<img className="preview" src={photo} alt="Sua lembrança selecionada" onError={()=>{setPhoto('');setStatus({type:'error',text:'Não foi possível abrir essa imagem. Escolha outra.'})}}/>:<div className="empty"><div className="empty-icon">▧</div><h3>Ainda não há nenhuma foto</h3><p>Quando você escolher uma imagem, ela aparecerá aqui. Pronta para virar parte da sua coleção de memórias.</p></div>}{busy&&<div className="overlay"><span className="spinner"/><b>Abrindo…</b></div>}</div>
    <div className="actions"><button className="btn primary" onClick={choosePhoto} disabled={busy}><CameraIcon/>{busy?'Aguarde…':photo?'Escolher outra imagem':'Tirar foto / escolher da galeria'}</button>{photo&&<button className="btn secondary" onClick={clearPhoto} disabled={busy}>↺ Limpar lembrança</button>}<input ref={input} className="hidden" type="file" accept="image/*" capture="environment" onChange={onFile}/></div>
    <p className={'status '+status.type}><span>{status.type==='success'?'✓':status.type==='error'?'!':'i'}</span>{status.text}</p></section>
    <footer><b>JARDIM DE MEMÓRIAS　✿</b><span>Feito para guardar momentos com carinho.</span></footer>
  </main>;
}