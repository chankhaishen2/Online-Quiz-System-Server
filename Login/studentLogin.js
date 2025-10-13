const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const studentModel = require('../DatabaseModels/studentModel');

function studentLogin (req, res) {
    console.log('user name (matriculation number)', req.matriculationNumber, 'password', req.password);

    studentModel.findOne({matriculationNumber: req.matriculationNumber}).then(result=>{
        console.log('Found student', result);

        if (result == null) {
            console.log('Student does not exists');
            res.sendStatus(401);
            return;
        }

        bcrypt.compare(req.password, result.password, (error, isPasswordMatchHash)=>{
            if (error != null) {
                console.log('check password', error);
                res.sendStatus(500);
                return;
            }

            if (!isPasswordMatchHash) {
                console.log('Password not match');
                res.sendStatus(401);
                return;
            }

            console.log('Password match');

            const user = {
                matriculationNumber: req.matriculationNumber,
                name: result.name
            };

            const token = jwt.sign(user, process.env.SECRETKEY, {expiresIn: '4h'});
            console.log('Token: ', token);
            res.status(200).json({
                token: token
            });
        });
    }).catch(error=>{
        console.log('Find student error', error);
        res.sendStatus(500);
    });
}

module.exports = studentLogin;
