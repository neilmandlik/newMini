const con=require('../models/MysqlConnect')
const papa=require('papaparse')
const fs=require('fs')
const assignments=require('../models/Assignments')
const {handleUser}=require('./authContoller');
const { json } = require('stream/consumers');
con.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log('Connected to the MySQL database');
});

const updateMarks=(req,res)=>{
    const toPut=req.body
    if(toPut.grade!==undefined){
        query=`
        update assignment_submission1
        set marks_given="${toPut.grade}"
        where s_assignment_id="${toPut.specStudent}";
        `
        con.query(query,(err,result)=>{
            if(err){
                console.log(err)
            }
            else{
                res.json({isSuccess: true})
            }
        })
    }
    else{
        res.json({message: "Incorrect Value For grade", isSuccess: false})
    }
    
}

const seeSubmission=(req,res)=>{
    const{faid}=req.params
    let query=`
    select s_assignment_id, marks_given, student_name,assignment_file_name,submission_date,deadline_date,datediff(deadline_date,submission_date) as submissionStat from assignment_submission1 asub
    inner join assignment_allocation1 aa on aa.f_assignment_id=asub.f_assignment_id
    inner join assignment_system_student st on st.student_id=asub.student_id
    where asub.f_assignment_id=${faid};
    `
    con.query(query,(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json({
                "notSubmitted": result.filter(ele=>ele.submissionStat===null),
                "onTimeSubmission": result.filter(ele=>ele.submissionStat>=0 && ele.submissionStat!==null),
                "lateSubmission": result.filter(ele=>ele.submissionStat<0),
                "deadline_date": result[0].deadline_date
            })          
        }
    })

}

const deleteFile=(req,res)=>{
    const {fname}=req.params
    const fpath=`../../my-app-3/public/${fname}`
    fs.unlink(fpath,(err)=>{
        if(err){
            res.json({message: err})
        }
        else{
            res.json({message: "File Deleted Sucessfully"})
        }
    })
}

const semesterRegistration=(req,res)=>{
    for(k in req.files){
        const fToC=`../${req.files[k].filename}`
        const file=fs.createReadStream(fToC)
        papa.parse(file,{
            header: false,
            dynamicTyping: true,
            complete: function(res){
                console.log(res.data)
            }
        })
    }
    res.json()
}

const uploadFile=(req,res)=>{
    res.json({message: "Upload Successful"})      
}

const addNewFeedbackForm=(req,res)=>{
    const toPost=req.body
    let query=`
    call multi_stmt('
    insert into feedback_tracker values("${toPost.formNumber}","N","${toPost.year}","${toPost.formNumberForSemester}","${toPost.semester}");
    select * from sorted_feedback_questions;
    select substr(feedback_form_id,2) as fnum,isLaunched from feedback_tracker where substr(feedback_form_id,2)=(
    select max(cast(substr(feedback_form_id,2) as signed integer)) from feedback_tracker
    );');
    `

    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result)
        }
    })
}

const changeFeedbackFormState=(req,res)=>{
    const l=req.body.isLaunched
    let query=`
    call multi_stmt('
    update feedback_tracker set isLaunched="${l}" where isLaunched="${l==='D'?"Y":"N"}";
    select substr(feedback_form_id,2) as fnum,isLaunched from feedback_tracker where substr(feedback_form_id,2)=(
    select max(cast(substr(feedback_form_id,2) as signed integer)) from feedback_tracker
    );');
    `

    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result[0][0]['isLaunched'])
        }
    })
}

const updateFeedBackQuestion=(req,res)=>{
    let query=`
    call multi_stmt('
    update feedback_form set question_desc="${req.body.question_desc}" where question_id="${req.body.question_id}";
    select * from sorted_feedback_questions;');`


    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result[0])
        }
    })
}

