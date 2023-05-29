
const { tokenBlocklist } = require('../tokenBlocklist');

module.exports = (token) => {
  
    if (token) {
        tokenBlocklist.push(token);
        console.log(`The token ${token} Expired Successfully`)
      }

  
};

