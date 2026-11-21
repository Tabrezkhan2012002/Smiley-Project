import bcrypt from 'bcrypt';
const hashpassword=async(password)=>{
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
};
export default hashpassword; 