const deleteFeedbackQuestion=(req,res)=>{
    const {qid}=req.params
    let query=`
    call multi_stmt('
    delete from feedback_form where question_id="${qid}";
    select * from sorted_feedback_questions;
    ')
    `    
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result[0])
        }
    })
}

const getAllFacultyReport=(req,res)=>{
    const{fnum}=req.params
    let query=`
    select distinct faculty_name,subject_name,class_name,truncate(avg(overall),2) as final_res from merge m
    inner join assignment_system_faculty f on f.faculty_id=m.faculty_id
    inner join assignment_system_classes c on c.class_id=m.class_id
    inner join assignment_system_subject s on s.subject_id=m.subject_id
    inner join question_responses q on q.merge_id=m.merge_id
    where q.feedback_form_id="${fnum}"
    group by m.merge_id
    order by class_name;
    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result)
        }
    })
}

const postFeedBackQuestion=(req,res)=>{
    let query=`
    call multi_stmt('
    insert into feedback_form values
    ("${req.body.question_id}","${req.body.question_desc}");
    select * from sorted_feedback_questions;
    ');
    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result[0])
        }
    })
}

const getFeedbackQuestions=(req,res)=>{
    let query=`
    call multi_stmt(
    'select * from sorted_feedback_questions;
    select substr(feedback_form_id,2) as fnum,isLaunched from feedback_tracker
    where substr(feedback_form_id,2)=(
    select max(cast(substr(feedback_form_id,2) as signed integer)) from feedback_tracker
    );');`
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result)
        }
    })
}

const getFeedbackReport=(req,res)=>{
    const{fnum,rec,recO,conf}=req.params
    if(rec===recO && recO===conf && conf==="-1"){
        let a=parseInt(fnum.slice(1,fnum.indexOf('f',2)))
        let b=parseInt(fnum.slice(fnum.indexOf('f',1)+1))
        let query=`call select_range('` 
        while(a<=b){
            query=query+`${a},` 
            a++
        }
        query=query+`;');`
        con.query(query,(error,result)=>{
            if(error){
                console.log(error)
            }
            else{
                let combine=[]
                for(let i=0;i<=result.length-2;i++){
                    combine=[...combine,...result[i]]
                }
                res.json(combine)
            }
        })
    }
    else{
        if(recO!=='0'){
            let query=""
            if(conf==='c'){
                query=`
                call multi_stmt('select * from sorted_feedback_questions where subject_type="${recO.slice(recO.length-1)==='_'?"theory":"practical"}";`
            }
            else if(conf==='p'){
                query=`
                call multi_stmt('select * from sorted_feedback_questions where subject_type="${rec.slice(rec.length-1)==='_'?"theory":"practical"}";`
            }
            query=query+`
            select * from question_responses q
            inner join merge m on m.merge_id=q.merge_id
            inner join feedback_tracker ft on ft.feedback_form_id=q.feedback_form_id
            where ${conf==='p'?`faculty_id="${rec.slice(0,rec.indexOf('p'))}" 
                and subject_id="${rec.slice(rec.indexOf('p')+1)}" 
                and class_id="${recO}"`
                :
                `class_id="${rec}" 
                and faculty_id="${recO.slice(0,recO.indexOf('p'))}" 
                and subject_id="${recO.slice(recO.indexOf('p')+1)}"`}\n`

            query=query+`
            order by cast(feedback_id as signed integer);');`
            con.query(query,(error,result)=>{
                if(error){
                    console.log(error)
                }
                else{
                    const feedArr=result[0].map((ele,ind)=>({...ele,...result[1][ind]}))
                    res.json(feedArr)
                }
            })
        }
        else{
            let query=`call multi_stmt(
            '`
            if(conf==='p'){
                query=query+`
                select m.merge_id,class_name,truncate(avg(overall),2) as final_res from merge m
                inner join assignment_system_classes c on m.class_id=c.class_id 
                inner join question_responses q on q.merge_id=m.merge_id
                inner join feedback_tracker ft on ft.feedback_form_id=q.feedback_form_id
                where faculty_id="${rec.slice(0,rec.indexOf('p'))}" and subject_id="${rec.slice(rec.indexOf('p')+1)}"
                group by m.merge_id
                order by cast(m.merge_id as signed);\n`
                query=query+`
                select m.merge_id,overall,t_r from question_responses q
                inner join merge m on m.merge_id=q.merge_id
                inner join feedback_form f on f.feedback_form_id=q.feedback_form_id and f.question_id=q.question_id
                inner join feedback_tracker ft on ft.feedback_form_id=m.feedback_form_id
                where faculty_id="${rec.slice(0,rec.indexOf('p'))}" 
                and subject_id="${rec.slice(rec.indexOf('p')+1)}"
                and f.subject_type="${rec.slice(rec.length-1)==='_'?"theory":"practical"}"
                order by cast(feedback_id as signed);\n`
            }
            else{
                query=query+`
                select fs.merge_id,faculty_name,subject_name,truncate(avg(overall),2) as final_res from merge fs 
                inner join assignment_system_faculty f on f.faculty_id=fs.faculty_id 
                inner join assignment_system_subject s on s.subject_id=fs.subject_id 
                inner join question_responses q on q.merge_id=fs.merge_id
                inner join feedback_tracker ft on ft.feedback_form_id=fs.feedback_form_id and ft.feedback_form_id=q.feedback_form_id
                where class_id="${rec}"
                group by fs.merge_id
                order by cast(fs.merge_id as signed);\n`
                query=query+`
                select m.merge_id,overall,t_r,question_id from question_responses q
                inner join merge m on m.merge_id=q.merge_id
                inner join feedback_tracker ft on ft.feedback_form_id=m.feedback_form_id and ft.feedback_form_id=q.feedback_form_id
                where class_id="${rec}"
                order by cast(feedback_id as signed); \n`
            }
            query=query+`');` 
            con.query(query,(error,result)=>{
                if(error){
                    console.log(error)
                }
                else{
                    for(let i=0;i<result[0].length;i++){
                        const r=result[1].filter((ele,ind)=>
                            ele['merge_id']===result[0][i]['merge_id']
                        )
                        for(let j=0;j<r.length;j++){
                            result[0][i][`Question ${j+1}`]=r[j]['overall']
                        }
                    }
                    res.json(result[0])
                }
            })
        }
    }
}

