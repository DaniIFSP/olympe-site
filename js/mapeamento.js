(() => {
 const form=document.getElementById('form-denuncia'); if(!form)return;
 if(!estaLogado() || admin()){ window.location.href='login.html'; return; }
 const lat=document.getElementById('latitude'), lon=document.getElementById('longitude'), msg=document.getElementById('mensagem-denuncia'), btn=document.getElementById('btn-enviar-denuncia');
 document.getElementById('descricao').addEventListener('input',e=>document.getElementById('contador-descricao').textContent=`${e.target.value.length}/300`);
 document.getElementById('btn-localizacao').addEventListener('click',()=>{
   if(!navigator.geolocation){msg.textContent='Seu navegador não oferece geolocalização.';return;}
   msg.textContent='Obtendo localização…';
   navigator.geolocation.getCurrentPosition(p=>{lat.value=p.coords.latitude.toFixed(8);lon.value=p.coords.longitude.toFixed(8);msg.textContent='Localização preenchida. Confira os dados antes de enviar.';},e=>{msg.textContent='Não foi possível obter localização. Você pode preencher as coordenadas manualmente.';},{enableHighAccuracy:true,timeout:12000});
 });
 form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Enviando…';btn.disabled=true;
  try{const res=await apiAutenticada('/denuncias',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({latitude:Number(lat.value),longitude:Number(lon.value),tipo:document.getElementById('tipo').value,descricao:document.getElementById('descricao').value.trim()||null})});const data=await res.json();if(!res.ok)throw new Error(data.mensagem||data.message||'Não foi possível enviar.');form.reset();document.getElementById('contador-descricao').textContent='0/300';msg.textContent=`Denúncia registrada! Protocolo #${data.protocolo||'confirmado'}.`;}
  catch(err){msg.textContent=err.message||'Falha ao enviar. Tente novamente.';}finally{btn.disabled=false;}
 });
})();
