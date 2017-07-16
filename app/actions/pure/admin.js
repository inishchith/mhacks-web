import { reduxActions } from '../../constants';

export default class AdminPureActions {
    static loadApplicationsRequest(data) {
        return {
            type: reduxActions.LOAD_APPLICATIONS_REQUEST,
            data
        };
    }

    static loadApplicationsError(data, error, message) {
        return {
            type: reduxActions.LOAD_APPLICATIONS_ERROR,
            data,
            error,
            message
        };
    }

    static loadApplicationsSuccess(data, message) {
        return {
            type: reduxActions.LOAD_APPLICATIONS_SUCCESS,
            data,
            message
        };
    }
}