const getFacClassSubList=(req,res)=>{
    const{formId}=req.params
    let query1=`
    call multi_stmt('
    select * from sorted_feedback_tracker;
    select distinct substr(s.subject_id,-1) as batch, f.faculty_id,merge_id,faculty_name,subject_name,s.subject_id,class_name,c.class_id,abbreviation from merge fs
    inner join assignment_system_faculty f on fs.faculty_id=f.faculty_id
    inner join assignment_system_subject s on fs.subject_id=s.subject_id
    inner join feedback_tracker ft on ft.feedback_form_id=fs.feedback_form_id
    inner join assignment_system_classes c on fs.class_id=c.class_id
    where ${formId==='max'?"cast(substr(ft.feedback_form_id,2) as signed)=(select max(cast(substr(feedback_form_id,2) as signed integer)) from feedback_tracker)"
    :`ft.feedback_form_id="${formId}"`};');
    `
    con.query(query1,(error,resultArr)=>{
        if(error){
            console.log(error)
        }
        else{
            const result=resultArr[1]
            const uniqueFaculty = [
                ...new Set(result.map(user => JSON.stringify({faculty_name: user.faculty_name,subject_name: user.subject_name,faculty_id:user.faculty_id,subject_id:user.subject_id,abr:user.abbreviation,batch: user.batch}))) // Uses JSON string as unique identifier
            ].map(user => JSON.parse(user))
            const uniqueClass=[...new Set(result.map(ele=>JSON.stringify({class_id: ele.class_id,class_name: ele.class_name})))].map(ele=>JSON.parse(ele))
            const pairClass=uniqueFaculty.map(ele=>({[ele.faculty_id+'p'+ele.subject_id]:result.filter(a=>a.faculty_id===ele.faculty_id && a.subject_id===ele.subject_id).map(a=>[a.class_name,a.class_id])}))
            const classFaculty=uniqueClass.map(ele=>({[ele.class_id]:result.filter(a=>ele.class_id===a.class_id).map(a=>[`${a.faculty_name} for ${a.abbreviation} ${a.batch==="_"?"":a.batch}`,a.faculty_id+'p'+a.subject_id])}))
            res.json({feedbackForms: resultArr[0],faculties:uniqueFaculty,classes:uniqueClass,pairClass,classFaculty})
        }
    })
}

