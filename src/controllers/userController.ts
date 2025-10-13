import { userDAO, UserDAO } from "../dao/userDAO";
import { Request, Response } from "express";
import config from "../config/config";
import bcrypt from "bcrypt";


interface UserProfileRequest {
    userId: string;
}
/**
 * Retrieves the profile of the authenticated user.
 *
 * @async
 * @function getUserProfile
 * @param {Request} req - Express request object containing `userId` in `req.user`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Returns a JSON response with:
 *  - 200: `{ success: true, user: userProfile }`
 * if retrieved successfully.
 *  - 404: `{ success: false, message: "User not found." }`
 * if the user does not exist.
 *  - 500: `{ success: false, message: error.message }`
 * if an internal error occurs.
 */
const getUserProfile = async (req: any, res: Response) => {
    try {
      const userId: string = req.user?.userId;
  
        const userProfile = await userDAO.findById(userId);
  
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado."
        });
      }
  
      res.status(200).json({
        success: true,
        user: userProfile
      });
    } catch (err: unknown) {
      if (config.nodeEnv === "development") {
        console.error(err instanceof Error ? err.message : "Error interno del servidor");
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor." , err: err instanceof Error ? err.message : "Error interno del servidor"
      });
    }
  };

interface UpdateUserProfileRequest {
    userId: string;
    name: string;
    lastName: string;
    age: number;
    email: string;
    currentPassword: string | null;
    newPassword: string | null;
}

/**
 * Updates the authenticated user's profile.
 *
 * @async
 * @function updateUserProfile
 * @param {Request} req - Request object con userId en req.user
 * @param {Response} res - Response object
 * @returns {Promise<void>} Returns a JSON object with:
 *  - 200: `{ success: true, user: updatedUser }` if updated successfully.
 *  - 400: `{ success: false, message: error.message }` if there are validation errors.
 *  - 404: `{ success: false, message: "Usuario no encontrado." }` if the user does not exist.
 *  - 500: `{ success: false, message: error.message }`if an internal error occurs.
 */
const updateUserProfile = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { name, lastName, age, email, currentPassword, newPassword } = req.body;
  
      // Verify that the user exists
      const existingUser = await userDAO.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado."
        });
      }
  
      // Check if the email already exists for another user
      if (email && email !== existingUser.email) {
        const emailExists = await userDAO.findByEmail(email);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Este correo ya está registrado por otro usuario."
          });
        }
      }
  
      // Handle password change if provided
      if (currentPassword && newPassword) {
        // Verify current password
        const isCurrentPasswordValid: boolean = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "La contraseña actual es incorrecta."
          });
        }
  
        // Validate new password
        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: "La nueva contraseña debe tener al menos 6 caracteres."
          });
        }
  
        // Hash new password
        const saltRounds: number = 10;
        const hashedNewPassword: string = await bcrypt.hash(newPassword, saltRounds);
  
        // Update user with new password
        const updatedUser = await userDAO.updateById(userId, {
          name: name,
          lastName: lastName,
          age: age,
          email: email,
          password: hashedNewPassword
        });
        if (!updatedUser) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado."
          });
        }
  
        // Get the updated profile (without sensitive data)
        const userProfile = await userDAO.findById(userId);
  
        return res.status(200).json({
          success: true,
          user: userProfile,
          message: "Perfil y contraseña actualizados exitosamente."
        });
      }
  
      // Update user without password change
      const updatedUser = await userDAO.updateById(userId, {
        name: name,
        lastName: lastName,
        age: age,
        email: email
      });
  
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado."
        });
      }
  
      // Get the updated profile (without sensitive data)
      const userProfile = await userDAO.findById(userId);
  
      res.status(200).json({
        success: true,
        user: userProfile,
        message: "Perfil actualizado exitosamente."
      });
    } catch (err: unknown) {
      if (config.nodeEnv === "development") {
        console.error(err instanceof Error ? err.message : "Error interno del servidor");
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor." , err: err instanceof Error ? err.message : "Error interno del servidor"
      });
    }
    
  };




interface DeleteUserProfileRequest {
    userId: string;
}

/**
 * Boolean deletes the auth user account
 * @async
 * @function deleteAccount
 * @param {Request} req - Express request object containing `userId` in `req.user`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Returns a JSON object with:
 *  - 200: `{ success: true, message: "Cuenta eliminada." }` if the account was deleted successfully.
 *  - 404: `{ success: false, message: "Usuario no encontrado o ya eliminado." }` if the user does not exist or is already deleted.
 *  - 500: `{ success: false, message: "Error interno del servidor." }` if an internal error occurs.
 */
const softDeleteAccount = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;
  

      // Soft delete the user account
      const deleted: boolean = await userDAO.softDeleteById(userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado o ya eliminado." });
      }
  
      const isProduction: boolean = config.nodeEnv === 'production';
      res.clearCookie("access_token", {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
      
  
      return res.status(200).json({ success: true, message: "Cuenta eliminada." });
    } catch (err: unknown) {
      if (config.nodeEnv === "development") {
        console.error(err);
      }
      res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
  };


export default { getUserProfile, updateUserProfile, softDeleteAccount };