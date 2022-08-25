const inquirer=require("inquirer")
const db = require("./config/connection")
const cTable = require("console.table")

db.connect( ()=>{
    menu()
})

const menuQuestion=[
    {
        type:"list",
        name:"menu",
        message:"choose the following option:",
        choices:["view all departments","view all roles","view all employees","add a department","add a role","add an employee","update an employee role"]
    }
]

function menu(){
  inquirer.prompt(menuQuestion)
  .then(response=>{
    if(response.menu==="view all employees"){
        viewEmployees()
    }
    else if(response.menu==="view all departments"){
        viewDepartments()
    }
    else if(response.menu==="add an employee"){
        addEmployees()
    }
    else if(response.menu==="view all roles"){
        viewRoles()
    }
    else if (response.menu==="add a department"){
        addDepartment()
    }
    else if(response.menu==="add a role"){
        addRole()
    }
    else if(response.menu==="update an employee role"){
        updateEmployee()
    }

  })
    
}
function viewDepartments(){
    db.query("select * from department", (err, data)=>{
        console.table(data)
        menu()
    })
}

function viewRoles(){
    db.query("select * from role", (err, data)=>{
        console.table(data)
        menu()
    })
}

function addDepartment(){
    const departmentQuestions = [
        {
            type:"input",
            name:"department_name",
            message:"What is this department's name?"
        }
    ]
    inquirer.prompt(departmentQuestions).then(response=>{
        const parameters=response.department_name
        db.query("INSERT INTO department (name) VALUES(?)",parameters,(err, data)=>{
            viewDepartments()
        })
    })
   }

function addRole(){
    db.query("select name as name, id as value from department", (er, departmentData) => {
        const roleQuestions = [
            {
                type:"input",
                name:"role_title",
                message:"What is this role's title?"
            },
            {
                type:"input",
                name:"role_salary",
                message:"What is this role's salary?"
            },
            {
                type:"list",
                name:"department_id",
                message:"Which of the following departments does this role belong to?",
                choices:departmentData

            }
        ]
    inquirer.prompt(roleQuestions).then(response=>{
        const parameters=[response.role_title,response.role_salary,response.department_id]
        db.query("INSERT INTO role (title, salary, department_id)VALUES(?,?,?)",parameters,(err, data)=>{

            viewRoles()
        })
    })
})
}

function addEmployees(){
    db.query("select title as name, id as value from role", (er, roleData)=>{

           db.query(`select CONCAT(first_name, " " , last_name) as name,  id as value from employee where  manager_id is null `, (err, managerData)=>{
            const employeeAddQuestions=[
                {
                    type:"input",
                    name:"first_name",
                    message:"What is your first name?",
            
                },
                {
                    type:"input",
                    name:"last_name",
                    message:"What is your last name?",
            
                },
                {
                    type:"list",
                    name:"role_id",
                    message:"Choose the following role title",
                    choices:roleData
                },
                {
                    type:"list",
                    name:"manager_id",
                    message:"Choose the following manager",
                    choices:managerData
                }
            
            ]
            inquirer.prompt(employeeAddQuestions).then(response=>{
                const parameters=[response.first_name,response.last_name,response.role_id, response.manager_id]
                db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id)VALUES(?,?,?,?)",parameters,(err, data)=>{

                    viewEmployees()
                })
            })
           })
    })
}

function updateEmployee(){
    db.query("select * from employee", (err, employeeData) => {
        db.query(`select CONCAT(first_name, " " , last_name) as name, id as value from employee`, (err, nameData)=>{
            db.query("select title as name, id as value from role", (er, roleData)=>{
            const updateQuestions = [
                {
                    type:"list",
                    name:"to_update",
                    message:"Choose the following employee to update the role of:",
                    choices:nameData
                },
                {
                    type:"list",
                    name:"new_role",
                    message:"Please pick a new role from the following:",
                    choices:roleData
                }
            ]
            inquirer.prompt(updateQuestions).then(response=>{
                const parameters=response.new_role
                db.query(`UPDATE employee SET role_id=(?) WHERE id=${response.to_update};`,parameters,(err, data)=>{
                    viewEmployees()
                })
            })
        }) 
    })
})
}

function viewEmployees(){
db.query(`
SELECT 
employee.id,
employee.first_name,
employee.last_name,
role.title,
department.name as department,
role.salary,
CONCAT(mgr.first_name, " " , mgr.last_name) as manager
FROM employee
LEFT JOIN role ON role.id= employee.role_id
LEFT JOIN department ON role.department_id=department.id
LEFT JOIN employee as mgr ON employee.manager_id =  mgr.id

`,  (err,data)=>{
    console.table(data)

    menu()
    
} )
}