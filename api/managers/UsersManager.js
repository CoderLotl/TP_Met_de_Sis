import { ResponseManager } from "../services/ResponseManager.js";
import { DataAccess } from "../services/DataAccess.js";
import { Logger } from "../services/Logger.js";
import { Validator } from "../services/Validator.js";
import bcrypt from 'bcryptjs';

const COLUMN_VALIDATORS = {
    user: Validator.isNonEmptyString,
    mail: Validator.isValidEmail,
    password: Validator.isValidPassword,
    status: Validator.isNonEmptyString,
    permissionKey: Number.isInteger
};

export class UsersManager
{
    static async updateUser(req, res)
    {
        let id = req.params.id;

        if(!Validator.isValidId(id))
        {
            return ResponseManager.ReturnResponse(req, res, 'Invalid user id', 400);
        }

        let fields = ResponseManager.GetRequest(req);
        let setColumns = Object.keys(fields).filter(column => column in COLUMN_VALIDATORS);

        if(setColumns.length === 0)
        {
            return ResponseManager.ReturnResponse(req, res, 'No valid fields to update', 400);
        }

        for(let column of setColumns)
        {
            if(!COLUMN_VALIDATORS[column](fields[column]))
            {
                return ResponseManager.ReturnResponse(req, res, `Invalid value for field "${column}"`, 400);
            }
        }

        try
        {
            let setValues = [];

            for(let column of setColumns)
            {
                if(column === 'password')
                {
                    setValues.push(await bcrypt.hash(fields[column], 10));
                }
                else
                {
                    setValues.push(fields[column]);
                }
            }

            DataAccess.update('users', setColumns, setValues, ['id'], [id]);
            return ResponseManager.ReturnResponse(req, res, 'User updated successfully', 200);
        }
        catch(error)
        {
            Logger.log(`Error updating user: ${error.message}`);
            return ResponseManager.ReturnResponse(req, res, 'Error updating user', 500);
        }
    }

    static deleteUser(req, res)
    {
        let id = req.params.id;

        if(!Validator.isValidId(id))
        {
            return ResponseManager.ReturnResponse(req, res, 'Invalid user id', 400);
        }

        try
        {
            DataAccess.update('users', ['deleted'], [1], ['id'], [id]);
            return ResponseManager.ReturnResponse(req, res, 'User deleted successfully', 200);
        }
        catch(error)
        {
            Logger.log(`Error deleting user: ${error.message}`);
            return ResponseManager.ReturnResponse(req, res, 'Error deleting user', 500);
        }
    }
}
