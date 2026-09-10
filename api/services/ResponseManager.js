export class ResponseManager
{
    static GetRequest(req)
    {
        if(req.method === 'GET' || req.method === 'DELETE')
        {
            return req.query;
        }
        return req.body;
    }

    static ReturnResponse(req, res, payload, statusCode = 200)
    {
        return res.status(statusCode).json({response: payload});
    }
    
}