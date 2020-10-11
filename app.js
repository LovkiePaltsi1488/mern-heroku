const express = require('express')
const chalk = require('chalk')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
app.use(express.json({ extended: true }))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/link', require('./routes/link.routes'))
app.use('/t', require('./routes/redirect.routes'))

if (true) {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}


const siren = chalk.rgb(93, 95, 255)
const rcolor = chalk.rgb(127, 98, 201)
const PORT = process.env.PORT || 5000

async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }).then(() => console.log(rcolor('DB seans has been started')))
    app.listen(PORT, () => console.log(siren(`Server has been started on port ${PORT}...`)))
  } catch (e) {
    console.log(chalk.red(`Server error ${e.message}`))
    process.exit(1)
  }
}

start()