const putFeedback=(req,res)=>{
    const toPut=req.body
    let q=0,f=0,o=""
    let query=`call feedback_update('`
    for(i in Object.keys(toPut.selOpts)){
        q=toPut.selOpts[Object.keys(toPut.selOpts)[i]].slice(toPut.selOpts[Object.keys(toPut.selOpts)[i]].indexOf('q')+1,toPut.selOpts[Object.keys(toPut.selOpts)[i]].indexOf('f'))
        f=toPut.selOpts[Object.keys(toPut.selOpts)[i]].slice(toPut.selOpts[Object.keys(toPut.selOpts)[i]].indexOf('f')+1,toPut.selOpts[Object.keys(toPut.selOpts)[i]].indexOf('o'))
        o=toPut.arrOfRes[toPut.selOpts[Object.keys(toPut.selOpts)[i]].slice(toPut.selOpts[Object.keys(toPut.selOpts)[i]].indexOf('o')+1,toPut.selOpts[Object.keys(toPut.selOpts)[i]].length)].trim().replace(/ /g,"_")
        query=query+`${o}@${f}#${parseInt(q)+1}!;`
    }
    query=query+`');`
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json({})
        }
    })
}

const feedBackOfAStudent=(req,res)=>{
    const{username}=req.params
    let query=`
    call multi_stmt('
    select * from sorted_feedback_questions where subject_type="theory" limit 3;
    select merge_id,faculty_name,subject_name,abbreviation,class_name,subject_type from merge fs
    inner join assignment_system_faculty f on fs.faculty_id=f.faculty_id
    inner join assignment_system_subject s on fs.subject_id=s.subject_id
    inner join assignment_system_classes c on fs.class_id=c.class_id
    inner join assignment_system_student st on st.class_id=c.class_id
    inner join feedback_tracker ft on ft.feedback_form_id=fs.feedback_form_id
    where cast(substr(ft.feedback_form_id,2) as signed)=(select max(cast(substr(feedback_form_id,2) as signed)) from feedback_tracker)
    and student_name="${username}" and (substr(s.subject_id,-1)="_" or substr(s.subject_id,-1)=batch);
    select isLaunched from feedback_tracker
    where substr(feedback_form_id,2)=(
    select max(cast(substr(feedback_form_id,2) as signed integer)) from feedback_tracker
    ); 
    select * from sorted_feedback_questions where subject_type="practical" limit 3;
    ');
    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            let finalObj={faculties: result[1], questions:{theory: result[0],practical: result[3]}, isLaunched: result[2][0]['isLaunched'] }
            let sum=0
            Object.keys(finalObj.questions).forEach(ele=>{
                sum+=finalObj.faculties.filter(e=>e.subject_type===ele).length*finalObj.questions[ele].length
            })
            res.json({...finalObj,feedbackLength: sum,qlength: result[0].length+result[3].length})
        }                
    })
}

const getTableData=(req,res)=>{
    let query=`
    select s.subject_id,faculty_name,scheduled_date,allocation_date,subject_name,substr(assignment_name,-locate(" ",reverse(assignment_name))+1) as asgn_num,subject_type,class_name,fs.class_id from assignment_allocation1 aa
    inner join merge fs on aa.merge_id=fs.merge_id
    inner join assignment_system_faculty f on fs.faculty_id=f.faculty_id
    inner join assignment_system_subject s on fs.subject_id=s.subject_id
    inner join assignment_system_classes c on fs.class_id=c.class_id;
    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            const uniqueArrOfClassAndFac=result.map(a=>({class_id: a.class_id, faculty_name: a.faculty_name, subject_name: a.subject_name, subject_id: a.subject_id})).filter((a,i,self)=>i===self.findIndex(t=>t.class_id===a.class_id && t.faculty_name===a.faculty_name && t.subject_id===a.subject_id))
            let arrOfClass=[],obj={},final=[]
            for(let i=0;i<uniqueArrOfClassAndFac.length;i++){
                arrOfClass=result.filter(a=>a.faculty_name===uniqueArrOfClassAndFac[i].faculty_name && a.class_id===uniqueArrOfClassAndFac[i].class_id && a.subject_id===uniqueArrOfClassAndFac[i].subject_id)
                obj={
                    faculty_name: arrOfClass[0].faculty_name,
                    class_name: arrOfClass[0].class_name,
                    subject_name: arrOfClass[0].subject_name, 
                    subject_type: arrOfClass[0].subject_type
                }
                arrOfClass.map((a,i)=>{
                    obj[`A${a.asgn_num}`]={scheduled_date: a.scheduled_date,allocation_date: a.allocation_date}
                })
                final.push(obj)
            }
            
            res.json(final)
        
        }
    })
}


