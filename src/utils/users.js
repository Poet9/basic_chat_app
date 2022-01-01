const users = [];

const addUser = ({id, username, room})=>{
   username = username.trim().toLowerCase();
   room = room.trim().toLowerCase();
   //making sure username and room are provided
   if(!username || !room){
      return {
         error: 'username and room are required.'
      }
   }
   //making sure username is unique
   const isTaken = users.find((user)=>{
      return user.username === username && user.room === room;
   });
   if(isTaken){
      return {
         error: 'username is already taken.'
      }
   }
   user = {id, username, room};
   users.push(user);
   return { user };
}
const removeUser = (id)=>{
   const userIndex = users.findIndex((user)=> user.id === id);
   if(userIndex === -1){
      return {
         error: 'user not found.'
      }
   }
   const user = users.splice(userIndex, 1)[0];
   return user;
}
/***********get user by id ***********/
const getUser = (id)=>{
   return users.find((user)=> user.id === id)
}
/*********** user in same room ********/
const getUsersInRoom = (room)=>{
   return users.filter((user)=> user.room === room);
}

module.exports = {
   addUser,
   removeUser,
   getUser,
   getUsersInRoom
}