import bcrypt from 'bcryptjs';
const verifyHash = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error occurred while verifying hash:', error);
        throw error;
    }
};
export default verifyHash;