const getUser=(req,res)=>{
    const {user,password}=req.params
    if(user==="undefined"||password==="undefined"){
        return res.status(400).json({'message': "Username and password Required"})
    }
    let query=`select * from user where user_name="${user}"`
    con.query(query,(error,result)=>{
        if(error){
            console.log(`Error fetching data: ${error}`)
        }
        else{
            if(result.length===0){
                return res.status(401).json({'message':"User Not Found"})
            }
            else{
                const response=handleUser(result[0],password)
                return res.status(response.status).json({'status': response.status,'message': response.message,'desg': result[0].User_Designation})
            }
        }
    })
}

const getFloorDetails=(req,res)=>{
    const{id,dep}=req.params
    let query=`select * from floor2 where floor="${id}" and school="${dep}"`
    con.query(query,(error,result)=>{
        if(error){
            console.log(`Error fetching data: ${error}`)
        }
        else{
            res.json(result)
        }
    })
}

const showSubjectsFaculty=(req,res)=>{
    const {facName,className}=req.params
    let query=`
    select subject_name, abbreviation from assignment_system_subject s
    inner join merge m on m.subject_id=s.subject_id
    inner join assignment_system_faculty f on f.faculty_id=m.faculty_id
    inner join assignment_system_classes c on c.class_id=m.class_id
    where class_name="${className}" and faculty_name="${facName}"; 
    `

    con.query(query,(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json(result)
        }
    })
}


const showClass=(req,res)=>{
    const{user,desg}=req.params
    let query= ``
    if(desg==='faculty'){
        query=`
        select distinct class_name from assignment_system_classes c
        where class_id in (
        select class_id from merge where faculty_id=
        (select faculty_id from assignment_system_faculty where faculty_name="${user}")
        );
        `
        con.query(query,(error,result)=>{
            if(error){
                console.log(`Error fetching data: ${error}`)
            }
            else{
                res.json(result)
            }
        })
    }
    else if(desg==='student'){
        query=`
        select class_name,batch
        from assignment_system_classes c
        inner join assignment_system_student s on s.class_id=c.class_id
        inner join user u on u.user_name=s.student_name
        where user_name="${user}";
        `
        con.query(query,(error,result)=>{
            if(error){
                console.log(`Error fetching data: ${error}`)
            }
            else{
                res.json(result)
            }
        })
    }


}


