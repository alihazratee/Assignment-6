/*********************************************************************************
 * WEB322 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students. *
 * Name: Ali Hazrati  Student ID: 114016207  Date: 9 Dec 2022 *
 * Online (Heroku) Link:
 * ********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080
var express = require('express')
var app = express()
var path = require('path')
var dataservice = require(__dirname + '/data-service.js')
const clientSessions = require('client-sessions')
const dataServiceAuth = require('./data-service-auth')

const fs = require('fs')
const bodyParser = require('body-parser')
const multer = require('multer')

const exphbs = require('express-handlebars')

const storage = multer.diskStorage({
  destination: './public/images/uploaded',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

app.engine(
  '.hbs',
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
      navLink: function (url, options) {
        return (
          '<li' +
          (url == app.locals.activeRoute ? ' class="active" ' : '') +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          '</a></li>'
        )
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error('Handlebars Helper equal needs 2 parameters')
        if (lvalue != rvalue) {
          return options.inverse(this)
        } else {
          return options.fn(this)
        }
      }
    }
  })
)
app.set('view engine', '.hbs')

app.use(clientSessions({
  cookieName: "session",
  secret: "AliHazrati",
  duration: 10 * 60 * 1000,
  activeDuration: 1000 * 60
}))
onHttpStart = () => {
  console.log('Express http server listening on port ' + HTTP_PORT)
}

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path
  app.locals.activeRoute = route == '/' ? '/' : route.replace(/\/$/, '')
  next()
})
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/home', (req, res) => {
  res.render('home')
})

app.get('/about', (req, res) => {
  res.render('about')
})

app.get('/employees', ensureLogin, (req, res) => {
  if (req.query.status) {
    dataservice
      .getEmployeeByStatus(req.query.status)
      .then(data => {
        if (data.length > 0) res.render('employees', { employees: data })
        else res.render('employees', { message: 'no results' })
      })
      .catch(err => res.status(404).send('no results'))
  } else if (req.query.department) {
    dataservice
      .getEmployeesByDepartment(req.query.department)
      .then(data => {
        if (data.length > 0) res.render('employees', { employees: data })
        else res.render('employees', { message: 'no results' })
      })
      .catch(err => res.status(404).send('no results'))
  } else if (req.query.manager) {
    dataservice
      .getEmployeesByManager(req.query.manager)
      .then(data => {
        if (data.length > 0) res.render('employees', { employees: data })
        else res.render('employees', { message: 'no results' })
      })
      .catch(err => res.status(404).send('no results'))
  } else {
    dataservice
      .getAllEmployees()
      .then(data => {
        if (data.length > 0) res.render('employees', { employees: data })
        else res.render('employees', { message: 'no results' })
      })
      .catch(err => res.status(404).send('no results'))
  }
})

app.get('/employee/:empNum', ensureLogin, (req, res) => {
  let viewData = {}

  dataservice
    .getEmployeeByNum(req.params.empNum)
    .then(data => {
      if (data) {
        viewData.employee = data
      } else {
        viewData.employee = null
      }
    })
    .catch(() => {
      viewData.employee = null
    })
    .then(dataservice.getDepartments)
    .then(data => {
      viewData.departments = data

      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true
        }
      }
    })
    .catch(() => {
      viewData.departments = []
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send('Employee Not Found')
      } else {
        res.render('employee', { viewData: viewData })
      }
    })
})

app.get('/employees/add', ensureLogin, (req, res) => {
  dataservice
    .getDepartments()
    .then(data => res.render('addEmployee', { departments: data }))
    .catch(err => res.render('addEmployee', { departments: [] }))
})

app.post('/employees/add', ensureLogin, (req, res) => {
  dataservice.addEmployee(req.body).then(() => {
    res.redirect('/employees')
  })
})

app.post('/employee/update', ensureLogin, (req, res) => {
  dataservice.updateEmployee(req.body).then(() => {
    res.redirect('/employees')
  })
})

app.get('/images/add', ensureLogin, (req, res) => {
  res.render('addImage')
})

app.post('/images/add', ensureLogin, upload.single('imageFile'), (req, res) => {
  res.redirect('/images')
})

app.get('/images', ensureLogin, (req, res) => {
  fs.readdir('./public/images/uploaded', function (err, items) {
    res.render('images', { data: items })
  })
})

app.get('/managers', ensureLogin, (req, res) => {
  dataservice
    .getManagers()
    .then(data => {
      res.json({ data })
    })
    .catch(err => {
      res.json({ message: err })
    })
})

app.get('/departments', ensureLogin, (req, res) => {
  dataservice
    .getDepartments()
    .then(data => {
      if (data.length > 0) res.render('departments', { departments: data })
      else res.render('departments', { message: 'no results' })
    })
    .catch(err => res.status(404).send('departments not found'))
})

app.get('/departments/add', ensureLogin, (req, res) => {
  res.render('addDepartment')
})
app.post('/departments/add', ensureLogin, (req, res) => {
  dataservice
    .addDepartment(req.body)
    .then(() => res.redirect('/departments'))
    .catch(err => console.log(err))
})
app.post('/department/update', ensureLogin, (req, res) => {
  dataservice
    .updateDepartment(req.body)
    .then(() => res.redirect('/departments'))
    .catch(err => console.log(err))
})
app.get('/department/:departmentId', ensureLogin, (req, res) => {
  dataservice
    .getDepartmentById(req.params.departmentId)
    .then(data => {
      if (data == undefined) res.status(404).send('Department Not Found')
      else res.render('department', { department: data })
    })
    .catch(err => res.status(404).send('Department Not Found'))
})
app.post('/employees/add', ensureLogin, (req, res) => {
  dataservice
    .addEmployee(req.body)
    .then(() => res.redirect('/employees'))
    .catch(err => console.log(err))
})
app.get('/employee/:empNum', ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {}
  dataservice
    .getEmployeeByNum(req.params.empNum)
    .then(data => {
      if (data) {
        viewData.employee = data //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null // set employee to null if there was an error
    })
    .then(dataservice.getDepartments)
    .then(data => {
      viewData.departments = data // store department data in the "viewData" object as
        ; ('departments')
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true
        }
      }
    })
    .catch(() => {
      viewData.departments = [] // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send('Employee Not Found')
      } else {
        res.render('employee', { viewData: viewData }) // render the "employee" view
      }
    })
})
app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
  dataservice
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect('/employees'))
    .catch(err =>
      res.status(500).send('Unable to Remove Employee / Employee not found')
    )
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  dataServiceAuth.checkUser(req.body).then((User) => {
    req.session.user = {
      userName: User.userName,
      email: User.email,
      loginHistory: User.loginHistory
    }

    res.redirect('/employees')
  }).catch(err => {
    res.render('login', { errorMessage: err, userName: req.body.userName })
  })

})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  dataServiceAuth.registerUser(req.body).then(() => {
    res.render('register', { successMessage: "User created" })
  }).catch(err => {
    res.render('register', { errorMessage: err, userName: req.body.userName })
  })
})

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect("/")
})

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory')
})
app.use((req, res) => {
  res.status(404).end('404 PAGE NOT FOUND')
})

dataservice
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart())
  })
  .catch(() => {
    console.log('promises unfulfilled')
  })

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

