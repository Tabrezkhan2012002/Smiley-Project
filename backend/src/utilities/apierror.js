class apierrror extends Error {
    constructor(message="something went wrong",
        errorstatus,
         stack="",
         error=[]
        
    ) {
        super(message);
        this.message=message
        this.errorstatus=errorstatus
        this.stack=stack
        this.error=error
        this.success=false;
if(stack){
    this.stack=stack;
} else {
    Error.captureStackTrace(this, this.constructor);        
}
    }
};
export default apierrror;