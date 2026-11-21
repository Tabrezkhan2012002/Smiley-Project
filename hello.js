// function tabrezkhan(name,age,callback){
//     console.log(name,age);
//     callback();
// }
// function khan(){
//     console.log('hello i am tabrezkhan this is the my callback function')
// }
// tabrezkhan("Tabrez khan",21,khan)

// example of callback hell
// function profile(callback){
//     setTimeout(() => {
//         console.log("This is the user profile")
//          callback();
//     }, 1000);
 
// }
// function post(callback){
//     setTimeout(() => {
//         console.log("This is the user post")
//          callback();
//     }, 1000);
   
// }
// function comment(callback){
//     setTimeout(() => {
//         console.log("This is the user comment")
//          callback();
//     }, 1000);}
    

// profile(() => {
//     post(() => {
//         comment(() => {
//             console.log("All done!");
//         });
//     });
// });

//solving callback hell by using promises 
//  function Tabrezkhan(){
//     return new Promise((resolve,reject)=>{
//         let success=true
//         if(success){
//             setTimeout(() => {
//                 resolve("hey i am solve")
//             }, 1000);
//         }
//         else{
//             reject("something error in that")
//         }
//     })
//  }
//  function khan(){
//     return new Promise((resolve,reject)=>{
//         setTimeout(() => {
//             resolve("hello i am first khan");
//         }, 1000);
//     })
//  }
//   function khanbhai1(){
//     return new Promise((resolve,reject)=>{
//         setTimeout(() => {
//             resolve("hello i am second khan");
//         }, 1000);
//     })
//  }
//   function khan2(){
//     return new Promise((resolve,reject)=>{
//         setTimeout(() => {
//             resolve("helli i am third khan");
//         }, 1000);
//     })
//  }
// Tabrezkhan()
//   .then((message) => {
//     console.log(message);  // Tabrezkhan ka message
//     return khan();
//   })
//   .then((message)=>{
//     console.log(message)
//   })
//   .then(() => khanbhai1())
//   .then((message) => {
//     console.log(message);  // khanbhai1 ka message
//     return khan2();
//   })
//   .then((message) => {
//     console.log(message);  // khan2 ka message
//   })
//   .catch((err) => console.error(err));
// console.log(Math.floor( 1000+ Math.random() * 10000));