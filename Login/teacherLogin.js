const bcrypt = require('bcrypt');

const teacherModel = require('../DatabaseModels/teacherModel');

function teacherLogin (req, res, next) {
    const authorization = req.header('Authorization');
    console.log('Authorization header', authorization);

    if (authorization == null) {
        console.log('No authorization information');
        res.header('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }

    const credentials = authorization.split(' ')[1];
    const credentialsDecoded = atob(credentials);
    const [userName, password] = credentialsDecoded.split(':');
    console.log('user name (staff number)', userName, 'password', password);

    teacherModel.findOne({staffNumber: userName}).then(result=>{
        console.log('Found teacher', result);

        if (result == null) {
            console.log('Teacher does not exists');
            res.header('WWW-Authenticate', 'Basic');
            res.sendStatus(401);
            return;
        }

        bcrypt.compare(password, result.password, (error, isPasswordMatchHash)=>{
            if (error != null) {
                console.log('check password', error);
                res.status(500).send('<h1>Please try again</h1>');
                return;
            }

            if (!isPasswordMatchHash) {
                console.log('Password not match');
                res.header('WWW-Authenticate', 'Basic');
                res.sendStatus(401);
                return;
            }

            console.log('Password match');
            req.staffNumber = userName;
            req.name = result.name;
            next();
        });
    }).catch(error=>{
        console.log('Find teacher error', error);
        res.status(500).send('<h1>Please try again</h1>');
    });
}

module.exports = teacherLogin;
