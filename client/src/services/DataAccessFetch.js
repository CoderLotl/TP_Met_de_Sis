export class DataAccessFetch
{
    async postData(url, payload = null)
    {
        let response = false;
        try
        {
            let fetchParams =
            {
                method: 'POST',
                body: payload !== null ? JSON.stringify(payload) : '',
            };
            
            response = await fetch(url, fetchParams);

            return this.ProcessAnswer(response);
        }
        catch(error)
        {
            return this.CatchError(error, response);
        }
    }

    CatchError(error, response)
    {
        let errorMsg = error.message;
        if(error instanceof TypeError)
        {
            errorMsg = `Network error: ${error.message}`;            
        }
    
        return this.ReturnResponse(response, false, errorMsg)
    }

    async ProcessAnswer(response, errorMessage = '')
    {
        if(!response.ok)
        {
            let errorResponse;
            try
            {
                const json = await response.json();
                if(json?.response)
                {
                    errorResponse = json.response;
                }
            }
            catch(err)
            {
                console.warn('Failed to parse error JSON');
                typeof response?.status !== 'undefined' ? errorResponse = `(${response.status})` : errorResponse = '';
            }

            let errorMsg = errorMessage == '' ? `${errorResponse}` : `${errorMessage} ${errorResponse}`;

            return this.ReturnResponse(response, false, errorMsg);
        }

        return this.ReturnResponse(response, true);
    }

    ReturnResponse(response, success_status, errorMsg = null, errorDetail = null, attach = null)
    {
        let dataAccessResponse = new DataAccessResponse();
        dataAccessResponse.response = response;
        dataAccessResponse.success = success_status;
        dataAccessResponse.status = response?.status;
        dataAccessResponse.errorMsg = errorMsg;
        dataAccessResponse.errorDetail = errorDetail;
        dataAccessResponse.attach = attach;

        return dataAccessResponse;
    }
}

class DataAccessResponse
{
    response;
    success;
    status;
    errorMsg;
    errorDetail;
    attach;
}