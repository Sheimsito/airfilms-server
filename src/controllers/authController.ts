import type { Request, Response } from "express";
import { userDAO } from "../dao/userDAO";

/**
* Registers a new user in the database.
*
* @async
* @function register
* @param {import('express').Request} req Express HTTP request object.
* @param {import('express').Response} res Express HTTP response object.
* @returns {Promise<void>} Does not return directly; sends a JSON response.
*
* @throws {409} If the email is already registered. Response: `{ message: "This email is already registered." }`
* @throws {400} If a validation or other error occurs. Response: `{ message: error.message }`
*/

const register = async (req: Request, res: Response) => {
    try {
        const { name, lastName, age, email, password } = req.body;
        const user = await userDAO.create({ name, lastName, age, email, password }); 
        res.status(201).json({ userId: user.id });
    } catch (error: unknown) {
        if(error instanceof Error && error.message === "Este correo ya está registrado.") {
            res.status(409).json({ message: "Este correo ya está registrado." });
        }
        res.status(400).json({ message: error instanceof Error ? error.message : "Error interno del servidor"});
    }
}

export default { register };