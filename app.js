var movies=[{id:'m1',t:'Sample Movie One',l:'Nepali · 2h 05m'},{id:'m2',t:'Sample Movie Two',l:'Hindi · 2h 30m'},{id:'m3',t:'Sample Movie Three',l:'English · 1h 55m'}];
var halls=[{id:'h1',n:'Sample Cinema, Durbar Marg',km:1.2,u:'https://example.com/cinema-1'},{id:'h2',n:'Sample Cinema, Lalitpur',km:3.4,u:'https://example.com/cinema-2'},{id:'h3',n:'Sample Cinema, Kalanki',km:5.1,u:'https://example.com/cinema-3'},{id:'h4',n:'Sample Cinema, Bhaktapur',km:9.0,u:'https://example.com/cinema-4'}];
var times=[['10:30',630],['13:15',795],['16:00',960],['19:00',1140]];
var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
var shows=[];
movies.forEach(function(m){halls.forEach(function(h){times.forEach(function(t,i){
  var f=i==3&&rnd()>.4?'Premium':(rnd()>.6?'3D':'2D');
  var base=f=='Premium'?600:f=='3D'?450:300;base+=Math.round(rnd()*4)*25;
  shows.push({m:m.id,h:h,time:t[0],min:t[1],fmt:f,lo:base,hi:base+Math.round(150+rnd()*150),tot:96,sold:Math.round(10+rnd()*80),open:false,key:m.id+h.id+t[0]});
})})});
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
setInterval(function(){
  var s=shows[Math.floor(Math.random()*shows.length)];
  if(s.tot-s.sold>3)s.sold+=1+Math.floor(Math.random()*3);
  if(Math.random()<.25)s.lo+=Math.random()<.5?-25:25,s.hi=Math.max(s.hi,s.lo+100);
  flash=s.key;last=Date.now();render();setTimeout(function(){flash=null},1300);
},6000);
setInterval(function(){var sec=Math.round((Date.now()-last)/1000);el('stamp').textContent=sec<3?'Updated just now':'Updated '+sec+'s ago'},1000);
renderMovies();render();
