'use strict';

/**
 * Module dependencies.
 */
 var nodemailer = require('nodemailer');
 var transporter = nodemailer.createTransport('smtps://coreada.project%40gmail.com:madjid1980@smtp.gmail.com');
module.exports = function(Project) {

    return {
        
        sendFeedback: function(req, res) {

            // setup e-mail data with unicode symbols
var mailOptions = {
    from:req.body.name + ' &lt;' + req.body.email + '&gt;', 
    to: 'coreada.project@gmail.com', // list of receivers
    subject: 'Website contact form',
    text:req.body.message,
    html: req.body.message
};
// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});

  mailOpts = {
      from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      to: 'coreada.project@gmail.com',
      subject: 'Website contact form',
      text: req.body.message
  };
 

        },
    };
}
