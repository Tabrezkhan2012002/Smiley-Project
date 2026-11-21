class Apiresponse {
    constructor(status, message="Operation completed successfully", data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = true;
    }  } ;
    export default Apiresponse;