const showsubjects=(req,res)=>{
    const{username}=req.params
    let query=`
    select s.subject_id,faculty_name,allocation_date,deadline_date,submission_date,marks_given,student_name,subject_name,subject_type,asub.f_assignment_id,assignment_name from assignment_submission1 asub
    inner join assignment_system_student st on st.student_id=asub.student_id
    inner join assignment_allocation1 aa on aa.f_assignment_id=asub.f_assignment_id
    inner join merge m on m.merge_id=aa.merge_id
    inner join assignment_system_faculty f on f.faculty_id=m.faculty_id
    inner join assignment_system_subject s on s.subject_id=m.subject_id
    where student_name="${username}" and (substr(s.subject_id,-1)="_" or substr(s.subject_id,-1)=batch);

    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            let arrOfSub=[...new Set(result.map(o=>o.subject_name))]
            let arrc=[],arrf=[],final=[],obj={}
            for(let k=0;k<arrOfSub.length;k++){
                arrc=result.filter((o)=>o.subject_name===arrOfSub[k])
                arrf=arrc.filter((f)=>f.subject_name===arrc[k].subject_name)
                obj={subject_name: arrf[k].subject_name,subject_type: arrf[k].subject_type,subject_id: arrf[k].subject_id}
                for(let i=0;i<arrf.length;i++){
                    const num=arrf[i]['assignment_name'].slice(arrf[i]['assignment_name'].indexOf(" ",10)+1)
                    obj[`A${num}`]={
                        deadline_date: arrf[i].deadline_date,
                        submission_date: arrf[i].submission_date,
                        marks_given: arrf[i].marks_given,                    
                    }
                }
                final.push(obj)
               
            }
        //     console.log(arrc.some(o=>o.facult))
            
        //     for(let i=0;i<arrc.length;i+=2){
        //         obj={faculty_name: arrc[i].faculty_name,subject_type: arrc[i].subject_type,subject_name: arrc[i].subject_name,class_name: arrc[i].class_name}
        //         for(let j=0;j<3;j++){
        //             obj[`A${j+1}`]={scheduled_date: arrf[j].scheduled_date,allocation_date: arrf[j].allocation_date}
        //         }
        //         final.push(obj)
        //         arrc.splice(i,2)
        //     }           
            
        res.json(final)      
        }

})
}


const subAndAssgnOfSpecClass=(req,res)=>{
    const{username,classname,subname}=req.params
    
    let query=`
    select f_assignment_id,subject_name,s.subject_id,subject_type,assignment_name,scheduled_date,isLocked,on_time,late_submission,not_submitted from assignment_allocation1 aa
    inner join merge m on m.merge_id=aa.merge_id
    inner join assignment_system_classes c on c.class_id=m.class_id
    inner join assignment_system_subject s on s.subject_id=m.subject_id
    inner join assignment_system_faculty f on m.faculty_id=f.faculty_id
    where class_name="${classname}" and faculty_name="${username}" and subject_name="${subname}";
    `    

    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            
            res.json({
                subjects: result.filter((obj,ind,self)=>ind===self.findIndex(o=>o.subject_name===obj.subject_name && o.subject_id===obj.subject_id)).map(a=>({
                    subject_batch: a.subject_id[a.subject_id.length-1]==="_"?"":a.subject_id[a.subject_id.length-1],
                    subject_name:a.subject_name,
                    subject_type: a.subject_type,
                    subject_id:a.subject_id
                })),
                Assignments:result.map(a=>({
                    subject_id: a.subject_id,
                    subject_type: a.subject_type,
                    assignment_name: a.assignment_name,
                    f_assignment_id: a.f_assignment_id,
                    scheduled_id: a.scheduled_id,
                    isLocked: a.isLocked,
                    onTime: a.on_time,
                    lateSubmit: a.late_submission,
                    notSubmit: a.not_submitted
                }))

                
            })
        }
    })

}


const addAssignments=(req,res)=>{
    try {
        let query=`
        update assignment_allocation1
        set allocation_date="${req.body.isLocked==="Locked"?`Pending`:req.body.allocation_date}",isLocked="${req.body.isLocked}",deadline_date=${req.body.isLocked==="Locked"?`"Not Given"`:`date_add(str_to_date("${req.body.allocation_date}",'%Y-%m-%d'),interval 5 day)`}
        where merge_id in (select merge_id from merge where subject_id="${req.body.subject_id}" and class_id=(select class_id from assignment_system_classes where class_name="${req.body.class_name}")) and assignment_name="${req.body.assignment_name}"
        ;
        `
        con.query(query,(error,result)=>{
            if(error){
                console.log(`Hello Error: ${error}`)
            }
            else{
                res.json({})
            }
        })
    } catch (error) {
        console.log(error, error.message)
        return res.status(500).json({error: error.message, message: "an error ocurred"})
    }
 
        
}

const unsubmitAssignment=(req,res)=>{
    const{deadlineDate,username,subid,asgn}=req.body
    const asgnnum=asgn.slice(asgn.length-1)
    let query=`
    call unsubmit_assignment("${deadlineDate}","${username}","${subid}","${asgnnum}");
    `

    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json({})
        }
    })
}

const getAssignmentDetails=(req,res)=>{
    const{user,subid,asgnnum}=req.params
    const asgn=asgnnum.slice(asgnnum.length-1)
    let query=`
    select submission_date,assignment_file_name from assignment_submission1 asub
    inner join assignment_system_student st on st.student_id=asub.student_id
    inner join assignment_allocation1 aa on aa.f_assignment_id=asub.f_assignment_id
    inner join merge m on m.merge_id=aa.merge_id
    where student_name="${user}" and subject_id="${subid}" and substring(assignment_name,-locate(' ',reverse(assignment_name))+1)='${asgn}';
    `
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json(result)
        }
    })

}

const updateAssignmentDetails=(req,res)=>{
    const{subId,username,submissionDate,deadlineDate,asgn,fileName}=req.body
    let query=`
    call update_allocation("${deadlineDate}","${submissionDate}","${username}","${subId}","${asgn}","${fileName}");
    `
    
    con.query(query,(error,result)=>{
        if(error){
            console.log(error)
        }
        else{
            res.json({})
        }
    })
        
}


const trackAssignments=(req,res)=>{
    res.json(assignments)
}


const deleteAssignments=(req,res)=>{
    const{id}=req.params
    assignments.splice(assignments.indexOf(assignments.find((a)=>a.id===id)),1)
    res.json(assignments)
}

const removeCurrentUser=(req,res)=>{
    const{user}=req.params
    con.query(`delete from currentuser where user_name="${user}";`,(error,result)=>{
        if(error){
            console.log(`Error: ${error}`)
        }
        else{
            res.json(result)
        }
    })
}

module.exports={
    updateMarks,
    seeSubmission,
    deleteFile,
    semesterRegistration,
    uploadFile,
    addNewFeedbackForm,
    changeFeedbackFormState,
    unsubmitAssignment,
    getAssignmentDetails,
    updateFeedBackQuestion,
    getAllFacultyReport,
    deleteFeedbackQuestion,
    postFeedBackQuestion,
    getFeedbackQuestions,
    getFeedbackReport,
    getFacClassSubList,
    putFeedback,
    feedBackOfAStudent,
    getTableData,
    getUser,
    removeCurrentUser,
    getFloorDetails,
    showClass,
    showSubjectsFaculty,
    showsubjects,
    subAndAssgnOfSpecClass,
    addAssignments,
    updateAssignmentDetails,
    trackAssignments,
    deleteAssignments
}



