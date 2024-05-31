import {AxiosError} from 'axios'

function handleError(error: Error) {
    if (error instanceof AxiosError) {
        if (error.response?.data.detail[0].msg) {
            return error.response?.data.detail[0].msg
        } else {
            return error.response?.data.detail
        }
    } else {
        return 'Unknown error'
    }
}

export default handleError
