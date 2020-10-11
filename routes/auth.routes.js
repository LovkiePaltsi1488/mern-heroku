const {Router} = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Password must be more then 6 ords exactly').isLength({ min: 6})
  ],
  async (request, response) => {
    try {
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        return response.status(400).json({
          errors: errors.array(),
          message: 'Uncorrect register data'
        })
      }
      const {email, password} = request.body

      const candidate = await User.findOne({ email })

      if (candidate) {
        return response.status.json({ message: 'User with this email is already exists'})
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({
        email,
        password: hashedPassword
      })

      await user.save()

      response.status(201).json({message: 'User has been successfully registered'})

    } catch (e) {
      console.log(e)
      response.status(500).json({message: 'Something was wrong. Try again.'})
    }
})
// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Write correct email').normalizeEmail().isEmail(),
    check('password', 'Write password').exists()
  ],
  async (request, response) => {
    try {
      const errors = validationResult(request)
  
      if (!errors.isEmpty()) {
        return response.status(400).json({
          errors: errors.array(),
          message: 'Uncorrect login data'
        })
      }
  
      const {email, password} = request.body

      const user = await User.findOne({ email })

      if (!user) {
        return response.status(400).json({message: 'User was not found'})
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return response.status(400).json({message: 'Uncorrect password. Try again.'})
      }

      const token = jwt.sign(
        { userId: user.id},
        config.get('jwtSecret'),
        { expiresIn: '1h'}
      )
      response.json({ token, userId: user.id })
    } catch (e) {
      response.status(500).json({message: 'Something was wrong. Try again.'})
    }
})

module.exports = router