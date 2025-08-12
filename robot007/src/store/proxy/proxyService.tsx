import authAxios from "../../modules/shared/axios";

export const saveProxy = async (data) => {

    try {
        const response = await authAxios.post(
            "/phone/proxy/save",
            data
        );
        return response.data;
    } catch (error) {
        console.log("Error generating phone numbers", error);
        throw error;
    }
};

export const testProxies = async (data) => {

    try {
        const response = await authAxios.post(
            "/phone/proxy/test",
            data
        );
        return response.data;
    } catch (error) {
        console.log("Error generating phone numbers", error);
        throw error;
    }
};


export const DeleteProxy = async (data) => {
    
    try {
        const response = await authAxios.post(
            "/phone/proxy/delete",
            data
        );
        return response.data;
    } catch (error) {
        console.log("Error generating phone numbers", error);
        throw error;
    }
};