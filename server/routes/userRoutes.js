import { Router } from "express";
import { completeUserPythonLevel, login, registerUser } from "../controllers/userController.js";
import { validateLogin, validateRegister } from "../middlewares/validateUser.js";

const router = Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, login);
router.post("/:id/progress/python-levels", completeUserPythonLevel);

export default router;
