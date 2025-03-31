const papa=require('papaparse')
const fs=require('fs')
const mysql=require('mysql2')
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


// let query=`
// call multi_stmt('
// select student_id,class_id from assignment_system_student;
// select f_assignment_id,merge_id from assignment_allocation1;
// select class_id from assignment_system_classes;
// select merge_id,class_id from merge; 
// ');
// `

// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         let m=[],f=[],k=0
//         query=`s_assignment_id,student_id,f_assignment_id,submission_date,marks_given\n`
//         for(let i=0;i<result[0].length;i++){
//             m=result[3].filter(ele=>ele.class_id===result[0][i].class_id)
//             f=m.map(ele=>result[1].filter(a=>ele.merge_id===a.merge_id))
//             for(let j=0;j<m.length;j++){
//                 for(let a=0;a<f[j].length;a++){
//                     query=query+`${k+1},${Number(result[0][i]['student_id'])},${f[j][a]['f_assignment_id']},Not Submitted,-\n`
//                     k++
//                 }
//             }
//         }
//         console.log(query)
//     }
// })


// let query=`
// call multi_stmt('
// select * from merge;
// select subject_id,subject_type from assignment_system_subject;
// select class_id from assignment_system_classes;'
// );
// `
// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         let k=0
//         query=`f_assignment_id,merge_id,scheduled_date,allocation_date,assignment_name,isLocked,deadline_date\n`
        
//         for(let i=0;i<result[2].length;i++){
//             const m=result[0].filter(ele=>i+1===Number(ele['class_id']))
//             const s=m.map(ele=>result[1].filter(a=>a.subject_id===ele.subject_id))
//             for(let j=0;j<s.length;j++){
//                 const t=s[j][0].subject_type
//                 if(t==='theory'){
//                     for(let a=0;a<3;a++){
//                         query=query+`${k+1},${(Number(m[j].merge_id))},2024-10-31,Pending,${t} assignment ${a+1},Locked,Not Given\n`
//                         k++
//                     }
//                 } 
//                 else{
//                     for(let a=0;a<5;a++){
//                         query=query+`${k+1},${(Number(m[j].merge_id))},2024-10-31,Pending,${t} assignment ${a+1},Locked,Not Given\n`
//                         k++
//                     }
//                 }             
//             }         
//         }
//         console.log(query)
//     }
// })

// // let query=``
// let csvline=`student_id,f_assignment_id,submission_date,marks_given\n`
// let k=1
// // console.log(csvline)


// query=`
// call multi_stmt('
// select f_assignment_id,m.subject_id,m.class_id from assignment_allocation1 aa 
// inner join merge m on m.merge_id=aa.merge_id;
// select class_id,student_id,batch from assignment_system_student;
// ')
// `
// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         // for(let j=0;j<result.length;j++){
//         //     csvline=`${k+1},${i<=8?`0${i+1}`:`${i+1}`},${result[j].f_assignment_id},Not Submitted,-`
//         //     console.log(csvline)
//         //     k++
//         // }
//         for(let i=0;i<result[1].length;i++){
//             let arr=result[0].filter((ele,ind)=>ele.class_id===result[1][i].class_id && (ele.subject_id[ele.subject_id.length-1]===result[1][i]['batch'] || ele.subject_id[ele.subject_id.length-1]==="_"))
//             for(let j=0;j<arr.length;j++){
//                 csvline=csvline+`${k},${result[1][i]['student_id']},${arr[j]['f_assignment_id']},Not Submitted,-\n`
//                 k++
//             }
                        
//         }
//         // console.log(result)
//         console.log(csvline)
//     }
// })
// console.log(query)
// console.log(csvline)



// let query=`select class_id,th1,th2,pr1 from assignment_system_classes;`
// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         let k=1
//         query=`feedback_id,class_id,pair_id,Not_Satisfied,Neutral,Satisfied,Very_Satisfied\n`
//         for(let i=0;i<5;i++){
//             for(let j=0;j<3;j++){
//                 query=query+`${k},0${i+1},${j!==2?result[i][`th${j+1}`]:result[i][`pr1`]},0,0,0,0\n`
//                 k++
//             }
//         }
//         console.log(query)
//     }
// })



