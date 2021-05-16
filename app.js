const express=require('express');
const  bodyParser = require('body-parser')
const translate = require('@vitalets/google-translate-api');
const redis= require('redis');
const app=express();



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"));

const port=process.env.PORT || 3000;
const redis_port=process.env.PORT||6379;
const client=redis.createClient(redis_port);

app.get('/',(req,res)=>{
    res.render('index',{initial_data:'',option:'',final_data:''});
})

// app.post('/translate',(req,res)=>{
//     console.log(req.body.speech);
//     const redis_data=client.get(req.body.speech+req.body.language);
//     console.log(redis_data);
//     if(redis_data){
//         console.log('data from redis');
//         console.log(redis_data);
//     }
//     else{
//   translate(req.body.speech, {to: req.body.language}).then(response => {
//       console.log(response.text);
//       //redis part 
//       client.setex(req.body.speech+req.body.language,180,"maro data");
//     res.render('index',{data:response.text})
// }).catch(err => {
//     console.error(err);
// });
// }
// })
// function setresponse(init,final){
//     return init +" "+final;
// }

function fromapi(req,res,next){
    const {speech,language}=req.body;
    console.log(speech+" "+language);
      translate(speech, {to:language}).then(response => {
      console.log(response.text);
      const feeddata=req.body.speech+req.body.language;
      //redis part 
      client.setex(feeddata,3600,response.text);
        res.render('index',{initial_data:speech,option:language,final_data:response.text})
   // res.send(setresponse(feeddata,response.text));
    }).catch(err => {
    console.error(err);
    })
}

//cache middleware
function cache(req,res,next){
    const {speech,language}=req.body;
    const feeddata=req.body.speech+req.body.language;

    client.get(feeddata,(err,data)=>{
        if(err)throw err;
        if(data!=null){
            console.log("data "+data);
            console.log("inside caching...")
            res.render('index',{initial_data:speech,option:language,final_data:data})
            //res.send(setresponse(feeddata,data));
        }else{
            next();
        }
    })
}

app.post('/translate',cache,fromapi);

app.listen(port,()=>{
    console.log('Port running at 3000');
})