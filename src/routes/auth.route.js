import express from 'express';
import { validateSignup, validateSignin } from '../validation/auth.validate.js';
import { signup, signin } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);

export default router;