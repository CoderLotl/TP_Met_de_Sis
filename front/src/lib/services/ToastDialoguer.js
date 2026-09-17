import toast, { Toaster } from 'svelte-5-french-toast';

let style = 'position: relative; top: calc(100vh / 5); left: 0px; min-height: 80px;';

export const successMessage = (message)=>
{
    toast.success(`${message}`, { className: 'toast toast-success', style: style });
}

export const errorMessage = (message)=>
{
    toast.error(`${message}`, { className: 'toast toast-error', style: style});    
}

export const warningMessage = (message)=>
{
    toast(`${message}`, {className: 'toast toast-warning', style: style});
}

export const infoMessage = (message)=>
{
    toast(`${message}`, {className: 'toast toast-info', style: style, icon: 'ℹ️'});
}

export const networkMessage = ()=>
{
    toast("Couldn't contact with the server.\nCheck your internet connection.", { className: 'toast network', style: style });
}

export async function UseToast({func, successMessageText = '', errorMessageText = '', defaultSuccessMessage = false})
{
    let serverResponse = await func();

    if(!serverResponse.success)
    {        
        errorMessage(`${serverResponse.errorMsg}` + errorMessageText);
        return serverResponse;
    }
    if(successMessageText)
    {
        successMessage(successMessageText);
        return serverResponse;
    }
    if(defaultSuccessMessage)
    {
        let succMsg = await serverResponse.response.json();
        successMessage(succMsg['response']);
        return serverResponse;
    }
    
    return serverResponse;
}