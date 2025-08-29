const bcrypt = require('bcrypt');

const administratorModel = require('../DatabaseModels/administratorModel');

function administratorLogin (req, res, next) {
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
    console.log('user name', userName, 'password', password);

    administratorModel.findOne({userName: userName}).then(result=>{
        console.log('Found administrator', result);

        if (result == null) {
            console.log('Administrator does not exists');
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
            req.userName = userName;
            next();
        });
    }).catch(error=>{
        console.log('Find administrator', error);
        res.status(500).send('<h1>Please try again</h1>');
    });
}

module.exports = administratorLogin;
