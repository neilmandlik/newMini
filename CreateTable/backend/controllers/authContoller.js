// const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require('dotenv').config()
const con=require("../models/MysqlConnect")
con.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log('Connected to the MySQL database');
});


const handleUser=(foundUser,password)=>{
    // const match=await bcrypt.compare(password, foundUser.User_Password)
    if(password===foundUser.User_Password){

        const accessToken=jwt.sign(
            {"username": foundUser.user_name},
            process.env.ACCESS_TOKEN,
            {expiresIn: '30s'}
        )
        const refreshToken=jwt.sign(
            {"username": foundUser.user_name},
            process.env.REFRESH_TOKEN,
            {expiresIn: '1d'}
        )
        const currentUser=refreshToken
        const query=`
        insert into currentUser values
        ("${foundUser.user_name}","${currentUser}");
        `
        con.query(query,(error,result)=>{
            if(error){
                console.log(`Error: ${error}`)
            }
        })
        return {
            status: 200,
            message: "The user has been logged in"
        }
    }
    else{
        return{
            status: 401,
            message: "Invalid Password"

        }
    }
}

module.exports={handleUser}
