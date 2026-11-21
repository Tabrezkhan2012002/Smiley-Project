import jwt from "jsonwebtoken";

const generatetoken=(hello)=>{
    const playload={
        id:hello._id,
        email:hello.email}

    const token = jwt.sign(playload, process.env.JWT_SECRET, { expiresIn: "10 minutes" });
    let refreshtoken=jwt.sign(playload, process.env.JWT_SECRET, { expiresIn: "7d" });

    return { token, refreshtoken };   
};
export default generatetoken;
