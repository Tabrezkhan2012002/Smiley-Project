import express from 'express';
const middleware = () => {
    return (req, res, next) => {
      
        console.log('Middleware executed');
       res.send("hello from middleware");
        next();
    };
}; 
export default middleware; 