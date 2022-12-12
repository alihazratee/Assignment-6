const Sequelize = require('sequelize')
var sequelize = new Sequelize(
  'qvedcwvm',
  'qvedcwvm',
  'QUZKOqO18ybKmdaZO4F4M7zMSD2HbQHh',
  {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: true
    },
    query: { raw: true }
  }
)

var Employee = sequelize.define('Employee', {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.Sequelize.STRING
})
var Department = sequelize.define('Department', {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  departmentName: Sequelize.STRING
})

const file = require('fs')
var employees = []
var departments = []

exports.initialize = () => {
  return new Promise((res, rej) => {
    sequelize
      .sync()
      .then(() => {
        console.log('initialized to database')
        res()
      })
      .catch(err => rej('failed to initialize database, error: ' + err))
  })
}

exports.getAllEmployees = () => {
  return new Promise((res, rej) => {
    Employee.findAll()
      .then(data => res(data))
      .catch(err => rej('error getting all employees, error: ' + err))
  })
}


exports.getDepartments = () => {
  return new Promise((res, rej) => {
    Department.findAll()
      .then(data => res(data))
      .catch(err => rej('error getting departments, error: ' + err))
  })
}


exports.addEmployee = employeeData => {
  return new Promise((res, rej) => {
    employeeData.isManager = employeeData.isManager ? true : false
    for (const property in employeeData) {
      if (employeeData[property] == '') employeeData[property] = null
    }
    Employee.create({
      employeeNum: employeeData.employeeNum,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      SSN: employeeData.SSN,
      addressStreet: employeeData.addressStreet,
      addressCity: employeeData.addressCity,
      addressState: employeeData.addressState,
      addressPostal: employeeData.addressPostal,
      maritalStatus: employeeData.maritalStatus,
      isManager: employeeData.isManager,
      employeeManagerNum: employeeData.employeeManagerNum,
      status: employeeData.status,
      department: employeeData.department,
      hireDate: employeeData.hireDate
    })
      .then(() => res())
      .catch(err => rej('error creating employee, error: ' + err))
  })
}


exports.getEmployeesByStatus = status => {
  return new Promise((res, rej) => {
    Employee.findAll({ where: { status } })
      .then(data => res(data))
      .catch(err => rej('error getting employees by status, error: ', err))
  })
}


exports.getEmployeesByDepartment = department => {
  return new Promise((res, rej) => {
    Employee.findAll({ where: { department } })
      .then(data => res(data))
      .catch(err => rej('error getting employees by department, error: ', err))
  })
}


exports.getEmployeesByManager = manager => {
  return new Promise((res, rej) => {
    Employee.findAll({ where: { employeeManagerNum: manager } })
      .then(data => res(data))
      .catch(err => rej('error getting employees by manager, error: ' + err))
  })
}


exports.getEmployeeByNum = num => {
  return new Promise((res, rej) => {
    Employee.findAll({ where: { employeeNum: num } })
      .then(data => res(data[0]))
      .catch(err => rej('error getting employee by num, error: ' + err))
  })
}


exports.updateEmployee = employeeData => {
  return new Promise((res, rej) => {
    employeeData.isManager = employeeData.isManager ? true : false
    for (const property in employeeData) {
      if (employeeData[property] == '') employeeData[property] = null
    }
    Employee.update(
      {
        employeeNum: employeeData.employeeNum,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        SSN: employeeData.SSN,
        addressStreet: employeeData.addressStreet,
        addressCity: employeeData.addressCity,
        addressState: employeeData.addressState,
        addressPostal: employeeData.addressPostal,
        maritalStatus: employeeData.maritalStatus,
        isManager: employeeData.isManager,
        employeeManagerNum: employeeData.employeeManagerNum,
        status: employeeData.status,
        department: employeeData.department,
        hireDate: employeeData.hireDate
      },
      { where: { employeeNum: employeeData.employeeNum } }
    )
      .then(() => res())
      .catch(err => rej('error updating employee, error: ' + err))
  })
}


exports.addDepartment = departmentData => {
  return new Promise((res, rej) => {
    for (const property in departmentData) {
      if (departmentData[property] == '') departmentData[property] = null
    }
    Department.create({
      departmentId: departmentData.departmentId,
      departmentName: departmentData.departmentName
    })
      .then(() => res())
      .catch(err => rej('error creating department, error: ' + err))
  })
}


exports.updateDepartment = departmentData => {
  return new Promise((res, rej) => {
    for (const property in departmentData) {
      if (departmentData[property] == '') departmentData[property] = null
    }
    Department.update(
      {
        departmentId: departmentData.departmentId,
        departmentName: departmentData.departmentName
      },
      { where: { departmentId: departmentData.departmentId } }
    )
      .then(() => res())
      .catch(err => rej('error updating department, error: ' + err))
  })
}


exports.getDepartmentById = id => {
  return new Promise((res, rej) => {
    Department.findAll({ where: { departmentId: id } })
      .then(data => res(data[0]))
      .catch(err => rej('error getting department by id, error:' + err))
  })
}

exports.deleteEmployeeByNum = empNum => {
  return new Promise((res, rej) => {
    Employee.destroy({ where: { employeeNum: empNum } })
      .then(() => res())
      .catch(err => rej('error deleting employee by id, error: ' + err))
  })

}
