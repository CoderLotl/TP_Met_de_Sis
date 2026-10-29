import { get } from 'svelte/store';
import { BASE_PATH, ERROR_INFO } from "../stores/stores.js";
import { navigate } from 'svelte-routing';

/** 
 * All 4 main methods (GET, POST, PUT, DELETE) return this same structure:
 *  {
 *      response: response,
        success: success_status,
        status: response.status,
        errorMsg: errorMsg,
        errorDetail: errorDetail,
        attach: attach
    }
 */
export class DataAccessFetch
{
    useXSFRToken = true;

    getCookie(name)
    {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    setHeaders(headers = null)
    {
        let defaultHeaders =
        {
            'Content-Type': 'application/json'
        };        

        if(this.useXSFRToken)
        {
            const xsrfToken = this.getCookie('XSRF-TOKEN');
            if(xsrfToken)
            {
                defaultHeaders['X-XSRF-TOKEN'] = xsrfToken;
            }
        }
        
        return headers ? { ...defaultHeaders, ...headers } : defaultHeaders;
    }

    // GET
    async getData(url, params = null, includeCredentials = true, errorMsg = 'Request failed:')
    {
        let requestUrl = this.GenerateURL(params, url);
        
        let response;

        try
        {
            let fetchParams =
            {
                method: 'GET',
                headers: this.setHeaders()
            };

            if(includeCredentials)
            {
                fetchParams.credentials = 'include';
            }

            response = await fetch(requestUrl, fetchParams);

            return this.ProcessAnswer(response, errorMsg);
        }
        catch(error)
        {
            return this.CatchError(error, response);
        }
    }
    
    // POST
    async postData(url, payload = null, includeCredentials = true, formData = false, errorMsg = 'Request failed:')
    {        
        let response;
        try
        {
            let fetchParams =
            {
                method: 'POST',
            };

            if(formData)
            {
                fetchParams.body = payload;
            }
            else
            {
                fetchParams.headers = this.setHeaders();
                fetchParams.body = payload !== null ? JSON.stringify(payload) : '';
            }

            if(includeCredentials)
            {
                fetchParams.credentials = 'include';
            }
    
            response = await fetch(url, fetchParams);          
    
            return this.ProcessAnswer(response, errorMsg);
        }
        catch(error)
        {            
            return this.CatchError(error, response);
        }
    }

    // PUT
    async putData(url, payload, includeCredentials = true, errorMsg = 'Request failed:')
    {
        let response;
        try
        {
            let fetchParams = 
            {
                method: 'PUT',
                headers: this.setHeaders(),
                body: JSON.stringify(payload)
            }

            if(includeCredentials)
            {
                fetchParams.credentials = 'include';
            }

            response = await fetch(url, fetchParams);
            return this.ProcessAnswer(response, errorMsg);        
        }
        catch (error)
        {
            return this.CatchError(error, response);
        }
    }
    
    // PATCH
    async patchData(url, payload, includeCredentials = true, errorMsg = 'Request failed:')
    {
        let response;
        try
        {
            let fetchParams =
            {
                method: 'PATCH',
                headers: this.setHeaders(),
                body: JSON.stringify(payload)
            }

            if(includeCredentials)
            {
                fetchParams.credentials = 'include';
            }

            response = await fetch(url, fetchParams);
            return this.ProcessAnswer(response, errorMsg);
        }
        catch (error)
        {
            return this.CatchError(error, response);
        }
    }

    // DELETE
    async deleteData(url, params = null, includeCredentials = true, errorMsg = 'Request failed:')
    {
        let response;
        const requestUrl = this.GenerateURL(params, url);
        try
        {
            let fetchParams = 
            {
                method: 'DELETE',
                headers: this.setHeaders()
            }

            if(includeCredentials)
            {
                fetchParams.credentials = 'include';
            }

            response = await fetch(requestUrl, fetchParams);

            return this.ProcessAnswer(response, errorMsg);
        }
        catch (error)
        {
            return this.CatchError(error, response);
        }
    }

    // - - - PRIVATE - - -
    GenerateURL(params, url)
    {
        let requestUrl = url;
        if(params)
        {
            const queryString = new URLSearchParams(params).toString();
            if(queryString)
            {                
                const separator = url.includes('?') ? '&' : '?';
                requestUrl = `${url}${separator}${queryString}`;
            }
        }

        return requestUrl;
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

                if(json?.forceLogout)
                {
                    let BASE_PATH_ = get(BASE_PATH);
                    ERROR_INFO.set({ title: 'Account banned', message: errorResponse ?? 'This account has been banned.' });
                    navigate(`${BASE_PATH_}/error`, { replace: true });
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

        const contentType = response.headers.get('Content-Type');
        if(contentType && contentType.startsWith('image/'))
        {
            try
            {
                const blob = await response.blob();

                return this.ReturnResponse(response, true, null, null, blob);
            }
            catch(error)
            {
                console.error('Error converting response to blob:', error);
                return this.ReturnResponse(response, false, 'Error converting response to blob:', error);
            }
        }

        return this.ReturnResponse(response, true);
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

    ReturnResponse(response, success_status, errorMsg = null, errorDetail = null, attach = null)
    {
        return {
        response: response,
        success: success_status,
        status: typeof response?.status !== 'undefined' ? response.status : 'no status',
        errorMsg: errorMsg,
        errorDetail: errorDetail,
        attach: attach
        };
    }
}