let questions=[
    'Explain the subject in simple language',
    'Conducts lectures regularly, and sincerely and insists on discipline.',
    'Use appropriate teaching aids to enhance understanding and learning capacity.',
    'Takes sufficient effort to simplify difficult problems/concepts.',
    'Give inputs for the content beyond the syllabus related to the subject.',
    'Provide adequate course material (like Book references, notes etc.)',
    'Use diverse assessment techniques (such as case study assignments, competitions, presentations, etc.) to foster student achievement and enhance their skills and competencies.',
    'Conduct the periodic assessment based on student understanding of course content and achieving course objectives.',
    'Interactive, Caring, Approachable and having a mentor attitude.',
    'Is the content of the subject/course sufficient to gain the fundamentals and conceptual knowledge from a lifelong perspective?'
]

// let query=`insert into feedback_form values\n`
// for(let i=0;i<10;i++){
//     if(i===9){
//         query=query+`(${i+1},'question${i+1}','${questions[i]}','T','f1');`
//     }
//     else{
//         query=query+`(${i+1},'question${i+1}','${questions[i]}','T','f1'),\n`
//     }
// }
// console.log(query)




// let str="q0f0o8"
// console.log(str.slice(str.indexOf("o")+1))
// console.log(str.slice(str.indexOf('q')+1,str.indexOf('f')))


// let query=`
//     update question_responses set Not_Satisfied="00",Neutral="00",Satisfied="00",Very_Satisfied="00",t_r="00",overall="00";
//     `

//     con.query(query,(error,result)=>{
//         if(error){
//             console.log(error)
//         }
//     })




// let alter=``

// for(let i=2;i<11;i++){
//     alter=alter+`alter table question${i} add column t_r varchar(100) default "00";alter table question${i} add column overall varchar(100) default "00";`
// }

// let query=`
//     call multi_stmt(
//     '${alter}'
// )
// `
// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         null
//     }
// })





// const str='Neil sokdldwij'
// console.log(str.slice(0,3))

// const arr=[1,2,3,4,5]
// console.log(arr.indexOf(3))
// console.log(arr.slice(1).map((ele,ind)=>ind))

// const obje={1: "Neil",2: "Yash",3:"Rajesh",4:"Vaibhavee"}
// console.log(obje.find(ele=>Object.keys()))

// const o=[{1:"Hi"},{2:"Class"}]
// const a=[[{3:"Wassup"},{3:"Wass"}],[{3:"Wassup"},{3:"Wass"}],[{3:"Wassup"},{3:"Wass"}],[{3:"Wassup"},{3:"Wass"}],[{3:"Wassup"},{3:"Wass"}]]

// o.map((ele,ind)=>a.map((b,i)=>ele[`q${i+1}`]=b[ind][3]))

// console.log(o)


// let a=[1,2,3]
// let k=8
// for(let i=0;i<k;i++){
//     a=[a.pop(),...a]
// }

// console.log(a)

// const name="01p01"
// console.log(name.slice(name.indexOf('p')+1))

// insert into feedback_questions values
//     ('question1','Explains the subject in simple language'),                                                                                                                                      
//      ('question10','Is the content of the subject/course sufficient to gain the fundamentals and conceptual knowledge from a lifelong perspective?'),                                                 
//      ('question2','Conducts lectures regularly, and sincerely and insists on discipline.'),                                                                                                          
//      ('question3','Uses appropriate teaching aids to enhance understanding and learning capacity.'),                                                                                                 
//      ('question4','Takes sufficient effort to simplify difficult problems/concepts.'),                                                                                                                
//      ('question5','Gives inputs for the content beyond the syllabus related to the subject.'),                                                                                                        
//      ('question6','Provides adequate course material (like Book references, notes etc.)'),                                                                                                    
//      ('question7',"Uses diverse assessment techniques (such as case study assignments, competitions, presentations, etc.) to foster student achievement and enhance their skills and competencies."),
//      ('question8',"Conducts a periodic assessment based on student understanding of course content and achieving course objectives."),                                                 
//      ('question9',"Interactive, Caring, Approachable and having a mentor attitude.");



// let query=`select merge_id from merge;`

// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         query=`feedback_id,merge_id,Not_Satisfied,Neutral,Satisfied,Very_Satisfied,t_r,overall\n`
//         let k=0
//         for(let i=0;i<result.length;i++){
//             query=query+`${k+1},${result[i].merge_id},00,00,00,00,00,00\n`
//             k++
//         }    
//         console.log(query)    
//     }})


// let query=`
// call multi_stmt('
// drop table question1;
// drop table question2;
// drop table question3;
// drop table question4;
// drop table question5;
// drop table question6;
// drop table question7;
// drop table question8;
// drop table question9;
// drop table question10;
// ');
// `

// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         null
//     }
// })




