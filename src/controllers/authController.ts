import type { Request, Response } from "express";
import { UserDAO, userDAO } from "../dao/userDAO";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { sendMail } from "../service/resendService";

interface RegisterRequest {
    name: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
}
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

const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
        const { name, lastName, age, email, password } = req.body;
        // Validate required fields
        if( !name || !lastName || !age || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        // Validate age
        else if(age < 13) {
            return res.status(400).json({ message: "La edad debe ser mayor o igual a 13 años." });
        }

        // Validate email format
        const emailRule: RegExp = /^\S+@\S+\.\S+$/;
        if(!emailRule.test(email)) {
            return res.status(400).json({ message: "El formato de la dirección de correo electrónico no es válido" });
        }

        // Validate password format
        const passwordRule: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRule.test(password)) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial." });
        }

        // Validate if user already exists
        const existingUser = await userDAO.findByEmail(email); 
        if(existingUser !== null) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        // Create user in database if all validation passes
        const user = await userDAO.create({ name, lastName, age, email, password }); 
        res.status(201).json({ userId: user.id });
    } catch (error: unknown) {
        // If error is an instance of Error, return the message
        res.status(400).json({ message: error instanceof Error ? error.message : "Error interno del servidor"});
    }
}

interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Logs in a user and returns a token.
 *
 * @async
 * @function login
 * @param {import('express').Request} req Express HTTP request object.
 * @param {import('express').Response} res Express HTTP response object.
 * @returns {Promise<void>} Does not return directly; sends a JSON response.
 */
const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
        const { email, password } = req.body;

        switch(true) {
            case !email:
                return res.status(400).json({ message: "El correo es obligatorio." });
            case !password:
                return res.status(400).json({ message: "La contraseña es obligatoria." });
        }   

        const user = await userDAO.findByEmail(email);
        if(!user) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }
        if (user.isDeleted) {
            return res.status(403).json({ message: "Tu cuenta está deshabilitada." });
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });      
        }

        const token: string = jwt.sign(
            { userId: user.id }, 
            config.jwtSecret, 
            { expiresIn: "24h" } // 24 hours
        );
   
        // Adaptative Cookie
        res.cookie("access_token", token, 
                { 
                    httpOnly: false, 
                    secure: false,
                    sameSite: "lax", 
                    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
                    path: "/"
                }
        ); 
        return res.status(200).json({ message: "Inicio de sesión exitoso.", token });

        

    } catch (error: unknown) {
      return res.status(500).json({ message: "Inténtalo más tarde.", error: error instanceof Error ? error.message : "Error interno del servidor"});
    }
}

// Logout

/**
 * Logs out a user and clears the cookie.
 *
 * @async
 * @function logout
 * @param {import('express').Request} req Express HTTP request object.
 * @param {import('express').Response} res Express HTTP response object.
 * @returns {Promise<void>} Does not return directly; sends a JSON response.
 */


const logout = async (req: Request , res: Response) => {
   try{
     const isProduction: boolean = config.nodeEnv === "production";
     res.clearCookie("access_token", {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
     });
     return res.status(200).json({ message: "Cierre de sesión exitoso." });
   } catch (error: unknown) {
    return res.status(500).json({ message: "Inténtalo más tarde.", error: error instanceof Error ? error.message : "Error interno del servidor"});
   }
}

/**
 * Sends an email with a password reset link.
 *
 * @async
 * @function forgotPassword
 * @param {Request} req Express request object containing the user email.
 * @param {Response} res Express response object.
 * @returns {Promise<void>} Returns a JSON object with:
 *
 * - 200: `{ success: true, message: "Si el correo existe, se ha enviado un enlace de restablecimiento." }`
 *   If the process completes successfully.
 * - 202: `{ success: false, message: "Correo no registrado." }`
 *   If the email is not registered.
 * - 500: `{ success: false, message: err.message }`
 *   If an internal error occurs.
 */


const forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log(email);
      const user = await userDAO.findByEmail(email);
      if (!user) {
        return res.status(202).json({ success: false, message: "Correo no registrado." });
      }
      const jwtid = Math.random().toString(36).substring(2);
      const resetToken = jwt.sign(
        { userId: user.id },
        config.jwtResetPasswordSecret,
        { expiresIn: '1h' , jwtid }
      );
  
      await userDAO.updateResetPasswordJti(user.id, jwtid);
  
      const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
      // In development, send to verified Resend email
      const emailToSend = config.nodeEnv === 'production'
          ? 'kealgri@gmail.com'
          : email;
  
      await sendMail({
          to: emailToSend,
          subject: "Restablecimiento de contraseña",
          text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}\n\nSolicitado para: ${email}`,
          html: `
              <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
              <a href="${resetLink}">${resetLink}</a>
              <p><strong>Solicitado para:</strong> ${email}</p>
          `,
      });
  
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error en forgotPassword:', err);
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Error interno del servidor"});
    }
  };

export default { register, login, logout, forgotPassword };