const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const administratorModel = require('./DatabaseModels/administratorModel');
const teacherModel = require('./DatabaseModels/teacherModel');
const studentModel = require('./DatabaseModels/studentModel');
const quizModel = require('./DatabaseModels/quizModel');

const administratorLogin = require('./Login/administratorLogin');
const { error } = require('console');

mongoose.connect(process.env.MONGODBURL).then(()=>{
    console.log('Connected to database');
}).catch(()=>{
    console.log('Cannot connect to database');
});

const app = express();

app.use(cors({
    origin: "null"
}));

// Create administrator
/*
bcrypt.hash('My$Password123', 10, function(error, hash){
    if (error != null) {
        console.log('Create administrator', error);
        return;
    }

    const newAdministrator = new administratorModel({
        userName: 'Admin1',
        password: hash
    });

    newAdministrator.save().then(response=>{
        console.log('Saved administrator', response);
    }).catch(error=>{
        console.log('Save administrator', error);
    });
});
*/

app.delete('/logout', (req, res)=>{
    console.log('Logout');
    res.header('WWW-Authenticate', 'Basic');
    res.sendStatus(401);
});

app.get('/administrator/teacherList.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/teacherList.html'));
});

app.get('/administrator/studentList.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/studentList.html'));
});

app.get('/administrator/changePassword.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/changePassword.html'));
});

app.get('/administrator/addTeacher.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/addTeacher.html'));
});

app.get('/administrator/editTeacher.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/editTeacher.html'));
});

app.get('/administrator/addStudent.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/addStudent.html'));
});

app.get('/administrator/editStudent.html', administratorLogin, (req, res)=>{
    res.sendFile(path.join(__dirname, '/AdministratorPages/editStudent.html'));
});

app.get('/styles.css', (req, res)=>{
    res.sendFile(path.join(__dirname, '/styles.css'));
});

// Administrator change password
app.use(bodyParser.urlencoded({extended: true})).post('/administratorchangepassword', administratorLogin, (req, res)=>{
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    console.log('Administrator change password', 'old password', oldPassword, 'new password', newPassword);

    administratorModel.findOne({userName: req.userName}).then(result=>{
        console.log('Found administrator', result);

        bcrypt.compare(oldPassword, result.password, (error, isOldPasswordMatch)=>{
            if (error != null) {
                console.log('Compare old password error', error);
                res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
                return;
            }

            if (!isOldPasswordMatch) {
                console.log('Old password not match');
                res.status(400).sendFile(path.join(__dirname, '/AdministratorPages/oldPasswordNotCorrect.html'));
                return;
            }

            bcrypt.hash(newPassword, 10, (error, hash)=>{
                if (error != null) {
                    console.log('Hash new password error', error);
                    res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
                    return;
                }

                console.log('hash', hash);

                administratorModel.findOneAndUpdate({userName: req.userName}, {password: hash}).then(response=>{
                    console.log('Updated administrator', response);

                    res.status(200).sendFile(path.join(__dirname, '/AdministratorPages/changePasswordSuccess.html'));

                }).catch(error=>{
                    console.log('Update password error', error);
                    res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
                });
            });
        });
    }).catch(error=>{
        console.log('Find administrator error', error);
        res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
    });
});

// Add teacher
app.use(bodyParser.urlencoded({extended: true})).post('/addteacher', administratorLogin, (req, res)=>{
    const staffNumber = req.body.staffNumber;
    const name = req.body.name;
    const password = req.body.password;
    console.log('Add teacher', 'staff number', staffNumber, 'name', name, 'password', password);

    teacherModel.findOne({staffNumber: staffNumber}).then(result=>{
        console.log('Finding duplicate teacher', result);

        if (result != null) {
            console.log('Found duplicate teacher');
            res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/duplicateTeacher.html'));
            return;
        }

        bcrypt.hash(password, 10, (error, hash)=>{
            if (error != null) {
                console.log('Hash password error', error);
                res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
                return;
            }

            console.log('hash', hash);

            const newTeacher = new teacherModel({
                staffNumber: staffNumber,
                name: name,
                password: hash,
                createdBy: req.userName
            });

            newTeacher.save().then(response=>{
                console.log('Saved new teacher', response);
                res.status(201).sendFile(path.join(__dirname, '/AdministratorPages/addTeacherSuccess.html'));
            }).catch(error=>{
                console.log('Save new teacher error', error);
                res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
            });
        });
    }).catch(error=>{
        console.log('Find duplicate teacher error', error);
        res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
    });
});