// let query=`feedback_id,question_id,merge_id,Not_Satisfied,Neutral,Satisfied,Very_Satisfied,t_r,overall\n`
// let k=0
// for(let i=0;i<10;i++){
//     for(j=0;j<23;j++){
//         query=query+`${k+1},question${i+1},${j+1},00,00,00,00,00,00\n`
//         k++
//     }
// }
// console.log(query)



// `
// update question_responses set not_satisfied="00",neutral="00",satisfied="00",very_satisfied="00",t_r="00",overall="00";
// `




// let query=`insert into exp values\n`
// for(let i=0;i<18;i++){
//     query=query+`("${i<9?`0${i+1}`:i+1}","00")${i===17?";":","}\n`   
// }

// console.log(query)



// const question_arr=[
//     `Explain the primary functions of an operating system and discuss how it manages hardware
// resources effectively.`,
// `Describe the main components of a computer system and explain how they interact with
// each other to perform computing tasks.`,
//  `Explain the differences between a monolithic kernel and a microkernel. Discuss the
// advantages and disadvantages of each approach.`,
//  `Explain what a system call is and how it works. Provide examples of common system calls in
// UNIX-like operating systems and describe their purposes.`,
//  `Identify the main categories of system calls. Describe how file management system calls
// differ from process control system calls, providing examples for each.`,
//  `What are system programs, and how do they differ from application programs? Provide
// examples of common system programs and explain their roles in an operating system.`,
//  `Discuss the key considerations in designing an operating system. How do operating systems
// achieve portability and compatibility across different hardware platforms?`,
//  `Describe the concept of virtual machines. Compare type 1 and type 2 hypervisors, explaining
// their roles in virtual machine architecture and their respective advantages and
// disadvantages.`,
// `How do system programs differ from application programs?`,
//  `What are some examples of common system programs?`
// ]

// let query=''

// for(let i=0;i<10;i++){
//     query=query+`${i+1},01_,theory assignment 1,${question_arr[i]}\n`
// }

// console.log(query)


// const query=`
// select * from merge where cast(merge_id as signed)<=23;
// `
// con.query(query,(error,result)=>{
//     if(error){
//         console.log(error)
//     }
//     else{
//         let stmt=`insert into merge values\n`
//         let num=70
//         for(let i=0;i<result.length;i++){
//             stmt=stmt+`('${num}','${result[i].class_id}','${result[i].subject_id}','${result[i].faculty_id}','2025-26','2')${i===result.length-1?";":","}\n`
//             num++
//         }
//         console.log(stmt)
//     }
// })

// let query=`select * from prac;`

// con.query(query,(err,res)=>{
//     if(err){
//         console.log(err)
//     }
//     else{
//         console.log(res[4]['question_desc'])

//     }
// })


// const file="./Questions.csv"

// const f=fs.createReadStream(file)

// let query="insert into prac values\n"

// let k=0

// papa.parse(f,{
//     header: false,
//     dynamicTyping: true,
//     complete: function(res){
//         let str=res.data[0][1]
//         for(let i=0;i<res.data.length;i++){
//             if(res.data[i][0]===null){
//                 if(res.data[i][1]!==null){
//                     str=str+"\n"+res.data[i][1]
//                 }
//             }
//             else{
//                 k++
//                 query=query+`(${k},'${str}')${i===res.data.length-1?';':','}\n`
//                 str=res.data[i][1]
//             } 
//         }
//         console.log(query)
//     }
// })


// con.query('select f_assignment_id,merge_id,assignment_name from assignment_allocation1',(err,res)=>{
//     if(err){
//         console.log(err)
//     }
//     else{
//         for(let i=0;i<res.length;i++){
//             let query=`update assignment_allocation1 set not_submitted=(select count(s_assignment_id) from assignment_submission1 where f_assignment_id="${res[i].f_assignment_id}") where f_assignment_id="${res[i].f_assignment_id}";\n\n\n`
//             con.query(query,(err,result)=>{
//                 if(err){
//                     console.log(err)
//                 }
//                 else{
//                     console.log("cool")
//                 }
//             })
            
//         }
//     }
// })


// let query=``
// for(let i=0;i<10;i++){
//     query=query+`update feedback_form\n set question_id='question${i+1}' where `
// }



// let a={
//     '1': "Neil",
//     '6': "Yash",
//     '5': "Ishant",
//     '2': "Aryan",
    
// }

// for(i in Object.keys(a)){
//     console.log(Object.keys(a)[i])
// }


let a="[2025-03-22 09:47] name: Neil surname: Mandlik"
console.log(a.slice(a.indexOf(':',3)))




















