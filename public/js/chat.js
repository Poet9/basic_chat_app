const DOMStrings = {
   $messages: document.querySelector('#messages'),
   $location: document.querySelector('#location'),
   $sidebar: document.querySelector('#chat-clients'),
   $sidebarContainer: document.querySelector('#sidebar-container').innerHTML
}
const autoscroll = ()=>{
   const $newMessage = DOMStrings.$messages.lastElementChild;
   const newMsgStyles = getComputedStyle($newMessage);
   const newMsgMargin = parseInt(newMsgStyles.marginBottom);
   const newMsgHeight = $newMessage.offsetHeight + newMsgMargin;
   //visible height
   const visibleHeight = DOMStrings.$messages.offsetHeight;
   console.log(visibleHeight, newMsgHeight);
   //height of messages container
   const containerHeight = DOMStrings.$messages.scrollHeight;
   
   //how far have I scrolled
   const scrollOffset = DOMStrings.$messages.scrollTop + visibleHeight;
   
   if (containerHeight - newMsgHeight <= scrollOffset ){
      DOMStrings.$messages.scrollTop = DOMStrings.$messages.scrollHeight;
   }

} 
const main = function () {
   const socket = io();
   /************** handling query string *************/
   const query= Qs.parse(location.search, {ignoreQueryPrefix: true});
   /**************** listening to message ******************/
   document.querySelector("form").addEventListener('submit',(e)=>{
     e.preventDefault(); // prevents page reloading
     // emitting message to server
     socket.emit('chat message', document.querySelector("input").value);
     document.querySelector('input').value = '';
     return false;
   });
   // function to handle message display for others
   socket.on('chat message', function(msg){
      DOMStrings.$messages.insertAdjacentHTML('beforeend', `
      <li id="msg">${msg.text}
      <p class="timeManager">
      <span class="usename-message"> ${msg.username}</span> 
      <span class="time-message">${moment(msg.createdAt).format('hh:mm a')}</span>
      </p>
      </li>`);
      autoscroll();
    });
    // function to handle message display for user
    socket.on('my message', function(msg){
      DOMStrings.$messages.insertAdjacentHTML('beforeend', `<li id="myMsg">${msg.text}<p class="timeManager">${moment(msg.createdAt).format('hh:mm a')}</p></li>`);
      autoscroll();
    });
    // function to handle notification display for others
    socket.on('notification', (notif)=>{
      DOMStrings.$messages.insertAdjacentHTML('beforeend', `
         <p>${notif.text}
            <p class="timeNotif">${moment(notif.createdAt).format('hh:mm a')}
            </p>
         </p>`);
      autoscroll();
   });
    /*************listening to location sharing ***********/
   DOMStrings.$location.addEventListener('click',()=>{
      //disabling spam click
      DOMStrings.$location.setAttribute('disabled', 'disabled');
      //browser support
      if(!navigator.geolocation){
         return alert('Not supported');
      }
      navigator.geolocation.getCurrentPosition(function (position) {
         //emitting location to server
         socket.emit('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
         });
         //function to handle display for all users
         socket.on('shared location', (link)=>{
            DOMStrings.$messages.insertAdjacentHTML('beforeend', `
               <a href="${link.text}" target="_blank">
                  ${link.username} dropped location pin
               </a>
               <p class="timeNotif">${moment(link.createdAt).format('hh:mm a')}
               </p>`
            );
            autoscroll();
         });
         //reenabling the button
         DOMStrings.$location.removeAttribute('disabled');
      });
   });
   socket.emit('join query', query,function (error) {
      if(error){
         alert(error);
         location.href = '/';
      }
   });
   socket.on('roomData', ({room, users})=>{
      const html = Mustache.render(DOMStrings.$sidebarContainer, {
         room,
         users
      });
      DOMStrings.$sidebar.innerHTML = html;     
   });
}();