// Get list of teachers
app.get('/teachers', administratorLogin, (req, res)=>{
    console.log('Get list of teachers');
    
    teacherModel.aggregate([
        {
            $sort: {
                name: 1     // Arrange name in ascending order
            }
        }
    ]).then(results=>{
        console.log('Found teachers', results);

        const teachers = [];
        for (var i = 0; i < results.length; i++) {
            const teacher = {
                staffNumber: results[i].staffNumber,
                name: results[i].name
            }
            teachers.push(teacher);
        }

        res.status(200).json({
            teachers: teachers
        });
    }).catch(error=>{
        console.log('Find teachers error', error);
        res.sendStatus(500);
    });
});

// Get teacher information by staff number
app.get('/teacher', administratorLogin, (req, res)=>{
    const staffNumber = req.query.staffNumber;
    console.log('Get teacher information by staff number', staffNumber);

    if (staffNumber == 'null') {
        console.log('No staff number');
        res.status(400).json({
            message: 'No staff number provided.'
        });
        return;
    }

    teacherModel.findOne({staffNumber: staffNumber}).then(result=>{
        console.log('Found teacher', result);

        if (result == null) {
            res.status(400).json({
                message: 'Teacher not found.'
            });
            return;
        }

        res.status(200).json({
            teacher: {
                staffNumber: staffNumber,
                name: result.name
            }
        });
    }).catch(error=>{
        console.log('Find teacher error', error);
        res.sendStatus(500);
    });
});

// Edit teacher information
app.use(bodyParser.urlencoded({extended: true})).post('/editteacher', administratorLogin, (req, res)=>{
    const staffNumber = req.body.staffNumber;
    const name = req.body.name;
    const newPassword = req.body.newPassword;
    console.log('Edit teacher', 'staff number', staffNumber, 'name', name, 'new password', newPassword);

    quizModel.find({teacherStaffNumber: staffNumber}).then(results=>{
        console.log('Found quizzes created by that teacher', results);

        const promises = [];

        for (var i = 0; i < results.length; i++) {
            const promise = new Promise((resolve, reject)=>{
                quizName = results[i].name;
                console.log('Change teacher name for quiz', quizName);

                quizModel.findOneAndUpdate({name: quizName}, {teacherName: name}).then(response=>{
                    console.log('Changed teacher name for quiz', quizName, response);
                    resolve();

                }).catch(error=>{
                    console.log('Change teacher name for quiz error', quizName, error);
                    reject();
                });
            });

            promises.push(promise);
        }

        if (newPassword !== '') {
            console.log('Password is changed');

            const promise = new Promise((resolve, reject)=>{
                bcrypt.hash(newPassword, 10, (error, hash)=>{
                    if (error != null) {
                        console.log('Hash password error', error);
                        reject();
                        return;
                    }

                    const editFields = {
                        name: name,
                        password: hash
                    }

                    teacherModel.findOneAndUpdate({staffNumber: staffNumber}, editFields).then(response=>{
                        console.log('Edited teacher', response);
                        resolve();

                    }).catch(error=>{
                        console.log('Edit teacher error', error);
                        reject();
                    });
                });
            });

            promises.push(promise);
        }
        else {
            console.log('Password is not changed');

            const promise = new Promise((resolve, reject)=>{
                teacherModel.findOneAndUpdate({staffNumber: staffNumber}, {name: name}).then(response=>{
                    console.log('Edited teacher', response);
                    resolve();

                }).catch(error=>{
                    console.log('Edit teacher error', error);
                    reject();
                });
            });

            promises.push(promise);
        }

        Promise.all(promises).then(result=>{
            console.log('All promises resolved', result);
            res.status(200).sendFile(path.join(__dirname, '/AdministratorPages/editTeacherSuccess.html'));

        }).catch(error=> {
            console.log('Some promise rejected', error);
            res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
        });

    }).catch(error=>{
        console.log('Find quizzes created by that teacher error', error);
        res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
    });
});

