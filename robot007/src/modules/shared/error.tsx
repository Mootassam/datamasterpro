import Toast from "../../shared/Message/Toast";

function selectMessage(error) {

    if (error && error.response && error.response.data) {
        const data = error.response.data;
        return String(data)
    }

}

function selectErrorCode(error) {
    if (error && error.response && error.response.status) {
        return error.response.status;
    }

}

class Errors {

    static handle(error) {

        if ([400, 429].includes(this.ErrorCode(error))) {
            Toast.Error(selectMessage(error));
            return
        }


        if ([500].includes(this.ErrorCode(error))) {
            Toast.Error(selectMessage(error));
            return
        }

    }


    static ErrorCode(error) {
        return selectErrorCode(error)
    }
    static MessageCode(error) {
        return selectMessage(error)
    }








}

export default Errors