const { error } = require('console');
const papa=require('papaparse')
const fs=require('fs')
const mysql=require('mysql2')

const fileToConvert="./assignment submission2.csv"
let tableName=""

for(let i=fileToConvert.length-5;i>=1;i--){
    if(fileToConvert[i]==='/'){
        break;
    }
    else{
        tableName=fileToConvert[i]+tableName
    }
}


const file=fs.createReadStream(fileToConvert)

const con=mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'NRM@@@#@!%',
        database: 'mini'
});

con.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log('Connected to the MySQL database');
});


papa.parse(file,{
    header: false,
    dynamicTyping: true,
    complete: function(results) {

        const corrected=(original)=>{
            let correct=""
            for(let i=0;i<original.trim().length;i++){
                if(original.trim()[i]===" "){
                    correct+="_"
                }
                else{
                    correct+=original.trim()[i]
                }
            }
        
            return correct
        }

        const padzero=(a)=>{
            let query=""
            if(typeof(a)==='number'){
                if(a<10){
                    a=a.toString()
                    a="0"+a                      
                }                    
            }
            return a           
        }

        let i=0,j=0;

        const r=results.data
        let query=`create table ${corrected(tableName)}(\n`

        for(i=0;i<r[0].length;i++){        
            query=query+corrected(r[0][i])+` varchar(200),\n`            
        }

        query=query+`PRIMARY KEY(${corrected(r[0][0])}));`

        con.query(query,(error,res)=>{
            if(error){
                console.log(`Error fetching data: ${error}`)
            }  
        })

        query=`insert into ${corrected(tableName)} values\n`
        for(i=1;i<r.length;i++){
            query=query+'('
            for(j=0;j<r[i].length-1;j++){
                query=query+`"`+padzero(r[i][j])+`"`+","
            }
            query=query+`"`+padzero(r[i][j])+`"`+`)${i===r.length-1?";":","}\n`
        }
        con.query(query,(error,res)=>{
            if(error){
                console.log(`Error fetching data: ${error}`)
            }
        })
    }
    
})

module.exports={tableName}