// Delete teacher
app.delete('/deleteteacher', administratorLogin, (req, res)=>{
    staffNumber = req.query.staffNumber;
    console.log('Delete teacher', 'staff number', staffNumber);
    
    quizModel.deleteMany({teacherStaffNumber: staffNumber}).then(response=>{
        console.log('Deleted all quizzes created by that teacher', response);

        teacherModel.findOneAndDelete({staffNumber: staffNumber}).then(response=>{
            console.log('Deleted teacher', response);

            res.sendStatus(204);

        }).catch(error=>{
            console.log('Delete teacher error', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Delete all quizzes created by that teacher error', error);
        res.sendStatus(500);
    });
});

// Add student
app.use(bodyParser.urlencoded({extended: true})).post('/addstudent', administratorLogin, (req, res)=>{
    const matriculationNumber = req.body.matriculationNumber;
    const name = req.body.name;
    const password = req.body.password;
    console.log('Add student', 'matriculation number', matriculationNumber, 'name', name, 'password', password);

    studentModel.findOne({matriculationNumber: matriculationNumber}).then(result=>{
        console.log('Finding duplicate student', result);

        if (result != null) {
            console.log('Found duplicate student');
            res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/duplicateStudent.html'));
            return;
        }

        bcrypt.hash(password, 10, (error, hash)=>{
            if (error != null) {
                console.log('Hash password error', error);
                res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
                return;
            }

            console.log('hash', hash);

            const newStudent = new studentModel({
                matriculationNumber: matriculationNumber,
                name: name,
                password: hash,
                createdBy: req.userName
            });

            newStudent.save().then(response=>{
                console.log('Saved new student', response);
                res.status(201).sendFile(path.join(__dirname, '/AdministratorPages/addStudentSuccess.html'));
            }).catch(error=>{
                console.log('Save new student error', error);
                res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
            });
        });
    }).catch(error=>{
        console.log('Find duplicate student error', error);
        res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
    });
});

// Get list of students
app.get('/students', administratorLogin, (req, res)=>{
    console.log('Get list of students');
    
    studentModel.aggregate([
        {
            $sort: {
                name: 1     // Arrange name in ascending order
            }
        }
    ]).then(results=>{
        console.log('Found students', results);

        const students = [];
        for (var i = 0; i < results.length; i++) {
            const student = {
                matriculationNumber: results[i].matriculationNumber,
                name: results[i].name
            }
            students.push(student);
        }

        res.status(200).json({
            students: students
        });
    }).catch(error=>{
        console.log('Find students error', error);
        res.sendStatus(500);
    });
});

// Get student information by matriculation number
app.get('/student', administratorLogin, (req, res)=>{
    const matriculationNumber = req.query.matriculationNumber;
    console.log('Get student information by matriculation number', matriculationNumber);

    if (matriculationNumber == 'null') {
        console.log('No matriculation number');
        res.status(400).json({
            message: 'No matriculation number provided.'
        });
        return;
    }

    studentModel.findOne({matriculationNumber: matriculationNumber}).then(result=>{
        console.log('Found student', result);

        if (result == null) {
            res.status(400).json({
                message: 'Student not found.'
            });
            return;
        }

        res.status(200).json({
            student: {
                matriculationNumber: matriculationNumber,
                name: result.name
            }
        });
    }).catch(error=>{
        console.log('Find student error', error);
        res.sendStatus(500);
    });
});

// Edit student information
app.use(bodyParser.urlencoded({extended: true})).post('/editstudent', administratorLogin, (req, res)=>{
    const matriculationNumber = req.body.matriculationNumber;
    const name = req.body.name;
    const newPassword = req.body.newPassword;
    console.log('Edit student', 'matriculation number', matriculationNumber, 'name', name, 'new password', newPassword);

    quizModel.find({
        participants: {
            $elemMatch: {
                matriculationNumber: matriculationNumber
            }
        }
    }).then(results=>{
        console.log('Found quizzes participated by that student', results);

        const promises = [];

        for (var i = 0; i < results.length; i++) {
            const promise = new Promise((resolve, reject)=>{
                quizName = results[i].name;
                console.log('Change student name for quiz', quizName);

                quizModel.findOneAndUpdate({
                    name: quizName,
                    "participants.matriculationNumber": matriculationNumber
                }, {
                    "participants.$.name": name
                }).then(response=>{
                    console.log('Changed student name for quiz', quizName, response);
                    resolve();

                }).catch(error=>{
                    console.log('Change student name for quiz error', quizName, error);
                    reject();
                });
            });

            promises.push(promise);
        }

        if (newPassword !== '') {
            console.log('Password is changed');

            const promise = new Promise((resolve, reject)=>{
                bcrypt.hash(newPassword, 10, (error, hash)=>{
                    if (error != null) {
                        console.log('Hash password error', error);
                        reject();
                        return;
                    }

                    const editFields = {
                        name: name,
                        password: hash
                    }

                    studentModel.findOneAndUpdate({matriculationNumber: matriculationNumber}, editFields).then(response=>{
                        console.log('Edited student', response);
                        resolve();

                    }).catch(error=>{
                        console.log('Edit student error', error);
                        reject();
                    });
                });
            });

            promises.push(promise);
        }
        else {
            console.log('Password is not changed');

            const promise = new Promise((resolve, reject)=>{
                studentModel.findOneAndUpdate({matriculationNumber: matriculationNumber}, {name: name}).then(response=>{
                    console.log('Edited student', response);
                    resolve();

                }).catch(error=>{
                    console.log('Edit student error', error);
                    reject();
                });
            });

            promises.push(promise);
        }

        Promise.all(promises).then(result=>{
            console.log('All promises resolved', result);
            res.status(200).sendFile(path.join(__dirname, '/AdministratorPages/editStudentSuccess.html'));

        }).catch(error=> {
            console.log('Some promise rejected', error);
            res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
        });

    }).catch(error=>{
        console.log('Find quizzes participated by that student error', error);
        res.status(500).sendFile(path.join(__dirname, '/AdministratorPages/tryAgain.html'));
    });
});

// Delete student
app.delete('/deletestudent', administratorLogin, (req, res)=>{
    matriculationNumber = req.query.matriculationNumber;
    console.log('Delete student', 'matriculation number', matriculationNumber);

    quizModel.find({
        participants: {
            $elemMatch: {
                matriculationNumber: matriculationNumber
            }
        }
    }).then(results=>{
        console.log('Found quizzes participated by that student', results);

        const promises = [];

        for (var i = 0; i < results.length; i++) {
            const promise = new Promise((resolve, reject)=>{
                quizName = results[i].name;
                console.log('Delete student for quiz', quizName);

                quizModel.findOneAndUpdate({
                    name: quizName
                }, {
                    $pull: {
                        participants: {
                            matriculationNumber: matriculationNumber
                        }
                    }
                }).then(response=>{
                    console.log('Deleted student for quiz', quizName, response);
                    resolve();

                }).catch(error=>{
                    console.log('Delete student name for quiz error', quizName, error);
                    reject();
                });
            });

            promises.push(promise);
        }

        const promise = new Promise((resolve, reject)=>{
            studentModel.findOneAndDelete({matriculationNumber: matriculationNumber}).then(response=>{
            console.log('Deleted student', response);
            resolve();

            }).catch(error=>{
                console.log('Delete student error', error);
                reject();
            });
        });
        promises.push(promise);

        Promise.all(promises).then(result=>{
            console.log('All promises resolved', result);
            res.sendStatus(200);

        }).catch(error=> {
            console.log('Some promise rejected', error);
            res.sendStatus(500);
        });

    }).catch(error=>{
        console.log('Find quizzes participated by that student error', error);
        res.sendStatus(500);
    });
});

// Create quiz
/*
const quiz1 = new quizModel({name: 'Quiz 1', teacherStaffNumber: 'staff003', teacherName: 'John'});
const quiz2 = new quizModel({name: 'Quiz 2', teacherStaffNumber: 'staff003', teacherName: 'John'});
quiz1.save().then(result=>{console.log(result)}).catch(error=>{console.log(error)});
quiz2.save().then(result=>{console.log(result)}).catch(error=>{console.log(error)});
*/

// Add student to quiz
/*
quizModel.findOneAndUpdate({name: 'Quiz 1'}, {$push: {participants: {matriculationNumber: 'student001', name: 'Danny'}}}).then(result=>{console.log(result)}).catch(error=>{console.log(error)});
quizModel.findOneAndUpdate({name: 'Quiz 2'}, {$push: {participants: {matriculationNumber: 'student001', name: 'Danny'}}}).then(result=>{console.log(result)}).catch(error=>{console.log(error)});
*/

app.get('/*', (req, res)=>{
    res.status(404).sendFile(path.join(__dirname, '/pageNotAvailable.html'));
});

app.listen(process.env.PORT, ()=>{
    console.log('Listening from port 5000');
});

