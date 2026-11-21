var movies=[{id:'m1',t:'Sample Movie One',l:'Nepali · 2h 05m'},{id:'m2',t:'Sample Movie Two',l:'Hindi · 2h 30m'},{id:'m3',t:'Sample Movie Three',l:'English · 1h 55m'}];
var API='https://cinema-backend-75q3.onrender.com'; // change to your online backend address later
var shows=[];
var cur='m1',el=function(i){return document.getElementById(i)},flash=null;
function renderMovies(){el('movies').innerHTML=movies.map(function(m){return '<button class="movie" data-m="'+m.id+'" aria-pressed="'+(m.id==cur)+'">'+m.t+'<small>'+m.l+'</small></button>'}).join('')}
function seatGrid(s){var r=mulberry(s.key),out='';var sold=s.sold,idx=[];for(var i=0;i<96;i++)idx.push(i);
  idx.sort(function(a,b){return r()-.5});var set={};idx.slice(0,sold).forEach(function(i){set[i]=1});
  for(i=0;i<96;i++)out+='<span class="s'+(set[i]?' x':'')+'"></span>';
  return '<div class="seats"><div class="screen"></div><div class="grid">'+out+'</div><div class="note">Green = free, grey = taken. Final seat choice happens on the cinema’s site.</div></div>'}
function mulberry(k){var a=0;for(var i=0;i<k.length;i++)a=(a*31+k.charCodeAt(i))|0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function render(){
  var f=el('fmt').value,so=el('sort').value;
  var arr=shows.filter(function(s){return s.m==cur&&(f=='all'||s.fmt==f)});
  arr.sort(function(a,b){return so=='price'?a.lo-b.lo:so=='km'?a.h.km-b.h.km:a.min-b.min});
  if(!arr.length){el('list').innerHTML='<div class="empty">No showtimes match. Try another format.</div>';return}
  var best=Math.min.apply(null,arr.map(function(s){return s.lo}));
  el('list').innerHTML=arr.map(function(s){
    var left=s.tot-s.sold,pct=Math.round(left/s.tot*100),low=left<15;
    return '<div class="show'+(flash==s.key?' flash':'')+'"><div class="time">'+s.time+'</div>'+
    '<div><div class="hall">'+s.h.n+'<span class="chip">'+s.fmt+'</span></div><div class="meta">'+s.h.km.toFixed(1)+' km away</div></div>'+
    '<div class="price'+(s.lo==best?' best':'')+'">Rs '+s.lo+'–'+s.hi+'<small>'+(s.lo==best?'Lowest price':'by seat class')+'</small></div>'+
    '<div class="avail"><div class="meter" aria-hidden="true"><i class="'+(low?'low':'')+'" style="width:'+pct+'%"></i></div><span class="meta">'+(left?left+' seats left':'Sold out')+'</span>'+
    '<button class="btn g" data-seats="'+s.key+'" aria-expanded="'+s.open+'">'+(s.open?'Hide seats':'View seats')+'</button>'+
    '<button class="btn p" data-book="'+s.key+'"'+(left?'':' disabled')+'>Book on cinema site</button></div>'+
    (s.open?seatGrid(s):'')+'</div>'}).join('');
}
function find(k){return shows.filter(function(s){return s.key==k})[0]}
document.addEventListener('click',function(e){
  var t=e.target.closest('button');if(!t)return;
  if(t.dataset.m){cur=t.dataset.m;renderMovies();render()}
  else if(t.dataset.seats){var s=find(t.dataset.seats);s.open=!s.open;render()}
  else if(t.dataset.book){var s=find(t.dataset.book);el('dtext').textContent=s.h.n+', '+s.time+' ('+s.fmt+'), Rs '+s.lo+'–'+s.hi+'. Seats shown here may change before you arrive.';el('go').href=s.h.u;el('dlg').showModal()}
  else if(t.id=='cancel')el('dlg').close();
});
el('go').addEventListener('click',function(){el('dlg').close()});
el('fmt').onchange=el('sort').onchange=render;
var last=Date.now();
fetch(API+'/api/shows').then(function(r){return r.json()}).then(function(data){
  shows=data.map(function(s){s.open=false;return s});last=Date.now();render();
}).catch(function(){el('list').innerHTML='<div class="empty">Cannot reach the server. Is it running?</div>'});
var live=new EventSource(API+'/api/live');
live.onmessage=function(ev){
  var u=JSON.parse(ev.data),s=find(u.key);if(!s)return;
  s.sold=u.sold;s.lo=u.lo;s.hi=u.hi;flash=s.key;last=Date.now();render();
  setTimeout(function(){flash=null},1300);
};
setInterval(function(){var sec=Math.round((Date.now()-last)/1000);el('stamp').textContent=sec<3?'Updated just now':'Updated '+sec+'s ago'},1000);
renderMovies();render();